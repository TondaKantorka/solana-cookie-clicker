pub use crate::errors::GameErrorCode;
pub use anchor_lang::prelude::*;
pub use session_keys::{session_auth_or, Session, SessionError};
pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;
use instructions::*;

declare_id!("H9BK2gP55dKbadkAwroaTZo5L5vw3QuDtSLmE6WbWKE9");

#[program]
pub mod cookie {

    use super::*;

    pub fn init_player(ctx: Context<InitPlayer>, _level_seed: String) -> Result<()> {
        init_player::init_player(ctx)
    }

    pub fn create_mint(
        ctx: Context<CreateMint>,
        uri: String,
        name: String,
        symbol: String,
    ) -> Result<()> {
        create_mint::create_mint(ctx, uri, name, symbol)
    }

    #[session_auth_or(
        ctx.accounts.player.authority.key() == ctx.accounts.signer.key(),
        GameErrorCode::WrongAuthority
    )]
    pub fn on_click(ctx: Context<OnClick>) -> Result<()> {
        on_click::on_click(ctx)
    }

    // This function lets the player chop a tree and get 1 wood. The session_auth_or macro
    // lets the player either use their session token or their main wallet. (The counter is only
    // there so that the player can do multiple transactions in the same block. Without it multiple transactions
    // in the same block would result in the same signature and therefore fail.)
    #[session_auth_or(
        ctx.accounts.player.authority.key() == ctx.accounts.signer.key(),
        GameErrorCode::WrongAuthority
    )]
    pub fn chop_tree(ctx: Context<ChopTree>, _level_seed: String, counter: u16) -> Result<()> {
        chop_tree::chop_tree(ctx, counter, 1)
    }

    // Plugin System Instructions
    
    pub fn create_plugin(
        ctx: Context<CreatePlugin>,
        tier: u8,
        metadata_uri: String,
        creator_share_bps: u16,
    ) -> Result<()> {
        create_plugin::create_plugin(ctx, tier, metadata_uri, creator_share_bps)
    }

    pub fn unlock_tier(ctx: Context<UnlockTier>, tier: u8) -> Result<()> {
        unlock_tier::unlock_tier(ctx, tier)
    }

    pub fn install_plugin(ctx: Context<InstallPlugin>) -> Result<()> {
        install_plugin::install_plugin(ctx)
    }

    pub fn claim_plugin_cookies(ctx: Context<ClaimPluginCookies>, tier: u8) -> Result<()> {
        claim_plugin_cookies::claim_plugin_cookies(ctx, tier)
    }

    pub fn uninstall_plugin(ctx: Context<UninstallPlugin>, tier: u8) -> Result<()> {
        uninstall_plugin::uninstall_plugin(ctx, tier)
    }
}
