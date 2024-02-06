use anchor_lang::prelude::*;

use crate::constants::*;

#[account]
pub struct LockAccountToken {
    pub owner: Pubkey,
    pub state: u8,
    pub amount: u64,
    pub token_mint: Pubkey,
    pub unlock_time: u64,
    pub bump: u8,
}

impl LockAccountToken {
    pub const LEN: usize = ANCHOR_DISC_LEN
        + (32 * 2)                              // owner, mint
        + (8 * 2)                               // amount, time
        + (1)                                   // state
        + (1);                                  // bump
}

