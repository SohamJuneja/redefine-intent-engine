/**
 * Standalone test for Tongo transfer() — bypasses vault step.
 * Verifies the prefixTransfer 8-element fix matches the deployed contract.
 *
 * Usage: npx ts-node test-transfer.ts [recipientTongoAddress]
 * If no recipient given, transfers to solver's own Tongo address (self-transfer).
 */
import { Account, RpcProvider } from 'starknet';
import { Account as TongoAccount, pubKeyBase58ToAffine } from '@fatsolutions/tongo-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const RPC_URL            = process.env.STARKNET_RPC_URL       || '';
const SOLVER_ADDRESS     = process.env.SOLVER_ADDRESS         || '';
const SOLVER_PRIVATE_KEY = process.env.SOLVER_PRIVATE_KEY     || '';
const TONGO_ADDRESS      = process.env.TONGO_CONTRACT_ADDRESS || '';
const TONGO_PRIVATE_KEY  = process.env.TONGO_PRIVATE_KEY      || SOLVER_PRIVATE_KEY;
const TONGO_SHIELD_AMOUNT = BigInt(process.env.TONGO_SHIELD_AMOUNT || '1');

async function main() {
    // Optional recipient from CLI arg; fall back to self (solver's own Tongo address)
    const recipientBase58 = process.argv[2] || 'byzxzc5ESpfX7vqaBL9zPBdhENLjPsnAmUqCdKdzv7vi';

    console.log("🔧 Tongo transfer() patch test");
    console.log(`   Solver:    ${SOLVER_ADDRESS}`);
    console.log(`   Tongo:     ${TONGO_ADDRESS}`);
    console.log(`   Amount:    ${TONGO_SHIELD_AMOUNT} Tongo unit(s)`);
    console.log(`   Recipient: ${recipientBase58}`);

    const provider = await RpcProvider.create({ nodeUrl: RPC_URL });
    const solverAccount = new Account({ provider, address: SOLVER_ADDRESS, signer: SOLVER_PRIVATE_KEY });

    const tongoSolver = new TongoAccount(
        BigInt(TONGO_PRIVATE_KEY),
        TONGO_ADDRESS,
        solverAccount as any,
    );

    // Show current on-chain state
    const state = await tongoSolver.state();
    console.log(`\n📊 Current Tongo state: balance=${state.balance}, pending=${state.pending}, nonce=${state.nonce}`);

    if (state.balance < TONGO_SHIELD_AMOUNT) {
        console.error(`❌ Insufficient balance: have ${state.balance}, need ${TONGO_SHIELD_AMOUNT}`);
        process.exit(1);
    }

    // Parse recipient Base58 Tongo address → { x, y }
    const recipientPubKey = pubKeyBase58ToAffine(recipientBase58);

    // Step 1: build proof + estimate fee
    console.log("\n⏳ Step 1: Building transfer proof + estimating fee...");
    const transferOp = await tongoSolver.transfer({
        to: recipientPubKey as any,
        amount: TONGO_SHIELD_AMOUNT,
        sender: SOLVER_ADDRESS,
    });

    try {
        const fee = await solverAccount.estimateInvokeFee([transferOp.toCalldata()]);
        console.log(`✅ Fee estimation PASSED! overall_fee = ${fee.overall_fee}`);
        console.log("   → prefixTransfer patch is working");
    } catch (err: any) {
        console.error("❌ Fee estimation FAILED:", err?.message || err);
        process.exit(1);
    }

    // Step 2: real TX
    console.log("\n⏳ Step 2: Sending real transfer TX...");
    const tx = await solverAccount.execute([transferOp.toCalldata()]);
    const hash = (tx as any).transaction_hash;
    console.log(`   TX hash: ${hash}`);
    console.log(`   Waiting for confirmation...`);
    await provider.waitForTransaction(hash);
    console.log(`✅ Transfer TX confirmed! https://sepolia.voyager.online/tx/${hash}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
