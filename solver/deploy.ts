import { Account, RpcProvider, json } from 'starknet';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const RPC_URL = process.env.STARKNET_RPC_URL || '';
const SOLVER_ADDRESS = process.env.SOLVER_ADDRESS || '';
const SOLVER_PRIVATE_KEY = process.env.SOLVER_PRIVATE_KEY || '';

async function main() {
    console.log("🚀 Initiating Redefine Intent Vault Deployment...");

    const provider = new RpcProvider({ nodeUrl: RPC_URL });
    // cairoVersion: '1' skips the on-chain class lookup — required when the account isn't yet deployed
    const account = new Account({ provider, address: SOLVER_ADDRESS, signer: SOLVER_PRIVATE_KEY, cairoVersion: '1' });

    console.log(`✅ Connected Deployer Account: ${account.address}`);

    // 1. Load the compiled contract files from Scarb
    const sierraPath = path.resolve(__dirname, '../contracts/target/dev/btc_intent_vault_IntentVault.contract_class.json');
    const casmPath = path.resolve(__dirname, '../contracts/target/dev/btc_intent_vault_IntentVault.compiled_contract_class.json');

    const compiledSierra = json.parse(fs.readFileSync(sierraPath).toString('ascii'));
    const compiledCasm = json.parse(fs.readFileSync(casmPath).toString('ascii'));

    console.log("📦 Contract artifacts loaded. Declaring and Deploying...");

    // 2. Constructor Arguments
    // For this MVP deployment, we are passing standard Starknet ETH token addresses as mocks for BTC and Vesu
    // to ensure the constructor doesn't fail on address validation.
    const mockBtcAddress = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562B82f9e004dc7";
    const mockVesuAddress = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562B82f9e004dc7";

    try {
        // 3. Declare and Deploy in one go
        const deployResponse = await account.declareAndDeploy({
            contract: compiledSierra,
            casm: compiledCasm,
            constructorCalldata: [mockBtcAddress, account.address, mockVesuAddress]
        });

        console.log(`⏳ Transaction submitted! Hash: ${deployResponse.deploy.transaction_hash}`);
        console.log("⏳ Waiting for Starknet to accept the transaction (this takes a few seconds)...");

        await provider.waitForTransaction(deployResponse.deploy.transaction_hash);

        console.log(`\n🎉 DEPLOYMENT SUCCESSFUL!`);
        console.log(`📍 Contract Address: ${deployResponse.deploy.contract_address}`);
        console.log(`\n👉 NEXT STEP: Copy the Contract Address and paste it into your .env file as VAULT_CONTRACT_ADDRESS!`);
    } catch (error) {
        console.error("❌ Deployment Failed:", error);
    }
}

main().catch(console.error);
