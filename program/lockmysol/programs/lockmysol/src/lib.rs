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

    pub fn create_user_account(ctx: Context<CreateUserAccount>) -> Result<()> {
        instructions::create_user_account(ctx)
    }

    pub fn lock_sol_for_time(ctx: Context<LockSolForTime>, lock_sol_id_count: u64, amount_sol: u64, duration_in_seconds: u64) -> Result<()> {
        instructions::lock_sol_for_time(ctx, lock_sol_id_count, amount_sol, duration_in_seconds)
    }

    pub fn unlock_sol(ctx: Context<UnlockSol>, lock_sol_id_count: u64) -> Result<()> {
        instructions::unlock_sol(ctx, lock_sol_id_count)
    }

    pub fn lock_token_for_time(ctx: Context<LockTokenForTime>, lock_token_id_count: u64, amount_token: u64, duration_in_seconds: u64) -> Result<()> {
        instructions::lock_token_for_time(ctx, lock_token_id_count, amount_token, duration_in_seconds)
    }

    pub fn unlock_token(ctx: Context<UnlockToken>, lock_token_id_count: u64) -> Result<()> {
        instructions::unlock_token(ctx, lock_token_id_count)
    }
}
