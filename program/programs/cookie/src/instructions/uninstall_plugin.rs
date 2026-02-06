use anchor_lang::prelude::*;
use anchor_spl::token::{mint_to, Mint, MintTo, Token, TokenAccount};

use crate::constants::*;
use crate::errors::GameErrorCode;
use crate::state::player_plugin_slot::PlayerPluginSlot;

/// Uninstall a plugin from a tier slot (claims pending cookies first)
pub fn uninstall_plugin(ctx: Context<UninstallPlugin>, tier: u8) -> Result<()> {
    let slot = &mut ctx.accounts.player_plugin_slot;
    
    // Check if slot has a plugin installed
    require!(slot.plugin_id != 0, GameErrorCode::NoPluginInstalled);
    
    // Claim any pending cookies first
    let current_time = Clock::get()?.unix_timestamp;
    let accumulated = calculate_accumulated_cookies(tier, slot.last_claim, current_time);
    
    if accumulated > 0 {
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
        
        msg!("Claimed {} cookies before uninstalling", accumulated);
    }
    
    // Clear the slot (set plugin_id to 0)
    let old_plugin_id = slot.plugin_id;
    slot.plugin_id = 0;
    slot.last_claim = current_time;
    
    msg!("Plugin {} uninstalled from tier {} slot", old_plugin_id, tier);
    Ok(())
}

#[derive(Accounts)]
#[instruction(tier: u8)]
pub struct UninstallPlugin<'info> {
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
    
    /// Player's cookie token account (to receive final cookies)
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

