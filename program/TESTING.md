# Cookie Clicker Testing Guide 🍪

## Overview

Your Cookie Clicker game on Solana is now fully set up with comprehensive tests! The game allows players to click cookies and earn COOKIE tokens as rewards, using their energy.

## Test Suite

The test file (`tests/cookie.ts`) includes three main tests:

### 1. **Init Player and Chop Tree** (Original Test)

- Initializes a player account
- Tests the tree chopping functionality
- Verifies energy consumption

### 2. **Creates the Cookie Token! 🍪** (New)

- Creates a fungible SPL token called "COOKIE"
- Sets up token metadata using Metaplex
- Uses a PDA (Program Derived Address) as the mint authority
- The token symbol is "COOKIE" and includes metadata with an image URI

**What happens:**

- Checks if the token mint already exists
- If not, creates the mint with metadata
- Uses the "reward" seed for the PDA

### 3. **Clicks the Cookie and Earns Tokens! 🖱️🍪** (New)

- Tests the cookie clicking mechanism
- Each click costs 10 energy points
- Each click rewards 1 COOKIE token
- Tests 5 consecutive clicks
- Displays balance and energy after each click

**What happens:**

- Initializes player if needed
- Creates an associated token account for the player
- Simulates 5 cookie clicks
- Each click mints 1 COOKIE token to the player
- Shows final cookie balance and remaining energy

## Running the Tests

### Prerequisites

Make sure you have a local validator running:

```bash
solana-test-validator
```

### Run All Tests

```bash
cd /Users/jonasmac2/Documents/GitHub/cookies/cookie/program
anchor test
```

### Run Specific Test

```bash
anchor test --skip-local-validator
# (if validator is already running)
```

Or using the configured test script:

```bash
yarn test
```

## Key Concepts

### Energy System

- Players start with 100 energy
- Each cookie click costs 10 energy
- Energy regenerates over time (1 energy per 60 seconds)
- When energy reaches 0, players can't click anymore

### Cookie Token (COOKIE)

- **Type:** SPL Token (fungible)
- **Symbol:** COOKIE
- **Decimals:** 9 (standard for Solana tokens)
- **Mint Authority:** PDA controlled by the program
- **Metadata:** Includes name, symbol, and image URI

### Account Structure

1. **Cookie Mint PDA**

   - Seeds: `["reward"]`
   - Controls minting of COOKIE tokens

2. **Player Data PDA**

   - Seeds: `["player", player_pubkey]`
   - Stores player stats (energy, wood, etc.)

3. **Player Token Account**

   - Associated Token Account (ATA)
   - Holds player's COOKIE tokens

4. **Metadata Account**
   - Metaplex metadata for the COOKIE token
   - Contains token name, symbol, URI

## Expected Test Output

When you run the tests, you should see:

```
🍪 Creating Cookie Token Mint...
✅ Transaction confirmed: [tx_hash]
🎉 Cookie Token Created Successfully!

🖱️ Testing Cookie Clicking Mechanism...
✅ Player Already Exists
⚡ Player Energy: 100

🍪 Clicking the cookie 5 times!

--- Click 1 ---
✅ Transaction confirmed: [tx_hash]
🍪 Cookie Balance: 1
⚡ Player Energy: 90

--- Click 2 ---
✅ Transaction confirmed: [tx_hash]
🍪 Cookie Balance: 2
⚡ Player Energy: 80

... and so on ...

🎉 Final Stats:
🍪 Cookie Balance: 5
⚡ Player Energy: 50
```

## Next Steps

Consider adding tests for:

- Energy regeneration over time
- Error handling when energy is depleted
- Multiple players interacting with the game
- Token transfer between players
- Upgrades system (if you add that to the game)

## Game Mechanics

Your cookie clicker includes:

- ✅ Token minting on click
- ✅ Energy cost per click
- ✅ Player state management
- ✅ SPL token integration with metadata

## Troubleshooting

If tests fail:

1. Make sure `solana-test-validator` is running
2. Check that you have enough SOL in your test wallet
3. Verify Anchor CLI version matches: `anchor --version`
4. Rebuild the program: `anchor build`
5. Clear and rebuild if needed: `anchor clean && anchor build`

Happy Cookie Clicking! 🍪🎮
