# Rift — Cross-Chain Yield Intent Engine

> **Bitcoin → Starknet DeFi, in one click. Zero gas. Full privacy.**

[![Live Demo](https://img.shields.io/badge/demo-live%20on%20Starknet%20Sepolia-orange?style=flat-square)](https://redefine-intent-engine.vercel.app)
[![Starknet](https://img.shields.io/badge/network-Starknet%20Sepolia-blueviolet?style=flat-square)](https://sepolia.voyager.online)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

**[Live App](https://redefine-intent-engine.vercel.app)** · **[How It Works](https://redefine-intent-engine.vercel.app/how-it-works)** · **[Privacy Model](https://redefine-intent-engine.vercel.app/privacy)**

---

## What is Rift?

Rift is a **non-custodial cross-chain yield intent engine**. You sign a human-readable intent with your Bitcoin wallet — Rift's decentralized solvers bridge, route, and deposit your assets into Starknet DeFi protocols, with your address fully shielded via zero-knowledge cryptography.

No bridges UI. No token approvals. No gas. No on-chain exposure.

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER FLOW                                   │
│                                                                     │
│   Bitcoin Wallet                                                    │
│   (Xverse / UNISAT)                                                 │
│        │                                                            │
│        │  1. Sign intent (amount + target DeFi protocol)           │
│        ▼                                                            │
│   ┌─────────────┐                                                   │
│   │  Rift App   │  ─── HTTPS ──►  Rift Solver API                  │
│   │ (Next.js)   │                 (Express + TypeScript)            │
│   └─────────────┘                        │                          │
│                                          │  2. Execute on-chain     │
│                                          ▼                          │
│                                 ┌─────────────────┐                 │
│                                 │  IntentVault    │  (Cairo)        │
│                                 │  Starknet Sep.  │                 │
│                                 └────────┬────────┘                 │
│                                          │  3. Deposit yield        │
│                                          ▼                          │
│                                 ┌─────────────────┐                 │
│                                 │  Vesu Finance   │  (SNIP-22)     │
│                                 │  Yield Vault    │                 │
│                                 └────────┬────────┘                 │
│                                          │  4. Shield balance       │
│                                          ▼                          │
│                                 ┌─────────────────┐                 │
│                                 │  Tongo Protocol │  (ElGamal ZK)  │
│                                 │  Confidential   │                 │
│                                 │  STRK Pool      │                 │
│                                 └────────┬────────┘                 │
│                                          │  5. ZK transfer          │
│                                          ▼                          │
│                                 User's Tongo address                │
│                                 (confidential balance, never        │
│                                  appears on Voyager)                │
└─────────────────────────────────────────────────────────────────────┘
```

### Step-by-step

| Step | Actor | Action |
|------|-------|--------|
| 1 | User | Signs a yield intent with their Bitcoin wallet (amount + target vault) |
| 2 | Solver | Picks up the signed intent, calls `execute_intent` on the Vault contract |
| 3 | IntentVault | Verifies solver authorization, prevents replay via nonce, deposits into Vesu |
| 4 | Solver | Funds the Tongo confidential STRK pool (ElGamal-encrypted balance) |
| 5 | Solver | Zero-knowledge transfers the shielded balance to the user's Tongo public key |

---

## Privacy Architecture

Rift implements a **three-layer privacy stack**:

### Layer 1 — Dark Pool
The solver's Starknet address appears on Voyager as the transaction sender. The user's wallet address never touches the chain. This is the **Dark Pool guarantee**: yield is routed through the solver, then cryptographically transferred to the user's confidential key.

### Layer 2 — ElGamal Encryption
Balances in the Tongo protocol are stored as ElGamal ciphertext pairs:

```
(L, R) = (g^r · y^b, g^r)
```

Where:
- `b` = the actual balance (hidden)
- `r` = ephemeral randomness
- `y` = user's public key (`g^sk`)
- `g` = curve generator point

Only the holder of the private key `sk` can decrypt their balance. On-chain, all balances are unreadable ciphertext.

### Layer 3 — Zero-Knowledge Proofs
Every confidential transfer is accompanied by:
- **Schnorr sigma protocols** — prove knowledge of the private key without revealing it
- **32-bit range proofs** — prove the transferred amount is non-negative without revealing it
- **Fiat-Shamir transform** — makes all proofs non-interactive via Poseidon hash
- **~120,000 Cairo steps** per confidential transfer

```
Proof structure:
  π = { commitment C, challenge e = H(C, pk, L, R), response s = r - e·sk }
  Verifier checks: g^s · pk^e == C
```

---

## Contract Addresses (Starknet Sepolia)

| Contract | Address | Explorer |
|----------|---------|----------|
| **IntentVault (Rift)** | `0x55d21b20747ef7ddf7fdc1b4389bf33ee402d1aebe829cc8bf5e1814679fef6` | [Voyager ↗](https://sepolia.voyager.online/contract/0x55d21b20747ef7ddf7fdc1b4389bf33ee402d1aebe829cc8bf5e1814679fef6) |
| **Tongo (confidential STRK)** | `0x408163bfcfc2d76f34b444cb55e09dace5905cf84c0884e4637c2c0f06ab6ed` | [Voyager ↗](https://sepolia.voyager.online/contract/0x408163bfcfc2d76f34b444cb55e09dace5905cf84c0884e4637c2c0f06ab6ed) |
| **STRK Token** | `0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d` | [Voyager ↗](https://sepolia.voyager.online/contract/0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d) |
| **Vesu Vault** | `0x405241a6d928e3194ed3bfb071ad21edc4778fa4723f81722fa790218368190` | [Voyager ↗](https://sepolia.voyager.online/contract/0x405241a6d928e3194ed3bfb071ad21edc4778fa4723f81722fa790218368190) |

### Verified Transactions

| Transaction | Hash | Explorer |
|-------------|------|----------|
| Tongo fund (confidential deposit) | `0x449bf3d04998a4aa9e885718645f0c3b4ddcf0ee060dbd955a07c7f223150fe` | [Voyager ↗](https://sepolia.voyager.online/tx/0x449bf3d04998a4aa9e885718645f0c3b4ddcf0ee060dbd955a07c7f223150fe) |
| Tongo transfer (ZK shielded) | `0x79fc51781eb31c3a09c1c7d14a0342fca7f2b5ba1be1c69976bc4692f1204b0` | [Voyager ↗](https://sepolia.voyager.online/tx/0x79fc51781eb31c3a09c1c7d14a0342fca7f2b5ba1be1c69976bc4692f1204b0) |

---

## Project Structure

```
redefine-intent-engine/
│
├── contracts/                    # Cairo smart contracts (Starknet)
│   ├── Scarb.toml
│   └── src/
│       └── lib.cairo             # IntentVault, MockBTC, MockVesu contracts
│
├── solver/                       # TypeScript solver service (deployed on Render)
│   ├── index.ts                  # Express API — /execute-intent endpoint
│   ├── test-fund.ts              # Tongo fund() integration test
│   ├── test-transfer.ts          # Tongo transfer() integration test
│   └── package.json
│
└── frontend/                     # Next.js 15 app (deployed on Vercel)
    └── src/app/
        ├── page.tsx              # Landing page
        ├── app/page.tsx          # Intent execution interface
        ├── how-it-works/         # Technical walkthrough
        ├── privacy/              # Privacy model deep-dive
        ├── api/execute-intent/   # API proxy route → solver backend
        └── components/           # Nav, Footer, Background
```

---

## Smart Contract Design

### `IntentVault` (Core Contract)

```cairo
fn execute_intent(
    user_address: ContractAddress,
    amount: u256,
    target_protocol: ContractAddress,
    nonce: felt252,
    signature: Array<felt252>
)
```

Security properties:
- **Solver authorization**: `assert(caller == admin_solver)` — only the registered solver can execute
- **Replay protection**: `executed_intents: Map<felt252, bool>` — each nonce can only be used once
- **Non-custodial flow**: assets move directly from solver → vault → Vesu in a single atomic transaction

### `MockBTC` / `MockVesu`

Demo contracts used on Sepolia to simulate the Bitcoin asset bridge and Vesu SNIP-22 vault interface. In production, these would be replaced with real bridged BTC and the live Vesu contracts.

---

## Solver API

The solver exposes a single endpoint: `POST /execute-intent`

**Request:**
```json
{
  "btcAmount": "1",
  "targetVesuVault": "0x405241a6...",
  "nonce": "42",
  "signature": [],
  "userTongoAddress": "Base58-encoded-public-key"
}
```

**Execution flow:**
1. Call `IntentVault.execute_intent` → Vesu deposit (public, solver address visible on Voyager)
2. Call `TongoAccount.fund()` → approve + wrap STRK into confidential pool
3. Call `TongoAccount.transfer()` → ZK transfer to user's public key

**Response:**
```json
{
  "success": true,
  "vaultTxHash": "0x...",
  "shieldedTxHash": "0x..."
}
```

---

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Smart contracts | Cairo 2 (Scarb) | On-chain intent execution and vault logic |
| ZK privacy | Tongo Protocol + ElGamal | Confidential balance shielding |
| DeFi yield | Vesu Finance (SNIP-22) | Yield accrual on Starknet |
| Solver | TypeScript + Express | Off-chain intent resolver |
| Starknet SDK | starknet.js | Account abstraction, RPC calls |
| Tongo SDK | @fatsolutions/tongo-sdk | ElGamal account + ZK proof generation |
| Frontend | Next.js 15 + Tailwind | User interface |
| Frontend hosting | Vercel | Production deployment |
| Solver hosting | Render | Production deployment |

---

## Key Design Decisions

**Why intents?** Intents separate *what the user wants* (yield on BTC) from *how it's executed* (bridging, routing, gas). Users sign once; solvers compete to execute optimally.

**Why ElGamal over Pedersen?** ElGamal supports additive homomorphism on the ciphertext, allowing balance updates without decryption. This makes confidential transfers efficient in Cairo.

**Why Tongo?** Tongo is the only production-deployed confidential token protocol on Starknet, with live ZK proof verification circuits. It provides the privacy layer without requiring custom ZK circuit development.

**Why Vesu?** Vesu implements the SNIP-22 vault standard with a clean `deposit(assets, receiver)` interface, making it trivial to integrate as the yield destination.

---

## Quick Start

### Prerequisites
- Node.js 18+
- A Starknet Sepolia account with STRK (for the solver)

### 1. Run the Solver

```bash
cd solver
npm install

# Create your .env file:
cat > .env << EOF
STARKNET_RPC_URL=https://free-rpc.nethermind.io/sepolia-juno
SOLVER_ADDRESS=0xYOUR_SOLVER_ADDRESS
SOLVER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
VAULT_CONTRACT_ADDRESS=0x55d21b20747ef7ddf7fdc1b4389bf33ee402d1aebe829cc8bf5e1814679fef6
TONGO_CONTRACT_ADDRESS=0x408163bfcfc2d76f34b444cb55e09dace5905cf84c0884e4637c2c0f06ab6ed
STRK_TOKEN_ADDRESS=0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d
TARGET_VESU_VAULT=0x405241a6d928e3194ed3bfb071ad21edc4778fa4723f81722fa790218368190
TONGO_SHIELD_AMOUNT=100000000000000000
EOF

npx ts-node index.ts
# ✅ Solver API listening on http://localhost:3001
```

### 2. Run the Frontend

```bash
cd frontend
npm install

cat > .env.local << EOF
SOLVER_URL=http://localhost:3001
NEXT_PUBLIC_TARGET_VESU_VAULT=0x405241a6d928e3194ed3bfb071ad21edc4778fa4723f81722fa790218368190
EOF

npm run dev
# Open http://localhost:3000
```

### 3. Execute a Yield Intent

1. Open `http://localhost:3000/app`
2. Enter a BTC amount (e.g. `1`)
3. Optionally enter your Tongo Base58 public key for the privacy shielding layer
4. Click **Execute Yield Intent**

The solver will:
- Deposit into the Vesu vault via the IntentVault contract on Starknet Sepolia
- Fund the Tongo confidential STRK pool
- ZK-transfer the shielded balance to your Tongo address

Both transaction hashes will be shown on success — verifiable on [Sepolia Voyager](https://sepolia.voyager.online).

---

## Live Demo

- **App**: [redefine-intent-engine.vercel.app](https://redefine-intent-engine.vercel.app)
- **Contracts**: Starknet Sepolia (addresses above)
- **Voyager**: All transactions publicly verifiable

---

## Built for Starknet Hackathon

Rift was built to demonstrate that **privacy and cross-chain DeFi are not mutually exclusive**. By combining Starknet's ZK-rollup execution with Tongo's confidential token protocol and Vesu's yield infrastructure, Rift shows a credible path toward private, intent-driven DeFi accessible from Bitcoin.
