// Simulates exactly what the /execute-intent route does, with full logging
import { Account, RpcProvider, cairo, CallData } from 'starknet';
import * as dotenv from 'dotenv';

dotenv.config();

const RPC_URL = process.env.STARKNET_RPC_URL || '';
const SOLVER_ADDRESS = process.env.SOLVER_ADDRESS || '';
const SOLVER_PRIVATE_KEY = process.env.SOLVER_PRIVATE_KEY || '';
const VAULT_ADDRESS = process.env.VAULT_CONTRACT_ADDRESS || '';

// Same payload the frontend sends
const body = {
    userStarknetAddress: '0x00C6BcFC563673a1E8dB31C303Bb7801F188f203A1bbfC1c71e610D3f28F0d8C',
    btcAmount: 1000000,
    targetVesuVault: '0x405241a6d928e3194ed3bfb071ad21edc4778fa4723f81722fa790218368190',
    nonce: Math.floor(Math.random() * 1000000),
    signature: 'J8rKzvPApsYHkt0vVyuspyV+H+hI8anUqWElfIaR1p7qGJG8MYpiNK2+IENq7dzcN5oxm4EZsrQssOaPrkb3pMs='
};

async function simulateRoute() {
    const { userStarknetAddress, btcAmount, targetVesuVault, nonce, signature } = body;

    console.log('\n📥 [SIMULATING ROUTE HANDLER]');
    console.log('VAULT_ADDRESS:', VAULT_ADDRESS);
    console.log('nonce:', nonce);
    console.log('signature (first 20 chars):', signature.substring(0, 20));

    const provider = await RpcProvider.create({ nodeUrl: RPC_URL });
    const solverAccount = new Account({ provider, address: SOLVER_ADDRESS, signer: SOLVER_PRIVATE_KEY });

    try {
        console.log('\n📋 Compiling calldata...');
        const calldata = CallData.compile({
            user_address: userStarknetAddress,
            amount: cairo.uint256(btcAmount),
            target_protocol: targetVesuVault,
            nonce: nonce,
            signature: [] as string[] // BTC sig verified off-chain
        });
        console.log('Calldata compiled, length:', calldata.length);
        console.log('Calldata[6] (sig length):', calldata[6]);
        console.log('Calldata[7] (sig value):', calldata[7]);

        const executeIntentCall = {
            contractAddress: VAULT_ADDRESS,
            entrypoint: 'execute_intent',
            calldata
        };

        console.log('\n⚙️  Calling execute()...');
        const executeResponse = await solverAccount.execute(executeIntentCall);
        console.log('\n🔍 execute() response:', JSON.stringify(executeResponse, null, 2));

        const transaction_hash = (executeResponse as any).transaction_hash;
        console.log('\ntransaction_hash type:', typeof transaction_hash);
        console.log('transaction_hash value:', transaction_hash);
        console.log('!transaction_hash:', !transaction_hash);

        if (!transaction_hash) {
            console.log('\n❌ Guard triggered! Would return 500');
        } else {
            console.log('\n✅ Guard passed! Would return 200 with txHash:', transaction_hash);
        }

    } catch (err: any) {
        console.error('\n❌ Error thrown:', err?.message || err);
    }
}

simulateRoute().catch(console.error);
