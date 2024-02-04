import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Lockmysol } from "../target/types/lockmysol";
import LockmysolProgram from "./LockmysolProgram.js";

// import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";

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

  it("Is able to lock solana", async () => {

    // Get airdrop for txs
    provider.connection.requestAirdrop(provider.wallet.publicKey, 10000000000);

    const success = await lockmysol.lockSolForTime(12345678, 30);

    // get lock account and confirm
  });

  it("Is able to unlock solana", async () => {
    const tx = await program.methods.unlockSol().rpc();
    console.log("Unlocking SOL txid: ", tx);
  });

  it("Is able to lock tokens", async () => {
    const tx = await program.methods.lockTokensForTime().rpc();
    console.log("Locking Tokens txid: ", tx);
  });

  it("Is able to lock solana", async () => {
    const tx = await program.methods.unlockTokens().rpc();
    console.log("Locking SOL txid: ", tx);
  });
});
