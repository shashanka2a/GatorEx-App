import axios from 'axios';

export async function downloadWhatsAppMedia(mediaId: string): Promise<string> {
  try {
    // Get media URL from WhatsApp
    const mediaResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${mediaId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`
        }
      }
    );
    
    const mediaUrl = mediaResponse.data.url;
    
    // Download the actual media file
    const fileResponse = await axios.get(mediaUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`
      },
      responseType: 'arraybuffer'
    });
    
    // In production, you'd upload this to S3/Cloudinary
    // For now, we'll return a placeholder URL
    const filename = `whatsapp-media-${mediaId}-${Date.now()}`;
    
    // TODO: Implement actual file upload to your storage service
    // const uploadedUrl = await uploadToStorage(fileResponse.data, filename);
    
    return `https://your-storage.com/${filename}`;
  } catch (error) {
    console.error('Error downloading WhatsApp media:', error);
    return '';
  }
}