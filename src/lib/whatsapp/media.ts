import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface MediaUploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export async function downloadMedia(mediaUrl: string, mediaId: string): Promise<string> {
  try {
    // Download the media file
    const fileResponse = await axios.get(mediaUrl, {
      responseType: 'arraybuffer'
    });
    
    const buffer = Buffer.from(fileResponse.data);
    const mimeType = fileResponse.headers['content-type'] || 'image/jpeg';
    const filename = `media-${mediaId}-${Date.now()}.${getFileExtension(mimeType)}`;
    
    // Upload to configured storage service
    const uploadResult = await uploadToStorage(buffer, filename, mimeType);
    
    return uploadResult.url;
  } catch (error) {
    console.error('Error downloading media:', error);
    return '';
  }
}

async function uploadToStorage(buffer: Buffer, filename: string, mimeType: string): Promise<MediaUploadResult> {
  const storageProvider = process.env.STORAGE_PROVIDER || 'local';
  
  switch (storageProvider.toLowerCase()) {
    case 'cloudinary':
      return await uploadToCloudinary(buffer, filename, mimeType);
    case 's3':
      return await uploadToS3(buffer, filename, mimeType);
    case 'local':
    default:
      return await uploadToLocal(buffer, filename, mimeType);
  }
}

async function uploadToCloudinary(buffer: Buffer, filename: string, mimeType: string): Promise<MediaUploadResult> {
  // Check if Cloudinary is configured
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    console.log('Cloudinary not configured, falling back to local storage');
    return await uploadToLocal(buffer, filename, mimeType);
  }

  try {
    // Use eval to avoid TypeScript import resolution at build time
    const cloudinary = await eval('import("cloudinary")').catch(() => {
      throw new Error('Cloudinary package not installed');
    });
    
    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    return new Promise((resolve, reject) => {
      cloudinary.v2.uploader.upload_stream(
        {
          resource_type: 'auto',
          public_id: `gatorex/listings/${filename}`,
          folder: 'gatorex/listings'
        },
        (error: any, result: any) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              url: result.secure_url,
              filename: result.public_id,
              size: result.bytes,
              mimeType
            });
          } else {
            reject(new Error('No result from Cloudinary'));
          }
        }
      ).end(buffer);
    });
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    // Fallback to local storage
    return await uploadToLocal(buffer, filename, mimeType);
  }
}

async function uploadToS3(buffer: Buffer, filename: string, mimeType: string): Promise<MediaUploadResult> {
  // Check if AWS is configured
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.log('AWS credentials not configured, falling back to local storage');
    return await uploadToLocal(buffer, filename, mimeType);
  }

  try {
    // Use eval to avoid TypeScript import resolution at build time
    const AWS = await eval('import("aws-sdk")').catch(() => {
      throw new Error('AWS SDK not installed');
    });
    
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET || 'gatorex-media',
      Key: `listings/${filename}`,
      Body: buffer,
      ContentType: mimeType,
      ACL: 'public-read'
    };

    const result = await s3.upload(uploadParams).promise();
    
    return {
      url: result.Location,
      filename: result.Key,
      size: buffer.length,
      mimeType
    };
  } catch (error) {
    console.error('S3 upload failed:', error);
    // Fallback to local storage
    return await uploadToLocal(buffer, filename, mimeType);
  }
}

async function uploadToLocal(buffer: Buffer, filename: string, mimeType: string): Promise<MediaUploadResult> {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'listings');
    await fs.mkdir(uploadsDir, { recursive: true });
    
    // Write file to local storage
    const filePath = path.join(uploadsDir, filename);
    await fs.writeFile(filePath, buffer);
    
    // Return public URL
    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/uploads/listings/${filename}`;
    
    return {
      url: publicUrl,
      filename,
      size: buffer.length,
      mimeType
    };
  } catch (error) {
    console.error('Local upload failed:', error);
    // Return a placeholder URL as last resort
    return {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/placeholder-image.jpg`,
      filename: 'placeholder.jpg',
      size: 0,
      mimeType: 'image/jpeg'
    };
  }
}

function getFileExtension(mimeType: string): string {
  const extensions: { [key: string]: string } = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'video/mp4': 'mp4',
    'video/quicktime': 'mov'
  };
  
  return extensions[mimeType] || 'jpg';
}

export async function saveImageToListing(listingId: string, imageUrl: string, filename: string): Promise<void> {
  try {
    await prisma.image.create({
      data: {
        listingId,
        url: imageUrl,
        filename
      }
    });
  } catch (error) {
    console.error('Failed to save image to listing:', error);
  }
}

export function isValidImageType(mimeType: string): boolean {
  const validTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  return validTypes.includes(mimeType);
}