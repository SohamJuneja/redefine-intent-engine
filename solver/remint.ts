import { Account, RpcProvider, CallData, cairo } from 'starknet';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
    const provider = await RpcProvider.create({ nodeUrl: process.env.STARKNET_RPC_URL! });
    const account = new Account({ provider, address: process.env.SOLVER_ADDRESS!, signer: process.env.SOLVER_PRIVATE_KEY! });

    console.log(`💰 Re-minting 100,000,000 MockBTC to solver...`);
    const { transaction_hash } = await account.execute({
        contractAddress: process.env.MOCK_BTC_ADDRESS!,
        entrypoint: 'mint',
        calldata: CallData.compile({
            recipient: process.env.SOLVER_ADDRESS!,
            amount: cairo.uint256(100_000_000)
        })
    });
    console.log(`⏳ TX: ${transaction_hash}`);
    await provider.waitForTransaction(transaction_hash);
    console.log(`✅ Minted! Solver balance restored.`);
}
main().catch(console.error);
