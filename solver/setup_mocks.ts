import { Account, RpcProvider, json, CallData, cairo } from 'starknet';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const RPC_URL = process.env.STARKNET_RPC_URL || '';
const SOLVER_ADDRESS = process.env.SOLVER_ADDRESS || '';
const SOLVER_PRIVATE_KEY = process.env.SOLVER_PRIVATE_KEY || '';

async function deployContract(account: Account, name: string, constructorCalldata: any[] = []) {
    const sierraPath = path.resolve(__dirname, `../contracts/target/dev/btc_intent_vault_${name}.contract_class.json`);
    const casmPath = path.resolve(__dirname, `../contracts/target/dev/btc_intent_vault_${name}.compiled_contract_class.json`);

    const compiledSierra = json.parse(fs.readFileSync(sierraPath).toString('ascii'));
    const compiledCasm = json.parse(fs.readFileSync(casmPath).toString('ascii'));

    console.log(`\n📦 Deploying ${name}...`);
    const deployResponse = await account.declareAndDeploy({
        contract: compiledSierra,
        casm: compiledCasm,
        constructorCalldata
    });

    console.log(`⏳ Waiting for Starknet... (Hash: ${deployResponse.deploy.transaction_hash})`);
    await account.waitForTransaction(deployResponse.deploy.transaction_hash);
    console.log(`✅ ${name} Deployed: ${deployResponse.deploy.contract_address}`);
    return deployResponse.deploy.contract_address;
}

async function main() {
    const provider = new RpcProvider({ nodeUrl: RPC_URL });
    const account = new Account({ provider, address: SOLVER_ADDRESS, signer: SOLVER_PRIVATE_KEY });
    console.log(`🚀 Connected Deployer: ${account.address}`);

    // 1. Deploy Mock BTC
    const btcAddress = await deployContract(account, 'MockBTC');

    // 2. Deploy Mock Vesu Vault
    const vesuAddress = await deployContract(account, 'MockVesu', [btcAddress]);

    // 3. Deploy The Real Intent Vault
    const vaultAddress = await deployContract(account, 'IntentVault', [btcAddress, account.address, vesuAddress]);

    // 4. Mint 1,000,000 units of Mock BTC to the Solver Wallet
    console.log(`\n💰 Minting Mock BTC to Solver...`);
    const { transaction_hash } = await account.execute({
        contractAddress: btcAddress,
        entrypoint: 'mint',
        calldata: CallData.compile({
            recipient: account.address,
            amount: cairo.uint256(1000000)
        })
    });
    await account.waitForTransaction(transaction_hash);
    console.log(`✅ Mock BTC Minted!`);

    console.log(`\n🎉 SETUP COMPLETE! Update your frontend and .env files with these:`);
    console.log(`TARGET_VESU_VAULT="${vesuAddress}"`);
    console.log(`VAULT_CONTRACT_ADDRESS="${vaultAddress}"`);
}

main().catch(console.error);
