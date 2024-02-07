use anchor_lang::prelude::*;

use anchor_lang::solana_program::{
    program::{invoke, invoke_signed},
    system_instruction
};

use anchor_spl::token::{Mint, Token, TokenAccount};
use anchor_spl::associated_token::AssociatedToken;

use crate::state::*;
use crate::constants::*;
use crate::error::LockMySolError;

#[derive(Accounts)]
#[instruction(lock_token_id_count: u64)]
pub struct LockTokenForTime<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [
            USER_ACCOUNT.as_ref(),
            user.key().as_ref(),
        ],
        bump,
    )]
    pub user_account: Account<'info, UserAccount>,
    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = user,
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = user,
        associated_token::mint = token_mint,
        associated_token::authority = lock_account,
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    pub token_mint: Account<'info, Mint>,
    #[account(
        init,
        seeds = [
            LOCK_ACCOUNT.as_ref(),
            user.key().as_ref(),
            lock_token_id_count.to_le_bytes().as_ref()
        ],
        bump,
        payer = user,
        space = LockAccountToken::LEN,
    )]
    pub lock_account: Account<'info, LockAccountToken>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn lock_token_for_time(
    ctx: Context<LockTokenForTime>,
    lock_token_id_count: u64,
    amount_token: u64,
    duration_in_seconds: u64
) -> Result<()> {

    // Accounts:
    // 1 - signer
    // 2 - PDA to store SOL (user pk + "solana-escrow")
    // 3 - PDA LockAccount: state, owner, lockUntilTime, etc

    // Pass in: amount_token, duration in seconds

    let user_account = &mut ctx.accounts.user_account;
    if lock_token_id_count != user_account.lock_token_id_count {
        return Err(LockMySolError::InvalidLockId.into());
    }
    user_account.lock_token_id_count += 1;  // starts at 1, goes to u64::MAX

    let now = Clock::get()?.unix_timestamp as u64;
    let lock_account = &mut ctx.accounts.lock_account;
    lock_account.owner = *ctx.accounts.user.key;
    lock_account.state = 1; // locked
    lock_account.amount = amount_token;
    lock_account.token_mint = ctx.accounts.token_mint.key();
    lock_account.unlock_time = now.checked_add(duration_in_seconds).unwrap();
    lock_account.bump = ctx.bumps.lock_account;

    // transfer Tokens
    let transfer_instr = spl_token::instruction::transfer(
        &spl_token::ID,
        &ctx.accounts.user_token_account.key(),    // Source 
        &ctx.accounts.escrow_token_account.key(),  // Destination 
        &ctx.accounts.user.key(),
        &[],
        amount_token,
    )?;
    let account_infos = &[
        ctx.accounts.user_token_account.to_account_info().clone(),
        ctx.accounts.escrow_token_account.to_account_info().clone(),
        ctx.accounts.user.to_account_info().clone(),
        ctx.accounts.token_program.to_account_info().clone(),
    ];
    invoke_signed(
        &transfer_instr,
        account_infos,
        &[],
    )?;

    Ok(())
}