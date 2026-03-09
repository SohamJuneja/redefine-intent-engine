import { Account, RpcProvider, cairo, CallData } from 'starknet';
import * as dotenv from 'dotenv';

dotenv.config();

const RPC_URL = process.env.STARKNET_RPC_URL || '';
const SOLVER_ADDRESS = process.env.SOLVER_ADDRESS || '';
const SOLVER_PRIVATE_KEY = process.env.SOLVER_PRIVATE_KEY || '';
const VAULT_ADDRESS = process.env.VAULT_CONTRACT_ADDRESS || '';

async function main() {
    console.log("🔧 Creating provider with auto spec detection...");
    const provider = await RpcProvider.create({ nodeUrl: RPC_URL });
    console.log("✅ Provider created");

    const solverAccount = new Account({ provider, address: SOLVER_ADDRESS, signer: SOLVER_PRIVATE_KEY });
    console.log("✅ Account created:", solverAccount.address);

    const calldata = CallData.compile({
        user_address: SOLVER_ADDRESS,
        amount: cairo.uint256(100),
        target_protocol: process.env.TARGET_VESU_VAULT || '',
        nonce: 424242,
        signature: ["test_sig"]
    });
    console.log("📋 Compiled calldata:", calldata);

    const call = {
        contractAddress: VAULT_ADDRESS,
        entrypoint: 'execute_intent',
        calldata
    };

    console.log("\n⚙️  Calling solverAccount.execute()...");
    try {
        const resp = await solverAccount.execute(call);
        console.log("✅ execute() returned");
        console.log("Type of response:", typeof resp);
        console.log("Is null?", resp === null);
        console.log("Is undefined?", resp === undefined);
        console.log("Keys:", resp ? Object.keys(resp) : 'N/A');
        console.log("transaction_hash value:", (resp as any)?.transaction_hash);
        console.log("Full JSON:", JSON.stringify(resp, null, 2));
    } catch (err: any) {
        console.error("❌ execute() threw:", err?.message || err);
        console.error("Full error:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    }
}

main().catch(console.error);
