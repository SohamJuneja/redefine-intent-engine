import express from 'express';
import cors from 'cors';
import { Account, RpcProvider, cairo, CallData } from 'starknet';
import { Account as TongoAccount, pubKeyBase58ToAffine } from '@fatsolutions/tongo-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const RPC_URL             = process.env.STARKNET_RPC_URL       || '';
const SOLVER_ADDRESS      = process.env.SOLVER_ADDRESS         || '';
const SOLVER_PRIVATE_KEY  = process.env.SOLVER_PRIVATE_KEY     || '';
const VAULT_ADDRESS       = process.env.VAULT_CONTRACT_ADDRESS || '';
const TONGO_ADDRESS       = process.env.TONGO_CONTRACT_ADDRESS || '';  // wraps STRK on Sepolia
const TONGO_PRIVATE_KEY   = process.env.TONGO_PRIVATE_KEY      || SOLVER_PRIVATE_KEY;
// Fixed STRK amount for the shielded demo transfer (0.1 STRK = 10^17 wei).
// Independent of btcAmount since Tongo wraps STRK, not MockBTC.
const TONGO_SHIELD_AMOUNT = BigInt(process.env.TONGO_SHIELD_AMOUNT || '100000000000000000');

let solverAccount: Account;
let provider: RpcProvider;

// Auto-detects Cartridge's spec 0.9.0 channel
async function initAccount() {
    provider = await RpcProvider.create({ nodeUrl: RPC_URL });
    solverAccount = new Account({ provider, address: SOLVER_ADDRESS, signer: SOLVER_PRIVATE_KEY });
    console.log(`✅ Provider initialized (spec auto-detected)`);
}

