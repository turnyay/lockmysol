const assert = require("assert");

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Lockmysol } from "../target/types/lockmysol";
import LockmysolProgram from "./LockmysolProgram.js";

// import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

    const success = await lockmysol.lockSolForTime(1, 123456789, 30);

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
      assert((diff == 29 || diff == 30), "unlockTime is not correct");
    }
  });

  it("Is able to lock solana a SECOND TIME ", async () => {

    const success = await lockmysol.lockSolForTime(2, 999999, 30);

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
      assert((diff == 30 || diff == 29), "unlockTime is not correct");
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
      assert((diff == 28 || diff == 29), "unlockTime is not correct");
    }
  });

  it("Is able to unlock solana", async () => {
    
    console.log(" waiting 30s...")
    await sleep(31000)
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
      assert(lockAccount.amount.toString() == '0', "Amount is not correct");
      assert(lockAccount.unlockTime.toString() == '0', "unlockTime is not correct");
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
      assert(lockAccount.amount.toString() == '0', "Amount is not correct");
      assert(lockAccount.unlockTime.toString() == '0', "unlockTime is not correct");
    }
  });

  it("Is able to lock tokens", async () => {
    
    const success = await lockmysol.lockTokenForTime(1, 123456789, 30);

    assert(success, "Tx should SUCCEED");
    if (success) {
      console.log('locked tokens ok');
    }

  });

  it("Is able to unlock tokens", async () => {

    console.log(" waiting 30s...")
    await sleep(31000)
    console.log(" unlocking...")

    const success = await lockmysol.unlockToken(1);

    assert(success, "Tx should SUCCEED");
    if (success) {
      console.log('unlocked tokens ok');
    }
  });
});
