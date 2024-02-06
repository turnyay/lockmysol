use anchor_lang::prelude::*;

use anchor_lang::solana_program::{
    program::{invoke, invoke_signed},
    system_instruction
};

use crate::state::*;
use crate::constants::*;
use crate::error::LockMySolError;

#[derive(Accounts)]
#[instruction(lock_token_id_count: u64)]
pub struct UnlockToken<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [
            SOL_ESCROW_SEED.as_ref(),
            user.key().as_ref(),
            lock_token_id_count.to_le_bytes().as_ref()
        ],
        bump,
    )]
    /// CHECK: PDA
    pub escrow_account: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [
            LOCK_ACCOUNT.as_ref(),
            user.key().as_ref(),
            lock_token_id_count.to_le_bytes().as_ref()
        ],
        bump,
    )]
    pub lock_account: Account<'info, LockAccountSol>,
    pub system_program: Program<'info, System>,
}

pub fn unlock_token(ctx: Context<UnlockToken>, lock_token_id_count: u64) -> Result<()> {

    // Accounts:
    // 1 - signer
    // 2 - PDA to store SOL (user pk + "solana-escrow")
    // 3 - PDA LockAccount: state, owner, lockUntilTime, etc

    let lock_account = &mut ctx.accounts.lock_account;

    // msg!("state is {}", lock_account.state);
    if lock_account.state != 1 {
        return Err(LockMySolError::InvalidState.into());
    }

    let now = Clock::get()?.unix_timestamp as u64;
    msg!("now is {}", now);
    msg!("unlock_time is {}", lock_account.unlock_time);
    msg!("now <= lock_account.unlock_time {}", now <= lock_account.unlock_time);

    if now <= lock_account.unlock_time {
        return Err(LockMySolError::TooEarlyToUnlock.into());
        // let diff =  lock_account.unlock_time.checked_sub(now).unwrap();
        // msg!("*** ERROR *** unable to unlock, time diff is: {} seconds", diff);
    }

    if now > lock_account.unlock_time {
        msg!("time has passed ok");

        // confirm escrow balance = acc amt?
        let id_bytes = lock_token_id_count.to_le_bytes();
        let bump = ctx.bumps.escrow_account;
        let user_key = &ctx.accounts.user.key();
        let signer_seeds: &[&[_]] = &[
            SOL_ESCROW_SEED.as_ref(),
            user_key.as_ref(),
            id_bytes.as_ref(),
            &[bump],
        ];
        
        // transfer SOL
        invoke_signed(
            &system_instruction::transfer(
                &ctx.accounts.escrow_account.key(),
                &ctx.accounts.user.key(),
                lock_account.amount
            ),
            &[
                ctx.accounts.escrow_account.to_account_info().clone(),
                ctx.accounts.user.to_account_info().clone(),
                ctx.accounts.system_program.to_account_info().clone(),
            ],
            &[&signer_seeds],
        )?;

        lock_account.state = 2;         // completed
        lock_account.amount = 0;        // ???????????????? do this?
        lock_account.unlock_time = 0;   // ???????????????? do this?
    }

    Ok(())
}