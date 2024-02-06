use anchor_lang::prelude::*;

use anchor_lang::solana_program::{
    program::{invoke, invoke_signed},
    system_instruction
};

use crate::state::*;
use crate::constants::*;
use crate::error::LockMySolError;

#[derive(Accounts)]
pub struct CreateUserAccount<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        init,
        seeds = [
            USER_ACCOUNT.as_ref(),
            user.key().as_ref(),
        ],
        bump,
        space = UserAccount::LEN,
        payer = user
    )]
    pub user_account: Account<'info, UserAccount>,
    pub system_program: Program<'info, System>,
}

pub fn create_user_account(ctx: Context<CreateUserAccount>) -> Result<()> {

    // Accounts:
    // 1 - signer
    // 2 - PDA UserAccount: owner, ID_COUNT

    let now = Clock::get()?.unix_timestamp;
    let user_account = &mut ctx.accounts.user_account;
    user_account.owner = *ctx.accounts.user.key;
    user_account.lock_sol_id_count = 1;
    user_account.lock_token_id_count = 1;
    user_account.created_at = now;

    Ok(())
}