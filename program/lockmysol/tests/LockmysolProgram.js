import * as anchor from "@coral-xyz/anchor";

import {
    longToByteArray,
    createAssociatedTokenAccountInstruction,
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
import { TOKEN_PROGRAM_ID, Token, TokenInstructions, AccountLayout, createMint, mintTo } from "@solana/spl-token";
const { Connection, PublicKey, Keypair, SystemProgram, Transaction, TransactionInstruction } = require('@solana/web3.js');

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

    async createTokenMint() {


    }

    getUserTokenAccount(mint) {
        let userTokenAccount;
        [userTokenAccount] = PublicKey.findProgramAddressSync(
            [this.provider.wallet.publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
            ASSOCIATED_TOKEN_PROGRAM_ID
        );
        return userTokenAccount;
    }

    getEscrowTokenAccount(lockAccountPda, mint) {
        let escrowTokenAccount;
        [escrowTokenAccount] = PublicKey.findProgramAddressSync(
            [lockAccountPda.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
            ASSOCIATED_TOKEN_PROGRAM_ID
        );
        return escrowTokenAccount;
    }

    async mintTokens(mint, tokenAccount, amount) {
        const txid = await mintTo(
            this.provider.connection,
            this.provider.wallet,
            mint,
            tokenAccount,
            this.provider.wallet, // auth
            amount
        );
        return txid;
    }

    async createATokenAccount(mint) {
        const userTokenAccount = this.getUserTokenAccount(mint);
        const tx = new anchor.web3.Transaction();
        const ix = await createAssociatedTokenAccountInstruction(
            userTokenAccount,
            this.provider.wallet.publicKey,
            this.provider.wallet.publicKey,
            mint
        );
        tx.add(ix);
        const txid = await this.provider.sendAndConfirm(tx);
        console.log("   Create user token account successfully: %s", txid);
    }

    async lockTokenForTime(lockId, tokenMint, amount, durationInSeconds) {

        const lockAccountPda = this.getLockAccountPda(lockId);
        const userAccountPda = this.getUserAccountPda();
        const userTokenAccount = this.getUserTokenAccount(tokenMint);
        const escrowTokenAccount = this.getEscrowTokenAccount(lockAccountPda, tokenMint);

        const ix = await this.program.methods.lockTokenForTime(
            new anchor.BN(lockId),
            new anchor.BN(amount),
            new anchor.BN(durationInSeconds),
        ).accounts({
            user: this.provider.wallet.publicKey,
            userAccount: userAccountPda,
            userTokenAccount: userTokenAccount,
            escrowTokenAccount: escrowTokenAccount,
            tokenMint: tokenMint,
            lockAccount: lockAccountPda,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
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

    async createMint(decimals) {
        const connection = this.provider.connection;
        const provider = this.provider;
        // Generate a new mint account
        const mintPayer = Keypair.generate();
        // Get airdrop for txs
        provider.connection.requestAirdrop(mintPayer.publicKey, 1000000000);
        await sleep(1000)
        const tokenMint = await createMint(
            connection,
            mintPayer,
            provider.wallet.publicKey,
            null,
            decimals
        );
        return tokenMint;
    }
}

export default LockmysolProgram;