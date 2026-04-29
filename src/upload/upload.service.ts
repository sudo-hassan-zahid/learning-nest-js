import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaService } from '../prisma/prisma.service.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

@Injectable()
export class UploadService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadFile(file: Express.Multer.File, uploadedById: string) {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, WebP and GIF are allowed');
    }
    if (file.size > MAX_SIZE) {
      throw new BadRequestException('File exceeds 5 MB limit');
    }

    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: 'blog' }, (err, res) =>
            err || !res ? reject(err) : resolve(res),
          )
          .end(file.buffer);
      },
    );

    return this.prisma.db.media.create({
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        mimetype: file.mimetype,
        size: file.size,
        uploadedById,
      },
    });
  }
}
