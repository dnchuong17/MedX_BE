import * as nacl from 'tweetnacl';
import bs58 from 'bs58';
import { PublicKey } from '@solana/web3.js';

export function verifySolanaSignature(
  walletAddress: string,
  message: string,
  signature: string,
): boolean {
  try {
    const pubKeyBytes = new PublicKey(walletAddress).toBytes();
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signature);

    return nacl.sign.detached.verify(messageBytes, signatureBytes, pubKeyBytes);
  } catch (err) {
    console.error('Error verifying signature:', err);
    return false;
  }
}
