import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { supabase } from '../../../src/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Check if it's a data URL
    if (!image.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image format' });
    }

    // Convert data URL to buffer
    const base64Data = image.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Determine file extension from data URL
    const mimeType = image.split(';')[0].split(':')[1];
    const extension = mimeType.split('/')[1] || 'jpg';
    
    // Generate unique filename
    const filename = `${session.user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${extension}`;

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('listing-images')
      .upload(filename, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: mimeType
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ error: 'Failed to upload image' });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('listing-images')
      .getPublicUrl(filename);

    return res.status(200).json({
      url: urlData.publicUrl,
      filename: filename
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
