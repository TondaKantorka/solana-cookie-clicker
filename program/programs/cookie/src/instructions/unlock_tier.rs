use anchor_lang::prelude::*;
use anchor_spl::token::{burn, Burn, Mint, Token, TokenAccount};

use crate::constants::*;
use crate::errors::GameErrorCode;
use crate::state::player_data::PlayerData;

/// Unlock a plugin tier slot
pub fn unlock_tier(ctx: Context<UnlockTier>, tier: u8) -> Result<()> {
    // Validate tier range
    require!(tier >= 1 && tier <= 10, GameErrorCode::InvalidTier);

    // Check if tier is already unlocked
    let tier_bit = 1u16 << (tier - 1);
    require!(
        ctx.accounts.player_data.unlocked_tiers & tier_bit == 0,
        GameErrorCode::TierAlreadyUnlocked
    );

    // Calculate unlock cost (Tier 1 is free)
    let unlock_cost = calculate_unlock_cost(tier);

    // Burn cookies if cost > 0
    if unlock_cost > 0 {
        let burn_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.cookie_mint.to_account_info(),
                from: ctx.accounts.player_token_account.to_account_info(),
                authority: ctx.accounts.player.to_account_info(),
            },
        );
        burn(burn_ctx, unlock_cost)?;
    }

    // Unlock the tier by setting the bit
    ctx.accounts.player_data.unlocked_tiers |= tier_bit;

    msg!("Tier {} unlocked! Cost: {}", tier, unlock_cost);
    Ok(())
}

#[derive(Accounts)]
#[instruction(tier: u8)]
pub struct UnlockTier<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        mut,
        seeds = [b"player", player.key().as_ref()],
        bump,
    )]
    pub player_data: Account<'info, PlayerData>,

    /// Player's cookie token account (to burn unlock cost)
    #[account(
        mut,
        associated_token::mint = cookie_mint,
        associated_token::authority = player,
    )]
    pub player_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"reward"],
        bump,
    )]
    pub cookie_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
}
