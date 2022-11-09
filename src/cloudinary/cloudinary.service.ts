import { Injectable } from '@nestjs/common';
import * as cloundinary from 'cloudinary';
import * as toStream from 'buffer-to-stream';

@Injectable()
export class CloudinaryService {
  async uploadFile(file: Express.Multer.File) {
    const result = await new Promise((resolve, reject) => {
      const upload = cloundinary.v2.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        resolve(result);
      });

      toStream(file.buffer).pipe(upload);
    });

    return (result as { secure_url: string }).secure_url;
  }
}
