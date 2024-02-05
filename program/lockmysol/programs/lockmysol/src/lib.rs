use anchor_lang::prelude::*;

pub mod instructions;
pub mod constants;
pub mod state;
pub mod error;

pub use instructions::*;
pub use constants::*;
pub use state::*;
pub use error::*;

use anchor_lang::solana_program::{
    program::{invoke, invoke_signed},
    system_instruction
};

declare_id!("5b6JMVrHatTdGFnHtKb2iuBquDmspYsPq1HLKifS8QHA");

#[program]
pub mod lockmysol {
    use super::*;

    pub fn lock_sol_for_time(ctx: Context<LockSolForTime>, amount_sol: u64, duration_in_seconds: u64) -> Result<()> {
        instructions::lock_sol_for_time(ctx, amount_sol, duration_in_seconds)
    }

    pub fn unlock_sol(ctx: Context<UnlockSol>) -> Result<()> {
        instructions::unlock_sol(ctx)
    }

    pub fn lock_tokens_for_time(ctx: Context<LockTokensForTime>) -> Result<()> {
        Ok(())
    }

    pub fn unlock_tokens(ctx: Context<UnlockTokens>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct LockTokensForTime {}

#[derive(Accounts)]
pub struct UnlockTokens {}
