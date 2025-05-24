import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import * as process from 'process';
import { NestExpressApplication } from '@nestjs/platform-express';
import fs from 'fs';
import bs58 from 'bs58';
import { Keypair } from '@solana/web3.js';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const keypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(process.env.SOLANA_WALLET_SECRET_KEY!)),
  );
  console.log('✅ Backend wallet:', keypair.publicKey.toBase58());
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      tls: {},
    },
  });
  await app.startAllMicroservices();

  const base58 =
    '2opXQXwbQME83AiofoFrSuigtVkSoDvfqfi2abZCg3kZd6zxrKTLDdfx4EXqBAUBDDgr9dvM7Cj2XNWmk85QujoD';

  // Decode ra Buffer 64 byte
  const secretKey = bs58.decode(base58);

  // Xác nhận đúng độ dài
  if (secretKey.length !== 64) {
    console.error('Expected 64 bytes, got', secretKey.length);
    process.exit(1);
  }

  // Viết ra file JSON
  fs.writeFileSync(
    'phantom-wallet.json',
    JSON.stringify(Array.from(secretKey), null, 2),
  );

  console.log('Wrote phantom-wallet.json');

  app.use(helmet());
  app.use(cookieParser());
  app.use(compression());
  app.enableCors({
    origin: ['http://localhost:3001'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(process.env.PORT_SERVER ?? 3000);
  logger.log(`Application is running on: http://localhost:3000`);
}
bootstrap();
