import { Injectable } from '@nestjs/common';
import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
} from '@solana/spl-token';

@Injectable()
export class TokenService {
  private connection: Connection;
  private adminKeypair: Keypair;
  private mintPublicKey: PublicKey;

  constructor() {
    const secretKey = process.env.SOLANA_WALLET_SECRET_KEY;
    if (!secretKey) {
      throw new Error('SOLANA_WALLET_SECRET_KEY is missing');
    }

    this.adminKeypair = Keypair.fromSecretKey(
      Buffer.from(JSON.parse(secretKey)),
    );

    const programId = process.env.MINT_ADDRESS;
    if (!programId) {
      throw new Error('PROGRAM_ID is missing');
    }

    this.mintPublicKey = new PublicKey(programId);

    this.connection = new Connection(
      'https://api.devnet.solana.com',
      'confirmed',
    );
  }
  async sendTokenToUser(
    userWalletAddress: string,
    amount: number,
  ): Promise<string> {
    const destinationPublicKey = new PublicKey(userWalletAddress);

    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      this.connection,
      this.adminKeypair,
      this.mintPublicKey,
      this.adminKeypair.publicKey,
    );

    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      this.connection,
      this.adminKeypair,
      this.mintPublicKey,
      destinationPublicKey,
    );

    const transaction = new Transaction().add(
      createTransferInstruction(
        fromTokenAccount.address,
        toTokenAccount.address,
        this.adminKeypair.publicKey,
        amount,
      ),
    );

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.adminKeypair],
    );

    return signature;
  }
}
