use starknet::ContractAddress;

// --- INTERFACES ---

#[starknet::interface]
pub trait IERC20<TContractState> {
    fn transfer_from(ref self: TContractState, sender: ContractAddress, recipient: ContractAddress, amount: u256) -> bool;
    fn approve(ref self: TContractState, spender: ContractAddress, amount: u256) -> bool;
    fn mint(ref self: TContractState, recipient: ContractAddress, amount: u256);
}

#[starknet::interface]
pub trait ISNIP22<TContractState> {
    fn deposit(ref self: TContractState, assets: u256, receiver: ContractAddress) -> u256;
}

#[starknet::interface]
pub trait IIntentVault<TContractState> {
    fn execute_intent(ref self: TContractState, user_address: ContractAddress, amount: u256, target_protocol: ContractAddress, nonce: felt252, signature: Array<felt252>);
}

// --- MOCK BTC ---

#[starknet::contract]
pub mod MockBTC {
    use super::{ContractAddress, IERC20};
    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess};

    #[storage]
    struct Storage {
        balances: Map<ContractAddress, u256>,
    }

    #[abi(embed_v0)]
    impl MockBTCImpl of IERC20<ContractState> {
        fn transfer_from(ref self: ContractState, sender: ContractAddress, recipient: ContractAddress, amount: u256) -> bool {
            // DEMO HACK: Skipping allowance math so the solver executes in 1 step
            let sender_balance = self.balances.read(sender);
            self.balances.write(sender, sender_balance - amount);
            let recipient_balance = self.balances.read(recipient);
            self.balances.write(recipient, recipient_balance + amount);
            true
        }

        fn approve(ref self: ContractState, spender: ContractAddress, amount: u256) -> bool { true }

        fn mint(ref self: ContractState, recipient: ContractAddress, amount: u256) {
            let current = self.balances.read(recipient);
            self.balances.write(recipient, current + amount);
        }
    }
}

// --- MOCK VESU VAULT ---

#[starknet::contract]
pub mod MockVesu {
    use super::{ContractAddress, ISNIP22, IERC20Dispatcher, IERC20DispatcherTrait};
    use starknet::{get_caller_address, get_contract_address};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    #[storage]
    struct Storage {
        btc_token: ContractAddress,
    }

    #[constructor]
    fn constructor(ref self: ContractState, btc_address: ContractAddress) {
        self.btc_token.write(btc_address);
    }

    #[abi(embed_v0)]
    impl MockVesuImpl of ISNIP22<ContractState> {
        fn deposit(ref self: ContractState, assets: u256, receiver: ContractAddress) -> u256 {
            let caller = get_caller_address();
            let this_contract = get_contract_address();
            let btc_addr = self.btc_token.read();

            // Pull the Mock BTC from the IntentVault into Vesu
            let btc = IERC20Dispatcher { contract_address: btc_addr };
            btc.transfer_from(caller, this_contract, assets);

            assets // Mocking the return of minted shares
        }
    }
}

// --- MAIN INTENT VAULT ---

#[starknet::contract]
pub mod IntentVault {
    use super::{ContractAddress, IERC20Dispatcher, IERC20DispatcherTrait, ISNIP22Dispatcher, ISNIP22DispatcherTrait, IIntentVault};
    use starknet::{get_caller_address, get_contract_address};
    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess, StoragePointerWriteAccess};

    #[storage]
    struct Storage {
        btc_token: ContractAddress,
        admin_solver: ContractAddress,
        vesu_vtoken: ContractAddress,
        executed_intents: Map<felt252, bool>,
    }

    #[constructor]
    fn constructor(ref self: ContractState, btc_address: ContractAddress, solver_address: ContractAddress, vesu_address: ContractAddress) {
        self.btc_token.write(btc_address);
        self.admin_solver.write(solver_address);
        self.vesu_vtoken.write(vesu_address);
    }

    #[abi(embed_v0)]
    impl IntentVaultImpl of IIntentVault<ContractState> {
        fn execute_intent(ref self: ContractState, user_address: ContractAddress, amount: u256, target_protocol: ContractAddress, nonce: felt252, signature: Array<felt252>) {
            let caller = get_caller_address();
            let this_contract = get_contract_address();

            // 1. Verify caller
            assert(caller == self.admin_solver.read(), 'Unauthorized solver');

            // 2. Prevent replay
            assert(!self.executed_intents.read(nonce), 'Intent already executed');
            self.executed_intents.write(nonce, true);

            // 3. Pull bridged BTC from Solver to this Vault
            let btc_addr = self.btc_token.read();
            let btc = IERC20Dispatcher { contract_address: btc_addr };
            btc.transfer_from(caller, this_contract, amount);

            // 4. Approve Vesu
            let vesu_addr = self.vesu_vtoken.read();
            btc.approve(vesu_addr, amount);

            // 5. Deposit into Vesu
            let vesu = ISNIP22Dispatcher { contract_address: vesu_addr };
            vesu.deposit(amount, user_address);
        }
    }
}
