import { Injectable } from '@nestjs/common';
import * as vision from '@google-cloud/vision';

@Injectable()
export class GoogleVisionService {
  private client: vision.ImageAnnotatorClient;

  constructor() {
    this.client = new vision.ImageAnnotatorClient();
  }

  async labelDetection(imageBuffer: Buffer) {
    const [result] = await this.client.labelDetection({
      image: { content: imageBuffer },
    });
    return result.labelAnnotations || [];
  }
}
