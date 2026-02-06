use anchor_lang::error_code;

#[error_code]
pub enum GameErrorCode {
    #[msg("Not enough energy")]
    NotEnoughEnergy,
    #[msg("Wrong Authority")]
    WrongAuthority,
    #[msg("Not enough health")]
    NotEnoughHealth,
    
    // Plugin system errors
    #[msg("Invalid tier (must be 1-10)")]
    InvalidTier,
    #[msg("Metadata URI too long (max 200 characters)")]
    MetadataUriTooLong,
    #[msg("Invalid revenue share (must be <= 100%)")]
    InvalidRevenueShare,
    #[msg("Tier not unlocked")]
    TierNotUnlocked,
    #[msg("Tier already unlocked")]
    TierAlreadyUnlocked,
    #[msg("No plugin installed in this slot")]
    NoPluginInstalled,
    #[msg("Nothing to claim yet")]
    NothingToClaim,
    #[msg("Arithmetic overflow")]
    Overflow,
}
