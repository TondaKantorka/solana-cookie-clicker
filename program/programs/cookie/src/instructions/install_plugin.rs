use anchor_lang::prelude::*;
use anchor_spl::token::{burn, mint_to, Burn, Mint, MintTo, Token, TokenAccount};

use crate::constants::*;
use crate::errors::GameErrorCode;
use crate::state::plugin::Plugin;
use crate::state::player_data::PlayerData;
use crate::state::player_plugin_slot::PlayerPluginSlot;

/// Install a plugin into a tier slot
pub fn install_plugin(ctx: Context<InstallPlugin>) -> Result<()> {
    // Extract values we need before mutating
    let plugin_id = ctx.accounts.plugin.plugin_id;
    let tier = ctx.accounts.plugin.tier;
    let creator_share_bps = ctx.accounts.plugin.creator_share_bps;
    
    let slot = &mut ctx.accounts.player_plugin_slot;
    
    // Check if tier is unlocked
    let tier_bit = 1u16 << (tier - 1);
    require!(
        ctx.accounts.player_data.unlocked_tiers & tier_bit != 0,
        GameErrorCode::TierNotUnlocked
    );
    
    // If slot has an existing plugin, claim any pending cookies first
    if slot.plugin_id != 0 {
        let accumulated = calculate_accumulated_cookies(
            tier,
            slot.last_claim,
            Clock::get()?.unix_timestamp,
        );
        
        if accumulated > 0 {
            // Mint accumulated cookies to player
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
            
            msg!("Claimed {} cookies before replacing plugin", accumulated);
        }
    }
    
    // Calculate install cost
    let install_cost = calculate_install_cost(tier);
    
    // Split install cost: creator share + burn share
    let creator_amount = (install_cost as u128 * creator_share_bps as u128 / 10000) as u64;
    let burn_amount = install_cost.saturating_sub(creator_amount);
    
    // Burn the burn_share
    if burn_amount > 0 {
        let burn_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.cookie_mint.to_account_info(),
                from: ctx.accounts.player_token_account.to_account_info(),
                authority: ctx.accounts.player.to_account_info(),
            },
        );
        burn(burn_ctx, burn_amount)?;
    }
    
    // Send creator_share to creator
    if creator_amount > 0 {
        let seeds = b"reward";
        let bump = ctx.bumps.cookie_mint;
        let signer: &[&[&[u8]]] = &[&[seeds, &[bump]]];
        
        let mint_to_creator_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.cookie_mint.to_account_info(),
                to: ctx.accounts.creator_token_account.to_account_info(),
                authority: ctx.accounts.cookie_mint.to_account_info(),
            },
            signer,
        );
        mint_to(mint_to_creator_ctx, creator_amount)?;
        
        // Update plugin creator earnings
        ctx.accounts.plugin.creator_earnings = ctx.accounts.plugin
            .creator_earnings
            .checked_add(creator_amount)
            .ok_or(GameErrorCode::Overflow)?;
    }
    
    // Update plugin total installs
    ctx.accounts.plugin.total_installs = ctx.accounts.plugin
        .total_installs
        .checked_add(1)
        .ok_or(GameErrorCode::Overflow)?;
    
    // Update slot
    let current_time = Clock::get()?.unix_timestamp;
    slot.player = ctx.accounts.player.key();
    slot.tier = tier;
    slot.plugin_id = plugin_id;
    slot.installed_at = current_time;
    slot.last_claim = current_time;
    slot.total_claimed = 0;
    slot.bump = ctx.bumps.player_plugin_slot;
    
    msg!(
        "Plugin {} installed in tier {} slot. Cost: {} (burned: {}, creator: {})",
        plugin_id,
        tier,
        install_cost,
        burn_amount,
        creator_amount
    );
    Ok(())
}

#[derive(Accounts)]
pub struct InstallPlugin<'info> {
    #[account(mut)]
    pub player: Signer<'info>,
    
    #[account(
        seeds = [b"player", player.key().as_ref()],
        bump,
    )]
    pub player_data: Account<'info, PlayerData>,
    
    /// Plugin to install
    #[account(
        mut,
        seeds = [b"plugin", plugin.plugin_id.to_le_bytes().as_ref()],
        bump = plugin.bump,
    )]
    pub plugin: Account<'info, Plugin>,
    
    /// Player's plugin slot for this tier
    #[account(
        init_if_needed,
        payer = player,
        space = PlayerPluginSlot::LEN,
        seeds = [
            b"player_plugin_slot",
            player.key().as_ref(),
            plugin.tier.to_le_bytes().as_ref(),
        ],
        bump,
    )]
    pub player_plugin_slot: Account<'info, PlayerPluginSlot>,
    
    /// Player's cookie token account (to pay install cost)
    #[account(
        mut,
        associated_token::mint = cookie_mint,
        associated_token::authority = player,
    )]
    pub player_token_account: Account<'info, TokenAccount>,
    
    /// Creator's cookie token account (to receive revenue share)
    #[account(
        mut,
        associated_token::mint = cookie_mint,
        associated_token::authority = plugin.creator,
    )]
    pub creator_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        seeds = [b"reward"],
        bump,
    )]
    pub cookie_mint: Account<'info, Mint>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

