import { Injectable } from '@nestjs/common';
import * as anchor from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import * as process from 'node:process';
import { AnchorProvider, Wallet } from '@coral-xyz/anchor';
import * as idl from '../utils/smart_contract.json';

@Injectable()
export class BlockchainService {
  private provider: anchor.Provider;
  private program: anchor.Program;

  constructor() {
    const connection = new Connection('https://api.devnet.solana.com');

    const secretKey = process.env.SOLANA_WALLET_SECRET_KEY;
    if (!secretKey) {
      throw new Error('SOLANA_WALLET_SECRET_KEY is not set');
    }

    const keypair = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(secretKey)),
    );
    const wallet = new Wallet(keypair);

    this.provider = new AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
    });

    this.program = new anchor.Program(idl, this.provider);
  }

  async grantAccess(
    record: PublicKey,
    viewer: PublicKey,
    owner: PublicKey,
  ): Promise<string> {
    const accessControlPDA = PublicKey.findProgramAddressSync(
      [Buffer.from('access'), record.toBuffer(), viewer.toBuffer()],
      this.program.programId,
    )[0];

    const ix = await this.program.methods
      .grantAccess()
      .accounts({
        record,
        accessControl: accessControlPDA,
        owner,
        viewer,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .instruction();

    const tx = new Transaction().add(ix);
    tx.feePayer = owner;
    tx.recentBlockhash = (
      await this.provider.connection.getLatestBlockhash()
    ).blockhash;

    return tx.serialize({ requireAllSignatures: false }).toString('base64');
  }

  async revokeAccess(
    record: PublicKey,
    viewer: PublicKey,
    owner: PublicKey,
  ): Promise<string> {
    const accessControlPDA = PublicKey.findProgramAddressSync(
      [Buffer.from('access'), record.toBuffer(), viewer.toBuffer()],
      this.program.programId,
    )[0];

    const ix = await this.program.methods
      .revokeAccess()
      .accounts({
        record,
        viewer,
        owner,
        accessControl: accessControlPDA,
      })
      .instruction();

    const latestBlockhash = await this.provider.connection.getLatestBlockhash();

    const tx = new Transaction({
      feePayer: owner,
      recentBlockhash: latestBlockhash.blockhash,
    }).add(ix);

    return tx.serialize({ requireAllSignatures: false }).toString('base64');
  }

  async uploadRecord(
    recordId: string,
    metadataHash: string,
    user: PublicKey,
  ): Promise<string> {
    const recordPDA = PublicKey.findProgramAddressSync(
      [Buffer.from(recordId), user.toBuffer()],
      this.program.programId,
    )[0];

    const ix = await this.program.methods
      .uploadRecord(recordId, metadataHash)
      .accounts({
        record: recordPDA,
        user,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .instruction();

    const latestBlockhash = await this.provider.connection.getLatestBlockhash();

    const tx = new Transaction({
      feePayer: user,
      recentBlockhash: latestBlockhash.blockhash,
    }).add(ix);

    return tx.serialize({ requireAllSignatures: false }).toString('base64');
  }
}
