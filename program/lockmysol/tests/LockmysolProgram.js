import * as anchor from "@coral-xyz/anchor";
import {
    PublicKey,
    SYSVAR_RENT_PUBKEY,
    LAMPORTS_PER_SOL,
    Connection
} from "@solana/web3.js";
import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID
} from "@solana/spl-token";

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/*****************************************************************
    
    Lockmysol Program

******************************************************************/
class LockmysolProgram {

    constructor(data) {
        this.provider = data.provider;
        this.program = data.program;
        this.programId = new PublicKey(data.programId);
    }

    getEscrowPda() {
        const [pda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("SOLANA-ESCROW"),
                this.provider.wallet.publicKey.toBuffer(),
            ],
            this.program.programId
        );
        return pda;
    }

    getLockAccountPda() {
        const [pda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("LOCK-ACCOUNT"),
                this.provider.wallet.publicKey.toBuffer(),
            ],
            this.program.programId
        );
        return pda;
    }

    async lockSolForTime(amount, durationInSeconds) {

        const escrowPda = this.getEscrowPda();
        const lockAccountPda = this.getLockAccountPda();

        const ix = await this.program.methods.lockSolForTime(
            new anchor.BN(amount),
            new anchor.BN(durationInSeconds),
        ).accounts({
            user: this.provider.wallet.publicKey,
            escrowAccount: escrowPda,
            lockAccount: lockAccountPda,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).instruction();
        let tx = new anchor.web3.Transaction();
        tx.add(ix);
        let success = false;
        try {
            const txid = await this.provider.sendAndConfirm(tx);
            console.log("   Lock SOL successfully: %s", txid);
            success = true;
        } catch (err) {
            console.log("   Lock SOL error: %s", err);
        }
        return success;
    }

}

export default LockmysolProgram;