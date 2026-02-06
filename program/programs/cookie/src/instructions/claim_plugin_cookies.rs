use anchor_lang::prelude::*;
use anchor_spl::token::{mint_to, Mint, MintTo, Token, TokenAccount};

use crate::constants::*;
use crate::errors::GameErrorCode;
use crate::state::player_plugin_slot::PlayerPluginSlot;

/// Claim accumulated cookies from a plugin
pub fn claim_plugin_cookies(ctx: Context<ClaimPluginCookies>, tier: u8) -> Result<()> {
    let slot = &mut ctx.accounts.player_plugin_slot;
    
    // Check if slot has a plugin installed
    require!(slot.plugin_id != 0, GameErrorCode::NoPluginInstalled);
    
    // Calculate accumulated cookies
    let current_time = Clock::get()?.unix_timestamp;
    let accumulated = calculate_accumulated_cookies(tier, slot.last_claim, current_time);
    
    require!(accumulated > 0, GameErrorCode::NothingToClaim);
    
    // Mint cookies to player
    let seeds = b"reward";
    let bump = ctx.bumps.cookie_mint;
    let signer: &[&[&[u8]]] = &[&[seeds, &[bump]]];
    
    let mint_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        MintTo {
            mint: ctx.accounts.cookie_mint.to_account_info(),
            to: ctx.accounts.player_token_account.to_account_info(),
            authority: ctx.accounts.cookie_mint.to_account_info(),
        },
        signer,
    );
    mint_to(mint_ctx, accumulated)?;
    
    // Update slot
    slot.last_claim = current_time;
    slot.total_claimed = slot
        .total_claimed
        .checked_add(accumulated)
        .ok_or(GameErrorCode::Overflow)?;
    
    msg!(
        "Claimed {} cookies from tier {} plugin (total: {})",
        accumulated,
        tier,
        slot.total_claimed
    );
    Ok(())
}

#[derive(Accounts)]
#[instruction(tier: u8)]
pub struct ClaimPluginCookies<'info> {
    #[account(mut)]
    pub player: Signer<'info>,
    
    /// Player's plugin slot for this tier
    #[account(
        mut,
        seeds = [
            b"player_plugin_slot",
            player.key().as_ref(),
            tier.to_le_bytes().as_ref(),
        ],
        bump = player_plugin_slot.bump,
        has_one = player,
    )]
    pub player_plugin_slot: Account<'info, PlayerPluginSlot>,
    
    /// Player's cookie token account (to receive cookies)
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

