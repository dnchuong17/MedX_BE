import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API_KEY,
      api_secret: process.env.CLOUD_SECRETE_KEY,
    });
  }

  uploadImage(
    buffer: Buffer,
    folder = 'health-news',
  ): Promise<{ url: string; public_id: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result: UploadApiResponse | undefined) => {
          if (error) {
            return reject(new InternalServerErrorException(error.message));
          }
          if (!result) {
            return reject(
              new InternalServerErrorException(
                'No result returned from Cloudinary',
              ),
            );
          }
          resolve({ url: result.secure_url, public_id: result.public_id });
        },
      );
      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }
}
