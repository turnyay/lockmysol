const assert = require("assert");

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Lockmysol } from "../target/types/lockmysol";
import LockmysolProgram from "./LockmysolProgram.js";
import { createMint, createInitializeMintInstruction, mintTo,  TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";


// import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const WAIT_TIME = 5;

const programId = new anchor.web3.PublicKey("5b6JMVrHatTdGFnHtKb2iuBquDmspYsPq1HLKifS8QHA");

describe("lockmysol", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Lockmysol as Program<Lockmysol>;

  const lockmysol = new LockmysolProgram({
    provider: provider,
    programId: programId,
    program: program,
  });

  it("Is able to create user account", async () => {

    // Get airdrop for txs
    provider.connection.requestAirdrop(provider.wallet.publicKey, 10000000000);

    const success = await lockmysol.createUserAccount();

    assert(success, "Tx should SUCCEED");
    if (success) {
      // log the lock account data
      const userAccount = await lockmysol.getUserAccount();
      console.log("user Owner: ", userAccount.owner.toBase58());
      console.log("user lock sol id count: ", userAccount.lockSolIdCount.toString());
      console.log("user lock token id count: ", userAccount.lockTokenIdCount.toString());

      assert(userAccount.owner.toBase58() == provider.wallet.publicKey.toBase58(), "Owner is not correct");
      assert(userAccount.lockSolIdCount.toString() == '1', "lockSolIdCount is not correct");
      assert(userAccount.lockTokenIdCount.toString() == '1', "lockTokenIdCount is not correct");
    }
  });

  it("Is able to lock solana", async () => {

    const success = await lockmysol.lockSolForTime(1, 123456789, WAIT_TIME);

    assert(success, "Tx should SUCCEED");
    if (success) {
      // log the lock account data
      const lockAccountPda = lockmysol.getLockAccountPda(1);
      const lockAccount = await program.account.lockAccountSol.fetch(lockAccountPda);
      console.log("Lock Owner: ", lockAccount.owner.toBase58());
      console.log("Lock amount base units: ", lockAccount.amount.toString());
      console.log("Lock state: ", lockAccount.state);
      console.log("Lock until: ", lockAccount.unlockTime.toString());
      const diff = parseInt(lockAccount.unlockTime.toString()) - Math.floor(Date.now() / 1000);
      console.log("Unlocking in ", diff, " seconds!");

      assert(lockAccount.owner.toBase58() == provider.wallet.publicKey.toBase58(), "Owner is not correct");
      assert(lockAccount.state == 1, "State is not correct");
      assert(lockAccount.amount.toString() == '123456789', "Amount is not correct");
      assert((diff == WAIT_TIME || diff == (WAIT_TIME - 1)), "unlockTime is not correct");
    }
  });

  it("Is able to lock solana a SECOND TIME ", async () => {

    const success = await lockmysol.lockSolForTime(2, 999999, WAIT_TIME);

    assert(success, "Tx should SUCCEED");
    if (success) {
      // log the lock account data
      const lockAccountPda = lockmysol.getLockAccountPda(2);
      const lockAccount = await program.account.lockAccountSol.fetch(lockAccountPda);
      console.log("Lock Owner: ", lockAccount.owner.toBase58());
      console.log("Lock amount base units: ", lockAccount.amount.toString());
      console.log("Lock state: ", lockAccount.state);
      console.log("Lock until: ", lockAccount.unlockTime.toString());
      const diff = parseInt(lockAccount.unlockTime.toString()) - Math.floor(Date.now() / 1000);
      console.log("Unlocking in ", diff, " seconds!");

      assert(lockAccount.owner.toBase58() == provider.wallet.publicKey.toBase58(), "Owner is not correct");
      assert(lockAccount.state == 1, "State is not correct");
      assert(lockAccount.amount.toString() == '999999', "Amount is not correct");
      assert((diff == WAIT_TIME || diff == (WAIT_TIME - 1)), "unlockTime is not correct");
    }
  });

  it("Is ***NOT*** able to unlock solana", async () => {
    
    const success = await lockmysol.unlockSol(1);

    assert(!success, "Tx should FAIL");
    if (!success) {
      // log the lock account data
      const lockAccountPda = lockmysol.getLockAccountPda(1);
      const lockAccount = await program.account.lockAccountSol.fetch(lockAccountPda);
      console.log("Lock Owner: ", lockAccount.owner.toBase58());
      console.log("Lock amount base units: ", lockAccount.amount.toString());
      console.log("Lock state: ", lockAccount.state);
      console.log("Lock until: ", lockAccount.unlockTime.toString());
      const diff = parseInt(lockAccount.unlockTime.toString()) - Math.floor(Date.now() / 1000);
      console.log("Unlocking in ", diff, " seconds!");

      assert(lockAccount.owner.toBase58() == provider.wallet.publicKey.toBase58(), "Owner is not correct");
      assert(lockAccount.state == 1, "State is not correct");
      assert(lockAccount.amount.toString() == '123456789', "Amount is not correct");
      // assert((diff == WAIT_TIME || diff == (WAIT_TIME - 1)), "unlockTime is not correct");
    }
  });

  it("Is able to unlock solana", async () => {
    
    console.log(" waiting WAIT_TIME (s)...")
    await sleep((WAIT_TIME * 1000) + 1000)
    console.log(" unlocking...")

    const success = await lockmysol.unlockSol(1);

    assert(success, "Tx should SUCCEED");
    if (success) {
      // log the lock account data
      const lockAccountPda = lockmysol.getLockAccountPda(1);
      const lockAccount = await program.account.lockAccountSol.fetch(lockAccountPda);
      console.log("Lock Owner: ", lockAccount.owner.toBase58());
      console.log("Lock amount base units: ", lockAccount.amount.toString());
      console.log("Lock state: ", lockAccount.state);
      console.log("Lock until: ", lockAccount.unlockTime.toString());

      assert(lockAccount.owner.toBase58() == provider.wallet.publicKey.toBase58(), "Owner is not correct");
      assert(lockAccount.state == 2, "State is not correct");
    }
  });

  it("Is able to unlock solana for SECOND LOCK", async () => {

    const success = await lockmysol.unlockSol(2);

    assert(success, "Tx should SUCCEED");
    if (success) {
      // log the lock account data
      const lockAccountPda = lockmysol.getLockAccountPda(2);
      const lockAccount = await program.account.lockAccountSol.fetch(lockAccountPda);
      console.log("Lock Owner: ", lockAccount.owner.toBase58());
      console.log("Lock amount base units: ", lockAccount.amount.toString());
      console.log("Lock state: ", lockAccount.state);
      console.log("Lock until: ", lockAccount.unlockTime.toString());

      assert(lockAccount.owner.toBase58() == provider.wallet.publicKey.toBase58(), "Owner is not correct");
      assert(lockAccount.state == 2, "State is not correct");
    }
  });

  it("Is able to lock tokens", async () => {

    console.log("waiting to create mint....    ");
    await sleep(1000)
    console.log("creating mint");
    let testMint;
    try {
      // create token mint
      testMint = await lockmysol.createMint(9, 1000000000);
      console.log("Mint pubkey: " + testMint);
    } catch (e) {
      console.log(e)
    }

    // const initializeMintInstr = await createInitializeMintInstruction(
    //   testMint, 8, 
    // )
    
    // console.log("MINT:");
    // console.log(testMint);

    // const pk = new PublicKey(testMint.toBase58());
    // console.log(pk);

    // // create user token account
    // await lockmysol.createATokenAccount(testMint);

    // console.log("minting tokens... ");

    // // mint user tokens
    // const userTokenAccount = lockmysol.getUserTokenAccount(pk); 
    // await lockmysol.mintTokens(pk, userTokenAccount, 10000000000);

    // console.log("locking tokens... ");

    // // lock tokens
    // const success = await lockmysol.lockTokenForTime(1, pk, 123456789, WAIT_TIME);

    // assert(success, "Tx should SUCCEED");
    // if (success) {
    //   console.log('locked tokens ok');
    // }

  });

  // it("Is able to unlock tokens", async () => {
  //   console.log(" waiting WAIT_TIME (s)...")
  //   await sleep(WAIT_TIME * 1000 + 500)
  //   console.log(" unlocking...")
  //   const success = await lockmysol.unlockToken(1);
  //   assert(success, "Tx should SUCCEED");
  //   if (success) {
  //     console.log('unlocked tokens ok');
  //   }
  // });
});
