use anchor_lang::prelude::*;

declare_id!("5b6JMVrHatTdGFnHtKb2iuBquDmspYsPq1HLKifS8QHA");

#[program]
pub mod lockmysol {
    use super::*;

    pub fn lock_sol_for_time(ctx: Context<LockSolForTime>) -> Result<()> {
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
pub struct LockSolForTime {}

#[derive(Accounts)]
pub struct UnlockSol {}

#[derive(Accounts)]
pub struct LockTokensForTime {}

#[derive(Accounts)]
pub struct UnlockTokens {}