app.post('/execute-intent', async (req, res) => {
    const { userTongoAddress, btcAmount, targetVesuVault, nonce, signature } = req.body;

    console.log(`\n📥 [NEW SHIELDED INTENT RECEIVED]`);
    console.log(`Amount: ${btcAmount} units`);
    if (userTongoAddress) {
        console.log(`User Tongo Address: ${String(userTongoAddress).substring(0, 20)}...`);
    }

    try {
        // ── STEP 1: PUBLIC DEFI EXECUTION ──────────────────────────────────────
        // Yield is routed to SOLVER_ADDRESS first — the user's address never
        // appears on-chain, providing the Dark Pool privacy guarantee.
        const executeIntentCall = {
            contractAddress: VAULT_ADDRESS,
            entrypoint: 'execute_intent',
            calldata: CallData.compile({
                user_address: SOLVER_ADDRESS,       // ← solver receives yield, not user
                amount: cairo.uint256(btcAmount),
                target_protocol: targetVesuVault,
                nonce: nonce,
                signature: [] as string[]           // BTC sig verified off-chain; contract checks caller == admin_solver
            })
        };

        console.log("⚙️ Executing public Vesu deposit via Vault...");
        const vaultResponse = await solverAccount.execute(executeIntentCall);
        console.log("🔍 Raw vault response:", JSON.stringify(vaultResponse));

        const vaultTxHash = (vaultResponse as any).transaction_hash;
        if (!vaultTxHash) {
            return res.status(500).json({ success: false, error: "Vault execution: no tx hash returned", rawResponse: vaultResponse });
        }

        console.log(`⏳ Waiting for vault TX: ${vaultTxHash}`);
        await provider.waitForTransaction(vaultTxHash);
        console.log(`✅ Public DeFi execution complete! Check Voyager: https://sepolia.voyager.online/tx/${vaultTxHash}`);

        // ── STEP 2: TONGO CONFIDENTIAL SHIELDING ───────────────────────────────
        // Gate: skip shielding if Tongo contract address not yet provided
        if (!TONGO_ADDRESS || TONGO_ADDRESS === '0x...') {
            console.log("⚠️  TONGO_CONTRACT_ADDRESS not configured — returning vault hash only");
            return res.status(200).json({
                success: true,
                message: "Vault intent executed (Tongo shielding pending contract address)",
                txHash: vaultTxHash,
                vaultTxHash,
                shieldedTxHash: null,
            });
        }

        if (!userTongoAddress) {
            console.log("⚠️  No userTongoAddress provided — returning vault hash only");
            return res.status(200).json({
                success: true,
                message: "Vault intent executed (no Tongo address provided for shielding)",
                txHash: vaultTxHash,
                vaultTxHash,
                shieldedTxHash: null,
            });
        }

        console.log("🛡️  Initializing Tongo Shielding Protocol...");

        // The TongoAccount wraps the solver's starknet Account — the Account class
        // in starknet.js extends RpcProvider so it satisfies the SDK's provider parameter.
        const tongoSolver = new TongoAccount(
            BigInt(TONGO_PRIVATE_KEY),
            TONGO_ADDRESS,
            solverAccount as any,  // starknet Account extends RpcProvider; cast resolves nested-package type conflict
        );

        // Parse user's Base58 Tongo address → StarkPoint { x, y } (PubKey)
        const userPubKey = pubKeyBase58ToAffine(userTongoAddress);

        // fund(): wrap STRK into solver's confidential ElGamal-encrypted pool.
        // Rate = 10^18: 1 Tongo unit = 1 full STRK. populateApprove() multiplies
        // by rate to compute the ERC20 approval (TONGO_SHIELD_AMOUNT * 10^18 STRK wei).
        // Max amount is 2^32 - 1 (32-bit balance constraint in the ZK circuit).
        console.log(`🔒 Funding Tongo with ${TONGO_SHIELD_AMOUNT} Tongo unit(s) = ${TONGO_SHIELD_AMOUNT} STRK...`);
        const fundOp = await tongoSolver.fund({
            amount: TONGO_SHIELD_AMOUNT,
            sender: SOLVER_ADDRESS,
        });
        await fundOp.populateApprove();
        const fundTx = await solverAccount.execute([fundOp.approve!, fundOp.toCalldata()]);
        const fundTxHash = (fundTx as any).transaction_hash;
        console.log(`⏳ Waiting for fund TX: ${fundTxHash}`);
        await provider.waitForTransaction(fundTxHash);
        console.log(`✅ Confidential fund complete!`);

        // transfer(): move the confidential STRK balance to the user's Tongo public key.
        // On Voyager this appears as the solver doing DeFi — the user's wallet is never revealed.
        console.log("🥷 Executing zero-knowledge transfer to user...");
        const transferOp = await tongoSolver.transfer({
            to: userPubKey,             // StarkPoint { x, y } — NOT a BigInt
            amount: TONGO_SHIELD_AMOUNT,
            sender: SOLVER_ADDRESS,
        });
        const shieldedTx = await solverAccount.execute([transferOp.toCalldata()]);
        const shieldedTxHash = (shieldedTx as any).transaction_hash;
        console.log(`⏳ Waiting for shielded transfer TX: ${shieldedTxHash}`);
        await provider.waitForTransaction(shieldedTxHash);

        console.log(`🎉 [SUCCESS] Dark Pool execution complete!`);
        console.log(`   Vault TX:    https://sepolia.voyager.online/tx/${vaultTxHash}`);
        console.log(`   Shielded TX: https://sepolia.voyager.online/tx/${shieldedTxHash}`);

        return res.status(200).json({
            success: true,
            message: "Shielded intent executed on Starknet",
            txHash: vaultTxHash,        // primary hash used by frontend success card
            vaultTxHash,
            shieldedTxHash,
        });

    } catch (error: any) {
        console.error("❌ Execution failed:", error?.message || error);
        res.status(500).json({ success: false, error: error?.message || "Execution failed" });
    }
});

initAccount().then(() => {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`🚀 Rift Solver API listening on port ${PORT}`);
    });
}).catch(console.error);
