use anchor_lang::prelude::*;

use crate::constants::*;

#[account]
pub struct LockAccountSol {
    pub owner: Pubkey,
    pub state: u8,
    pub amount: u64,
    pub unlock_time: u64,
    pub bump: u8,
}

impl LockAccountSol {
    pub const LEN: usize = ANCHOR_DISC_LEN
        + 32                                    // owner
        + (8 * 2)                               // amount, time
        + (1)                                   // state
        + (1);                                  // bump
}
