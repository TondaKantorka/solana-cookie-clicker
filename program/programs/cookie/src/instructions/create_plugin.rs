use anchor_lang::prelude::*;
use anchor_spl::token::{burn, Burn, Mint, Token, TokenAccount};

use crate::constants::*;
use crate::errors::GameErrorCode;
use crate::state::player_data::PlayerData;
use crate::state::plugin::Plugin;

/// Create a new plugin that other players can install
pub fn create_plugin(
    ctx: Context<CreatePlugin>,
    tier: u8,
    metadata_uri: String,
    creator_share_bps: u16,
) -> Result<()> {
    // Validate tier range
    require!(tier >= 1 && tier <= 10, GameErrorCode::InvalidTier);

    // Validate metadata URI length
    require!(metadata_uri.len() <= 200, GameErrorCode::MetadataUriTooLong);

    // Validate revenue split (must add up to 10000 = 100%)
    let burn_share_bps = 10000u16.saturating_sub(creator_share_bps);
    require!(
        creator_share_bps <= 10000,
        GameErrorCode::InvalidRevenueShare
    );

    // Calculate creation cost
    let creation_cost = calculate_creation_cost(tier);

    // Burn cookies from creator
    let burn_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Burn {
            mint: ctx.accounts.cookie_mint.to_account_info(),
            from: ctx.accounts.creator_token_account.to_account_info(),
            authority: ctx.accounts.creator.to_account_info(),
        },
    );
    burn(burn_ctx, creation_cost)?;

    // Increment global plugin counter
    let plugin_id = ctx.accounts.player_data.plugin_global_counter;
    ctx.accounts.player_data.plugin_global_counter =
        plugin_id.checked_add(1).ok_or(GameErrorCode::Overflow)?;

    // Initialize plugin account
    let plugin = &mut ctx.accounts.plugin;
    plugin.plugin_id = plugin_id;
    plugin.creator = ctx.accounts.creator.key();
    plugin.tier = tier;
    plugin.metadata_uri = metadata_uri;
    plugin.total_installs = 0;
    plugin.creator_earnings = 0;
    plugin.created_at = Clock::get()?.unix_timestamp;
    plugin.creator_share_bps = creator_share_bps;
    plugin.burn_share_bps = burn_share_bps;
    plugin.bump = ctx.bumps.plugin;

    msg!("Plugin created! ID: {}, Tier: {}", plugin_id, tier);
    Ok(())
}

#[derive(Accounts)]
#[instruction(tier: u8, metadata_uri: String)]
pub struct CreatePlugin<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        mut,
        seeds = [b"player", creator.key().as_ref()],
        bump,
    )]
    pub player_data: Account<'info, PlayerData>,

    /// Plugin account - PDA seeded by plugin_id
    #[account(
        init,
        payer = creator,
        space = Plugin::LEN,
        seeds = [
            b"plugin",
            player_data.plugin_global_counter.to_le_bytes().as_ref(),
        ],
        bump,
    )]
    pub plugin: Account<'info, Plugin>,

    /// Creator's cookie token account (to burn creation cost)
    #[account(
        mut,
        associated_token::mint = cookie_mint,
        associated_token::authority = creator,
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
