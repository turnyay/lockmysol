use anchor_lang::prelude::*;

use crate::constants::*;

#[account]
pub struct UserAccount {
    pub owner: Pubkey,
    pub lock_sol_id_count: u64,
    pub lock_token_id_count: u64,
    pub created_at: i64,
    pub bump: u8,
}

impl UserAccount {
    pub const LEN: usize = ANCHOR_DISC_LEN
        + 32                                    // owner
        + (8 * 3)                               // id count, created_at
        + (1);                                  // bump
}
