use anchor_lang::prelude::*;

pub mod constants;
pub mod state;

pub use constants::*;
pub use state::*;

use anchor_lang::solana_program::{
    program::{invoke, invoke_signed},
    system_instruction
};

declare_id!("5b6JMVrHatTdGFnHtKb2iuBquDmspYsPq1HLKifS8QHA");

#[program]
pub mod lockmysol {
    use super::*;

    pub fn lock_sol_for_time(ctx: Context<LockSolForTime>, amount_sol: u64, duration_in_seconds: u64) -> Result<()> {

        // Accounts:
        // 1 - signer
        // 2 - PDA to store SOL (user pk + "solana-escrow")
        // 3 - PDA LockAccount: state, owner, lockUntilTime, etc

        // Pass in: duration in seconds

        let now = Clock::get()?.unix_timestamp as u64;
        let lock_account = &mut ctx.accounts.lock_account;
        lock_account.owner = *ctx.accounts.user.key;
        lock_account.state = 1; // locked
        lock_account.amount = amount_sol;
        lock_account.unlock_time = now.checked_add(duration_in_seconds).unwrap();
        lock_account.bump = ctx.bumps.lock_account;

        // transfer SOL
        invoke_signed(
            &system_instruction::transfer(
                &ctx.accounts.user.key(),
                &ctx.accounts.escrow_account.key(),
                amount_sol
            ),
            &[
                ctx.accounts.user.to_account_info().clone(),
                ctx.accounts.escrow_account.to_account_info().clone(),
                ctx.accounts.system_program.to_account_info().clone(),
            ],
            &[]
        )?;

        if duration_in_seconds == 0 {
            lock_account.state = 2; // unlocked
        }

        Ok(())
    }

    pub fn unlock_sol(ctx: Context<UnlockSol>) -> Result<()> {
        Ok(())
    }

    pub fn lock_tokens_for_time(ctx: Context<LockTokensForTime>) -> Result<()> {
        Ok(())
    }

    pub fn unlock_tokens(ctx: Context<UnlockTokens>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct LockSolForTime<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [
            SOL_ESCROW_SEED.as_ref(),
            user.key().as_ref(),
        ],
        bump,
    )]
    /// CHECK: PDA
    pub escrow_account: AccountInfo<'info>,
    #[account(
        init,
        seeds = [
            LOCK_ACCOUNT.as_ref(),
            user.key().as_ref(),
        ],
        bump,
        payer = user,
        space = LockAccountSol::LEN,
    )]
    pub lock_account: Account<'info, LockAccountSol>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UnlockSol {}

#[derive(Accounts)]
pub struct LockTokensForTime {}

#[derive(Accounts)]
pub struct UnlockTokens {}
