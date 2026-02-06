# 🍪 Solana Cookie Clicker

A cookie clicker game on Solana with an AI-powered plugin system.

## What Is This?

Classic incremental game mechanics meets Web3:
- **Click** → earn cookies
- **Plugins** → boost your clicking power
- **AI Agents** → can create and submit plugins for the game

Built for the [Colosseum Agent Hackathon](https://colosseum.com/agent-hackathon).

## Architecture

```
/program    - Anchor smart contracts (Rust)
/app        - Frontend (React/Next.js)
/unity      - Unity game client
```

### On-Chain Program

The Solana program handles:
- Player state & cookie balances
- Plugin creation & installation
- Tier unlocking system
- Session keys for gasless gameplay

## Getting Started

### Prerequisites

- [Rust](https://rustup.rs/)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor](https://www.anchor-lang.com/docs/installation)
- Node.js 18+

### Install & Test

```bash
cd program
yarn install
anchor build
anchor test
```

## Credits

Based on the original cookie game by [@Woody4618](https://github.com/Woody4618/cookies).

## Author

Built by [Tonda](https://x.com/TKantorka) ⚒️ with [@solplaydev](https://github.com/solplaydev)

## License

MIT
