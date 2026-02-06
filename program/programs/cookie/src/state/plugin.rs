use anchor_lang::prelude::*;

/// Plugin account - represents a player-created plugin template
/// One plugin can be installed by many players
#[account]
pub struct Plugin {
    /// Unique sequential ID for this plugin
    pub plugin_id: u64,

    /// Creator of the plugin (receives revenue share)
    pub creator: Pubkey,

    /// Tier of this plugin (1-10)
    pub tier: u8,

    /// URI to JSON metadata (icon, background, name, description)
    pub metadata_uri: String,

    /// Total number of times this plugin has been installed
    pub total_installs: u64,

    /// Total cookies earned by creator from this plugin
    pub creator_earnings: u64,

    /// When this plugin was created
    pub created_at: i64,

    /// Revenue share to creator in basis points (default 2000 = 20%)
    pub creator_share_bps: u16,

    /// Revenue share burned in basis points (default 8000 = 80%)
    pub burn_share_bps: u16,

    /// Bump seed for PDA
    pub bump: u8,
}

impl Plugin {
    /// Calculate space needed for this account
    /// 8 (discriminator) + 8 (plugin_id) + 32 (creator) + 1 (tier) +
    /// 4 + 200 (metadata_uri) + 8 (total_installs) + 8 (creator_earnings) +
    /// 8 (created_at) + 2 (creator_share_bps) + 2 (burn_share_bps) + 1 (bump)
    pub const LEN: usize = 8 + 8 + 32 + 1 + 4 + 200 + 8 + 8 + 8 + 2 + 2 + 1;
}
