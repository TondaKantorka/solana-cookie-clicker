use anchor_lang::prelude::*;

/// Player's plugin slot - each player has 10 slots (one per tier)
/// Represents an instance of a plugin installed by a player
#[account]
pub struct PlayerPluginSlot {
    /// The player who owns this slot
    pub player: Pubkey,

    /// Which tier slot this is (1-10)
    pub tier: u8,

    /// Which plugin is installed (0 = empty slot)
    pub plugin_id: u64,

    /// When this plugin was installed
    pub installed_at: i64,

    /// Last time cookies were claimed from this plugin
    pub last_claim: i64,

    /// Total cookies claimed from this plugin instance (lifetime)
    pub total_claimed: u64,

    /// Bump seed for PDA
    pub bump: u8,
}

impl PlayerPluginSlot {
    /// Calculate space needed for this account
    /// 8 (discriminator) + 32 (player) + 1 (tier) + 8 (plugin_id) +
    /// 8 (installed_at) + 8 (last_claim) + 8 (total_claimed) + 1 (bump)
    pub const LEN: usize = 8 + 32 + 1 + 8 + 8 + 8 + 8 + 1;
}
