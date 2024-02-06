import * as anchor from "@coral-xyz/anchor";

import {
    longToByteArray,
  } from "./util";
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

/*****************************************************************
    
    Lockmysol Program

******************************************************************/
class LockmysolProgram {

    constructor(data) {
        this.provider = data.provider;
        this.program = data.program;
        this.programId = new PublicKey(data.programId);
    }

    getUserAccountPda() {
        const [pda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("USER-ACCOUNT"),
                this.provider.wallet.publicKey.toBuffer(),
            ],
            this.program.programId
        );
        return pda;
    }

    async getUserAccount() {
        const userAccountPda = this.getUserAccountPda();
        const userAccount = await this.program.account.userAccount.fetch(userAccountPda);
        return userAccount;
    }

    getLockAccountPda(lockId) {
        const [pda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("LOCK-ACCOUNT"),
                this.provider.wallet.publicKey.toBuffer(),
                longToByteArray(lockId),
            ],
            this.program.programId
        );
        return pda;
    }

    getEscrowPda(lockId) {
        const [pda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("SOLANA-ESCROW"),
                this.provider.wallet.publicKey.toBuffer(),
                longToByteArray(lockId),
            ],
            this.program.programId
        );
        return pda;
    }

    async createUserAccount() {
        const userAccountPda = this.getUserAccountPda();
        const ix = await this.program.methods.createUserAccount().accounts({
            user: this.provider.wallet.publicKey,
            userAccount: userAccountPda,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).instruction();
        let tx = new anchor.web3.Transaction();
        tx.add(ix);
        let success = false;
        try {
            const txid = await this.provider.sendAndConfirm(tx);
            console.log("   Create User Account successfully: %s", txid);
            success = true;
        } catch (err) {
            console.log("   Create User Account error: %s", err);
        }
        return success;
    }

    async lockSolForTime(lockId, amount, durationInSeconds) {
        
        const escrowPda = this.getEscrowPda(lockId);
        const lockAccountPda = this.getLockAccountPda(lockId);
        const userAccountPda = this.getUserAccountPda();

        const ix = await this.program.methods.lockSolForTime(
            new anchor.BN(lockId),
            new anchor.BN(amount),
            new anchor.BN(durationInSeconds),
        ).accounts({
            user: this.provider.wallet.publicKey,
            userAccount: userAccountPda,
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

    async unlockSol(lockId) {

        const escrowPda = this.getEscrowPda(lockId);
        const lockAccountPda = this.getLockAccountPda(lockId);
        const userAccountPda = this.getUserAccountPda();

        const ix = await this.program.methods.unlockSol(
            new anchor.BN(lockId)
        ).accounts({
            user: this.provider.wallet.publicKey,
            userAccount: userAccountPda,
            escrowAccount: escrowPda,
            lockAccount: lockAccountPda,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).instruction();
        let tx = new anchor.web3.Transaction();
        tx.add(ix);
        let success = false;
        try {
            const txid = await this.provider.sendAndConfirm(tx);
            console.log("   Unlock SOL successfully: %s", txid);
            success = true;
        } catch (err) {
            console.log("   Unlock SOL error: %s", err);
        }
        return success;
    }
    async lockTokenForTime(lockId, tokenMint, amount, durationInSeconds) {
        
        const escrowPda = this.getEscrowPda(lockId, tokenMint);
        const lockAccountPda = this.getLockAccountPda(lockId);
        const userAccountPda = this.getUserAccountPda();

        const ix = await this.program.methods.lockTokenForTime(
            new anchor.BN(lockId),
            new anchor.BN(amount),
            new anchor.BN(durationInSeconds),
        ).accounts({
            user: this.provider.wallet.publicKey,
            userAccount: userAccountPda,
            tokenMint: tokenMint,
            escrowAccount: escrowPda,
            lockAccount: lockAccountPda,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).instruction();
        let tx = new anchor.web3.Transaction();
        tx.add(ix);
        let success = false;
        try {
            const txid = await this.provider.sendAndConfirm(tx);
            console.log("   Lock Token successfully: %s", txid);
            success = true;
        } catch (err) {
            console.log("   Lock Token error: %s", err);
        }
        return success;
    }

    async unlockToken(lockId) {

        const escrowPda = this.getEscrowPda(lockId);
        const lockAccountPda = this.getLockAccountPda(lockId);
        const userAccountPda = this.getUserAccountPda();

        const ix = await this.program.methods.unlockToken(
            new anchor.BN(lockId)
        ).accounts({
            user: this.provider.wallet.publicKey,
            userAccount: userAccountPda,
            escrowAccount: escrowPda,
            lockAccount: lockAccountPda,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).instruction();
        let tx = new anchor.web3.Transaction();
        tx.add(ix);
        let success = false;
        try {
            const txid = await this.provider.sendAndConfirm(tx);
            console.log("   Unlock Token successfully: %s", txid);
            success = true;
        } catch (err) {
            console.log("   Unlock Token error: %s", err);
        }
        return success;
    }

}

export default LockmysolProgram;