pub const TIME_TO_REFILL_ENERGY: i64 = 60;
pub const MAX_ENERGY: u64 = 100;
pub const MAX_WOOD_PER_TREE: u64 = 100000;

// Plugin System Constants
pub const PLUGIN_BASE_PRODUCTION_RATE: u64 = 500; // Tier 1 produces 500 cookies/hour (100x BOOST FOR TESTING! Real: 5/hr)
pub const PLUGIN_CREATION_BASE_COST: u64 = 1000; // Base cost to create a plugin (10x more expensive!)
pub const PLUGIN_INSTALL_BASE_COST: u64 = 10; // Base cost to install a plugin
pub const PLUGIN_UNLOCK_BASE_COST: u64 = 10; // Base cost to unlock a tier
pub const CREATOR_SHARE_BPS: u16 = 2000; // 20% to creator (basis points)
pub const BURN_SHARE_BPS: u16 = 8000; // 80% burned (basis points)

/// Calculate max accumulation hours for a tier (1 hour → 24 hours)
/// Tiers 1-3: Exponential (1, 2, 4)
/// Tiers 4-10: Linear (6 to 24)
pub fn get_max_accumulation_hours(tier: u8) -> i64 {
    match tier {
        1..=3 => 2i64.pow((tier - 1) as u32),
        4..=10 => {
            let hours = 6 + ((tier as i64 - 4) * 3);
            hours.min(24)
        }
        _ => 1,
    }
}

/// Calculate production rate (cookies per hour) for a tier
/// Formula: BASE_RATE * (tier^1.8)
/// Tier 1: 10 CPH, Tier 10: 631 CPH
pub fn calculate_production_rate(tier: u8) -> u64 {
    let tier_f64 = tier as f64;
    let rate = (PLUGIN_BASE_PRODUCTION_RATE as f64) * tier_f64.powf(1.8);
    rate as u64
}

/// Calculate creation cost for a plugin
/// Formula: BASE_COST * (tier^2)
/// Tier 1: 100, Tier 10: 10,000
pub fn calculate_creation_cost(tier: u8) -> u64 {
    PLUGIN_CREATION_BASE_COST * (tier as u64).pow(2)
}

/// Calculate install cost for a plugin
/// Formula: BASE_COST * (tier^1.5)
/// Tier 1: 10, Tier 10: 316
pub fn calculate_install_cost(tier: u8) -> u64 {
    let tier_f64 = tier as f64;
    let cost = (PLUGIN_INSTALL_BASE_COST as f64) * tier_f64.powf(1.5);
    cost as u64
}

/// Calculate tier unlock cost
/// Formula: BASE_COST * 2^(tier-1)
/// Tier 1: 0 (free), Tier 2: 10, Tier 10: 5,120
pub fn calculate_unlock_cost(tier: u8) -> u64 {
    if tier == 1 {
        return 0; // Tier 1 is always unlocked
    }
    PLUGIN_UNLOCK_BASE_COST * 2u64.pow((tier - 1) as u32)
}

/// Calculate accumulated cookies based on time delta
/// Returns cookies accumulated (capped at max hours for tier)
pub fn calculate_accumulated_cookies(tier: u8, last_claim: i64, current_time: i64) -> u64 {
    let production_per_hour = calculate_production_rate(tier);
    let seconds_elapsed = current_time.saturating_sub(last_claim);
    let max_seconds = get_max_accumulation_hours(tier) * 3600;
    let seconds_capped = seconds_elapsed.min(max_seconds);

    // Production rate per second
    let production_per_second = production_per_hour as f64 / 3600.0;
    let accumulated = production_per_second * seconds_capped as f64;
    accumulated as u64
}
