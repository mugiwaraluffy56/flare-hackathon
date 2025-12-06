# 🚀 FACE - Quick Start Guide

## What is FACE?

**FACE (Flare Autonomous Compliance Engine)** is a production-ready compliance system that uses:
- ✅ **FDC** to verify external chain transactions
- ✅ **FTSO** for live asset prices
- ✅ **AI** for risk scoring
- ✅ **Smart Accounts** for autonomous execution

## Installation (5 minutes)

### 1. Run Setup Script

```bash
./scripts/setup.sh
```

This installs all dependencies for contracts, backend, AI engine, and frontend.

### 2. Configure Environment

```bash
# Edit .env file
nano .env

# Add your Coston2 private key
PRIVATE_KEY=your_private_key_here
```

### 3. Deploy Smart Contracts

```bash
cd contracts
npx hardhat run deployment/deploy.js --network coston2
```

**Copy the deployed contract addresses** and add them to `.env`:
```
COMPLIANCE_ENGINE_ADDRESS=0x...
SMART_ACCOUNT_FACTORY_ADDRESS=0x...
FDC_VERIFIER_ADDRESS=0x...
```

### 4. Start All Services

```bash
./scripts/start-all.sh
```

This starts:
- AI Engine on port 3001
- Backend API on port 8080
- Frontend on port 3000

### 5. Open Application

Navigate to **http://localhost:3000**

## Usage

### 1. Connect Wallet
- Click "Connect Wallet"
- Approve MetaMask
- Switch to Coston2 (auto-prompted)

### 2. Submit Asset
- Click "Submit Asset"
- Fill in the form
- Click "Submit for Compliance Check"

### 3. View Results
- See real-time processing
- Check risk score and status
- View on Dashboard

## Stopping Services

```bash
./scripts/stop-all.sh
```

## Troubleshooting

### MetaMask not connecting?
- Make sure you're on Coston2 network
- Check that you have testnet tokens

### Backend not starting?
- Run `cd backend && go mod tidy`
- Check that port 8080 is available

### Frontend not loading?
- Run `cd frontend && npm install`
- Check that port 3000 is available

## Get Testnet Tokens

Visit: https://faucet.flare.network/coston2

## Support

For issues, check:
- README.md - Full documentation
- docs/PITCH.md - Pitch script
- walkthrough.md - Complete technical walkthrough

---

**Built for Flare Hackathon** 🔥
