// Plugin system helper functions

/**
 * Calculate max accumulation hours for a tier (1 hour → 24 hours)
 */
export function getMaxAccumulationHours(tier: number): number {
  if (tier >= 1 && tier <= 3) {
    return Math.pow(2, tier - 1);
  }
  if (tier >= 4 && tier <= 10) {
    const hours = 6 + (tier - 4) * 3;
    return Math.min(hours, 24);
  }
  return 1;
}

/**
 * Calculate production rate (cookies per hour) for a tier
 * Formula: BASE_RATE * (tier^1.8)
 * TESTING: 100x BOOST! Real base: 5
 */
export function calculateProductionRate(tier: number): number {
  const BASE_RATE = 500; // 100x boost for testing! (Real: 5)
  return Math.floor(BASE_RATE * Math.pow(tier, 1.8));
}

/**
 * Calculate creation cost for a plugin
 * Formula: 1000 * (tier^2) - Very expensive!
 */
export function calculateCreationCost(tier: number): number {
  return 1000 * Math.pow(tier, 2);
}

/**
 * Calculate install cost for a plugin
 * Formula: 10 * (tier^1.5)
 */
export function calculateInstallCost(tier: number): number {
  return Math.floor(10 * Math.pow(tier, 1.5));
}

/**
 * Calculate tier unlock cost
 * Formula: 10 * 2^(tier-1)
 */
export function calculateUnlockCost(tier: number): number {
  if (tier === 1) return 0;
  return 10 * Math.pow(2, tier - 1);
}

/**
 * Calculate accumulated cookies based on time delta
 */
export function calculateAccumulatedCookies(
  tier: number,
  lastClaim: number,
  currentTime: number
): number {
  const productionPerHour = calculateProductionRate(tier);
  const secondsElapsed = currentTime - lastClaim;
  const maxSeconds = getMaxAccumulationHours(tier) * 3600;
  const secondsCapped = Math.min(secondsElapsed, maxSeconds);

  const productionPerSecond = productionPerHour / 3600;
  return Math.floor(productionPerSecond * secondsCapped);
}

/**
 * Check if a tier is unlocked
 */
export function isTierUnlocked(unlockedTiers: number, tier: number): boolean {
  const tierBit = 1 << (tier - 1);
  return (unlockedTiers & tierBit) !== 0;
}

/**
 * Format time remaining until max accumulation
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return "Ready to claim!";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Get tier color for UI
 */
export const TIER_COLORS: { [key: number]: string } = {
  1: "#8B4513", // Brown
  2: "#C0C0C0", // Silver
  3: "#FFD700", // Gold
  4: "#E0115F", // Ruby
  5: "#4169E1", // Sapphire
  6: "#50C878", // Emerald
  7: "#9966CC", // Amethyst
  8: "#FF6347", // Diamond
  9: "#00CED1", // Platinum
  10: "#FF1493", // Legendary
};

/**
 * Get tier name
 */
export const TIER_NAMES: { [key: number]: string } = {
  1: "Bronze",
  2: "Silver",
  3: "Gold",
  4: "Ruby",
  5: "Sapphire",
  6: "Emerald",
  7: "Amethyst",
  8: "Diamond",
  9: "Platinum",
  10: "Legendary",
};
