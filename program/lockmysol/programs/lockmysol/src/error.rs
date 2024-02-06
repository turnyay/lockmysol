use anchor_lang::prelude::*;

#[error_code]
pub enum LockMySolError {
    /// 6000
    #[msg("Too early to unlock")]
    TooEarlyToUnlock,
    /// 6001
    #[msg("InvalidState")]
    InvalidState,
    /// 6002
    #[msg("InvalidLockId")]
    InvalidLockId,
}
