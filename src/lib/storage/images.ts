import { supabase } from '../supabase';

export interface UploadResult {
  url: string;
  filename: string;
  error?: string;
}

/**
 * Upload an image file to Supabase storage
 */
export async function uploadImage(file: File, userId: string): Promise<UploadResult> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('listing-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return { url: '', filename: '', error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('listing-images')
      .getPublicUrl(fileName);

    return {
      url: urlData.publicUrl,
      filename: fileName
    };
  } catch (error: any) {
    console.error('Upload error:', error);
    return { url: '', filename: '', error: error.message };
  }
}

/**
 * Upload multiple images
 */
export async function uploadImages(files: File[], userId: string): Promise<UploadResult[]> {
  const uploadPromises = files.map(file => uploadImage(file, userId));
  return Promise.all(uploadPromises);
}

/**
 * Delete an image from storage
 */
export async function deleteImage(filename: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('listing-images')
      .remove([filename]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}