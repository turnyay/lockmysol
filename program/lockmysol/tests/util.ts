import { web3, BN } from "@coral-xyz/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  AccountMeta
} from "@solana/web3.js";

export function longToByteArray(long: number): number[] {
    const byteArray = [0, 0, 0, 0, 0, 0, 0, 0];
    for (let index = 0; index < byteArray.length; index += 1) {
        const byte = long & 0xff;
        byteArray[index] = byte;
        long = (long - byte) / 256;
    }
    return byteArray;
}

export function byteArrayToString(array: number[]): string {
    return String.fromCharCode(...array);
}
  
export function stringToByteArray(str: string, length: number): any[] {
    if (str.length > length) {
        return null;
    }
    let byteArray = [];
    for (let i = 0; i < length; i += 1) {
        let code = 32;
        if (i < str.length) {
        code = str.charCodeAt(i);
        }
        byteArray = byteArray.concat([code]);
    }
    return byteArray;
}

export class Numberu32 extends BN {
    /**
     * Convert to Buffer representation
     */
    toBuffer() {
      const a = super.toArray().reverse();
      const b = Buffer.from(a);
      if (b.length === 4) {
        return b;
      }
  
      const zeroPad = Buffer.alloc(4);
      b.copy(zeroPad);
      return zeroPad;
    }
  
    /**
     * Construct a Numberu32 from Buffer representation
     */
    static fromBuffer(buffer) {
      return new BN(
        [...buffer]
          .reverse()
          .map((i) => `00${i.toString(16)}`.slice(-2))
          .join(''),
        16
      );
    }
  }
  
  /**
   * Request more compute units for solana transcations
   */
  export async function createRequestUnitsInstruction(
    payer: web3.PublicKey
  ): Promise<web3.TransactionInstruction> {
    const maxUnits = new Numberu32(1000000);
    // const fee = new Numberu32(0);
    const instruction0 = Buffer.from([2]);
    return new web3.TransactionInstruction({
      keys: [{ pubkey: payer, isSigner: true, isWritable: true }],
      programId: new web3.PublicKey(
        'ComputeBudget111111111111111111111111111111'
      ),
      data: Buffer.concat([instruction0, maxUnits.toBuffer()]),
    });
  }

export async function createAssociatedTokenAccountInstruction(
    associatedTokenAccount: web3.PublicKey,
    payer: web3.PublicKey,
    owner: web3.PublicKey,
    mint: web3.PublicKey
  ): Promise<web3.TransactionInstruction> {
    const keys: AccountMeta[] = [
      {
        pubkey: payer,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: associatedTokenAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: owner,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: mint,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: web3.SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: web3.SYSVAR_RENT_PUBKEY,
        isSigner: false,
        isWritable: false,
      },
    ];
    return new web3.TransactionInstruction({
      keys: keys,
      programId: ASSOCIATED_TOKEN_PROGRAM_ID,
      data: Buffer.from([]),
    });
}

export async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
