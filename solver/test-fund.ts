/**
 * Standalone test for Tongo fund() — bypasses vault step.
 * Verifies the relayData SDK patch fixed "Proof Of Ownership failed".
 */
import { Account, RpcProvider } from 'starknet';
import { Account as TongoAccount } from '@fatsolutions/tongo-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const RPC_URL           = process.env.STARKNET_RPC_URL       || '';
const SOLVER_ADDRESS    = process.env.SOLVER_ADDRESS         || '';
const SOLVER_PRIVATE_KEY= process.env.SOLVER_PRIVATE_KEY     || '';
const TONGO_ADDRESS     = process.env.TONGO_CONTRACT_ADDRESS || '';
const TONGO_PRIVATE_KEY = process.env.TONGO_PRIVATE_KEY      || SOLVER_PRIVATE_KEY;
const TONGO_SHIELD_AMOUNT = BigInt(process.env.TONGO_SHIELD_AMOUNT || '1');

async function main() {
    console.log("🔧 Tongo fund() patch test");
    console.log(`   Solver:  ${SOLVER_ADDRESS}`);
    console.log(`   Tongo:   ${TONGO_ADDRESS}`);
    console.log(`   Amount:  ${TONGO_SHIELD_AMOUNT} Tongo unit(s)`);

    const provider = await RpcProvider.create({ nodeUrl: RPC_URL });
    const solverAccount = new Account({ provider, address: SOLVER_ADDRESS, signer: SOLVER_PRIVATE_KEY });

    const tongoSolver = new TongoAccount(
        BigInt(TONGO_PRIVATE_KEY),
        TONGO_ADDRESS,
        solverAccount as any,
    );

    // Step 1: dry-run via fee estimation (no real TX, fast check)
    console.log("\n⏳ Step 1: Building fund proof + estimating fee...");
    const fundOp = await tongoSolver.fund({
        amount: TONGO_SHIELD_AMOUNT,
        sender: SOLVER_ADDRESS,
    });
    await fundOp.populateApprove();

    const calls = [fundOp.approve!, fundOp.toCalldata()];

    try {
        const fee = await solverAccount.estimateInvokeFee(calls);
        console.log(`✅ Fee estimation PASSED! overall_fee = ${fee.overall_fee}`);
        console.log("   → relayData patch is working, no 'Proof Of Ownership failed'");
    } catch (err: any) {
        console.error("❌ Fee estimation FAILED:", err?.message || err);
        process.exit(1);
    }

    // Step 2: real TX
    console.log("\n⏳ Step 2: Sending real fund TX...");
    const fundTx = await solverAccount.execute(calls);
    const hash = (fundTx as any).transaction_hash;
    console.log(`   TX hash: ${hash}`);
    console.log(`   Waiting for confirmation...`);
    await provider.waitForTransaction(hash);
    console.log(`✅ Fund TX confirmed! https://sepolia.voyager.online/tx/${hash}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
