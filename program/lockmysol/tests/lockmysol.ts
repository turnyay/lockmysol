import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Lockmysol } from "../target/types/lockmysol";

describe("lockmysol", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Lockmysol as Program<Lockmysol>;

  it("Is able to lock solana", async () => {
    const tx = await program.methods.lockSolForTime().rpc();
    console.log("Locking SOL txid: ", tx);
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
