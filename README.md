# Rift — Yield Intent Engine

**Non-custodial cross-chain yield intents: Bitcoin → Starknet DeFi, with zero gas and full transaction privacy.**

Built for the Starknet hackathon. Live on **Starknet Sepolia**.

---

## What is Rift?

Rift lets you declare a yield intent on Bitcoin and have decentralized solvers execute it on Starknet DeFi — with full address privacy via the Tongo confidential protocol.

1. **Sign Intent** — Sign a human-readable intent with your Bitcoin wallet. No bridges, no token approvals.
2. **Solver Bridges** — Rift solvers pick up the intent and route assets cross-chain atomically. Your address never appears on-chain.
3. **Earn Yield** — Funds land in Vesu Finance on Starknet. Yield accrues with zero gas and full privacy via ElGamal encryption.

---

## Architecture

```
Bitcoin wallet (intent signature)
        ↓
  Rift Solver API (Express + TypeScript)
        ↓
  Vault Contract (Starknet Sepolia)
        ↓
  Vesu Finance (DeFi yield)
        ↓
  Tongo Protocol (ElGamal ZK shielding)
        ↓
  User's Tongo address (confidential balance)
```

### Privacy Stack
- **Dark Pool**: Solver address appears on Voyager, never the user's
- **ElGamal Encryption**: Balances stored as `(L, R) = (g^r·y^b, g^r)` — unreadable without private key
- **ZK Proofs**: Schnorr sigma protocols + 32-bit range proofs (~120K Cairo steps)
- **Fiat-Shamir**: Non-interactive proofs via Poseidon hash

---

## Project Structure

```
redefine-intent-engine/
├── frontend/          # Next.js 16 multipage app
│   └── src/app/
│       ├── page.tsx             # Landing page
│       ├── app/page.tsx         # Intent execution interface
│       ├── how-it-works/        # Technical walkthrough
│       ├── privacy/             # Privacy model explanation
│       ├── api/execute-intent/  # Proxy → solver backend
│       └── components/          # Nav, Footer, Background
├── solver/            # TypeScript Express solver service
│   ├── index.ts       # Main API server (port 3001)
│   ├── test-fund.ts   # Tongo fund() test
│   └── test-transfer.ts # Tongo transfer() test
└── contracts/         # Cairo smart contracts (Starknet)
    └── src/           # Vault, MockBTC contracts
```

---

## Quick Start

### 1. Run the Solver

```bash
cd solver
npm install
# Create .env (see solver/.env for template)
npx ts-node index.ts
# Solver listens on http://localhost:3001
```

### 2. Run the Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
# Open http://localhost:3000
```

### 3. Execute an Intent

1. Open `http://localhost:3000/app`
2. Enter BTC amount (in units, e.g. `1`)
3. Optionally enter your Tongo Base58 address for the privacy layer
4. Click **Execute Yield Intent**

The solver will:
- Deposit into Vesu vault on Starknet Sepolia
- Fund the Tongo confidential pool
- ZK-transfer to your Tongo address

---

## Contract Addresses (Sepolia)

| Contract | Address |
|---|---|
| Vault (Rift) | `0x55d21b20747ef7ddf7fdc1b4389bf33ee402d1aebe829cc8bf5e1814679fef6` |
| Tongo (STRK) | `0x408163bfcfc2d76f34b444cb55e09dace5905cf84c0884e4637c2c0f06ab6ed` |
| STRK Token | `0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d` |
| Vesu Vault | `0x405241a6d928e3194ed3bfb071ad21edc4778fa4723f81722fa790218368190` |

---

## Technology

- **Starknet** — L2 ZK-rollup execution
- **Tongo Protocol** — Confidential ElGamal-encrypted ERC20
- **Vesu Finance** — DeFi yield protocol
- **Next.js 16** — Frontend with App Router
- **starknet.js + @fatsolutions/tongo-sdk** — Solver SDK

---

## Verified Transactions

- Fund TX: [`0x449bf3d...`](https://sepolia.voyager.online/tx/0x449bf3d04998a4aa9e885718645f0c3b4ddcf0ee060dbd955a07c7f223150fe)
- Transfer TX: [`0x79fc517...`](https://sepolia.voyager.online/tx/0x79fc51781eb31c3a09c1c7d14a0342fca7f2b5ba1be1c69976bc4692f1204b0)
