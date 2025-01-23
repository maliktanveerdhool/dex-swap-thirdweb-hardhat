# Decentralized Exchange (DEX) Application

A modern decentralized exchange built on Sepolia testnet, allowing users to swap between ETH and custom tokens with an automated market maker (AMM) mechanism.

## Project Structure

```
dex-app/
├── dexcontract/         # Smart contract development
│   ├── contracts/       # Solidity smart contracts
│   ├── scripts/         # Deployment scripts
│   └── test/           # Contract tests
└── dexswapapp/         # Frontend Next.js application
    ├── components/     # React components
    ├── pages/         # Next.js pages
    └── styles/        # CSS modules
```

## Smart Contracts

### Deployed Contracts (Sepolia Testnet)
- Token Contract: `0xB2320e5da7D93f5Ccef3863ebb5836CA38aF2C72`
- DEX Contract: [Pending Deployment]

### Features
- ETH-Token swaps
- Automated Market Maker (AMM)
- Liquidity pool management
- 1% trading fee
- Real-time price calculations

## Getting Started

### Prerequisites
- Node.js v16+
- MetaMask wallet
- Sepolia testnet ETH

### Smart Contract Development
```bash
cd dexcontract
npm install
npx hardhat compile
npx hardhat test
```

### Frontend Development
```bash
cd dexswapapp
npm install
npm run dev
```

### Environment Setup

1. DexContract (.env):
```
SEPOLIA_RPC_URL=your_sepolia_rpc_url
PRIVATE_KEY=your_wallet_private_key
```

2. DexSwapApp (.env.local):
```
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
```

## Testing Guide

1. Install and set up MetaMask
2. Switch to Sepolia testnet
3. Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com)
4. Connect wallet to app
5. Import token to MetaMask
6. Test swap functionality

## Features
- Modern UI with dark theme
- Real-time price updates
- Wallet integration
- Token approval system
- Balance tracking
- Slippage handling
- Transaction feedback

## Tech Stack
- Solidity
- Hardhat
- Next.js
- TypeScript
- ThirdWeb
- Ethers.js

## Security
- Environment variables are used for sensitive data
- Contract security measures implemented
- Input validation
- Error handling

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License
This project is licensed under the MIT License.
