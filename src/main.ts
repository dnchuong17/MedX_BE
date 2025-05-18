import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import * as process from 'process';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as nacl from 'tweetnacl';
import bs58 from 'bs58';
import { Keypair } from '@solana/web3.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const keypair = Keypair.generate();

  const message = 'Login to MedX at 2025-05-18T15:00:00Z';
  const messageBytes = new TextEncoder().encode(message);

  const signatureBytes = nacl.sign.detached(messageBytes, keypair.secretKey);

  const signature = bs58.encode(signatureBytes);

  console.log('✅ wallet_address:', keypair.publicKey.toBase58());
  console.log('✅ message:', message);
  console.log('✅ signature:', signature);
  app.use(helmet());
  app.use(cookieParser());
  app.use(compression());
  app.enableCors({
    origin: ['http://localhost:3001'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(process.env.PORT_SERVER ?? 3000);
}
bootstrap();
