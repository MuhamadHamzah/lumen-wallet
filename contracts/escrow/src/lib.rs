#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Milestone {
    pub amount: i128,
    pub status: u32, // 0 = Created, 1 = Funded, 2 = Submitted, 3 = Released, 4 = Disputed, 5 = Resolved
}

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Client,
    Freelancer,
    Arbitrator,
    Token,
    Milestone(u32),
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    /// Initialize the escrow contract with roles and the target payment token.
    pub fn initialize(
        env: Env,
        client: Address,
        freelancer: Address,
        arbitrator: Address,
        token: Address,
    ) {
        if env.storage().instance().has(&DataKey::Client) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Client, &client);
        env.storage().instance().set(&DataKey::Freelancer, &freelancer);
        env.storage().instance().set(&DataKey::Arbitrator, &arbitrator);
        env.storage().instance().set(&DataKey::Token, &token);
    }

    /// Deposit funds into a milestone. Requires client authentication.
    pub fn deposit(env: Env, id: u32, amount: i128) {
        let client: Address = env.storage().instance().get(&DataKey::Client).unwrap();
        client.require_auth();

        if amount <= 0 {
            panic!("amount must be positive");
        }

        let milestone_key = DataKey::Milestone(id);
        if env.storage().instance().has(&milestone_key) {
            let m: Milestone = env.storage().instance().get(&milestone_key).unwrap();
            if m.status != 0 {
                panic!("milestone already funded or processed");
            }
        }

        // Lock tokens from client into the escrow contract
        let token: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = soroban_sdk::token::Client::new(&env, &token);
        token_client.transfer(&client, &env.current_contract_address(), &amount);

        let milestone = Milestone {
            amount,
            status: 1, // Funded
        };
        env.storage().instance().set(&milestone_key, &milestone);
    }

    /// Submit a milestone (freelancer completed the work). Requires freelancer authentication.
    pub fn submit(env: Env, id: u32) {
        let freelancer: Address = env.storage().instance().get(&DataKey::Freelancer).unwrap();
        freelancer.require_auth();

        let milestone_key = DataKey::Milestone(id);
        let mut milestone: Milestone = env.storage().instance().get(&milestone_key).expect("milestone not found");

        if milestone.status != 1 {
            panic!("milestone must be funded to submit");
        }

        milestone.status = 2; // Submitted
        env.storage().instance().set(&milestone_key, &milestone);
    }

    /// Release milestone funds to the freelancer. Requires client authentication.
    pub fn release(env: Env, id: u32) {
        let client: Address = env.storage().instance().get(&DataKey::Client).unwrap();
        client.require_auth();

        let milestone_key = DataKey::Milestone(id);
        let mut milestone: Milestone = env.storage().instance().get(&milestone_key).expect("milestone not found");

        // Allowed to release if funded, submitted, or disputed
        if milestone.status != 1 && milestone.status != 2 && milestone.status != 4 {
            panic!("invalid milestone status for release");
        }

        let amount = milestone.amount;
        milestone.status = 3; // Released
        env.storage().instance().set(&milestone_key, &milestone);

        // Transfer funds from contract to freelancer
        let freelancer: Address = env.storage().instance().get(&DataKey::Freelancer).unwrap();
        let token: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = soroban_sdk::token::Client::new(&env, &token);
        token_client.transfer(&env.current_contract_address(), &freelancer, &amount);
    }

    /// Dispute a milestone. Requires either client or freelancer authentication.
    pub fn dispute(env: Env, caller: Address, id: u32) {
        caller.require_auth();

        let client: Address = env.storage().instance().get(&DataKey::Client).unwrap();
        let freelancer: Address = env.storage().instance().get(&DataKey::Freelancer).unwrap();

        if caller != client && caller != freelancer {
            panic!("unauthorized caller for dispute");
        }

        let milestone_key = DataKey::Milestone(id);
        let mut milestone: Milestone = env.storage().instance().get(&milestone_key).expect("milestone not found");

        if milestone.status != 1 && milestone.status != 2 {
            panic!("milestone cannot be disputed at current state");
        }

        milestone.status = 4; // Disputed
        env.storage().instance().set(&milestone_key, &milestone);
    }

    /// Resolve a dispute. Requires arbitrator authentication.
    pub fn resolve(env: Env, id: u32, freelancer_share: i128, client_share: i128) {
        let arbitrator: Address = env.storage().instance().get(&DataKey::Arbitrator).unwrap();
        arbitrator.require_auth();

        let milestone_key = DataKey::Milestone(id);
        let mut milestone: Milestone = env.storage().instance().get(&milestone_key).expect("milestone not found");

        if milestone.status != 4 {
            panic!("milestone must be in dispute state to resolve");
        }

        if freelancer_share < 0 || client_share < 0 {
            panic!("shares must be non-negative");
        }

        if freelancer_share + client_share != milestone.amount {
            panic!("shares sum must equal total milestone amount");
        }

        milestone.status = 5; // Resolved
        env.storage().instance().set(&milestone_key, &milestone);

        let token: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = soroban_sdk::token::Client::new(&env, &token);

        let client: Address = env.storage().instance().get(&DataKey::Client).unwrap();
        let freelancer: Address = env.storage().instance().get(&DataKey::Freelancer).unwrap();

        if freelancer_share > 0 {
            token_client.transfer(&env.current_contract_address(), &freelancer, &freelancer_share);
        }
        if client_share > 0 {
            token_client.transfer(&env.current_contract_address(), &client, &client_share);
        }
    }

    /// Cancel a milestone and refund to client. Initiated voluntarily by the freelancer.
    pub fn refund_by_freelancer(env: Env, id: u32) {
        let freelancer: Address = env.storage().instance().get(&DataKey::Freelancer).unwrap();
        freelancer.require_auth();

        let milestone_key = DataKey::Milestone(id);
        let mut milestone: Milestone = env.storage().instance().get(&milestone_key).expect("milestone not found");

        if milestone.status != 1 && milestone.status != 2 {
            panic!("cannot refund at current state");
        }

        let amount = milestone.amount;
        milestone.status = 5; // Resolved/Cancelled
        env.storage().instance().set(&milestone_key, &milestone);

        let client: Address = env.storage().instance().get(&DataKey::Client).unwrap();
        let token: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = soroban_sdk::token::Client::new(&env, &token);
        token_client.transfer(&env.current_contract_address(), &client, &amount);
    }

    // Getters
    pub fn get_client(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Client).unwrap()
    }

    pub fn get_freelancer(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Freelancer).unwrap()
    }

    pub fn get_arbitrator(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Arbitrator).unwrap()
    }

    pub fn get_token(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Token).unwrap()
    }

    pub fn get_milestone(env: Env, id: u32) -> Option<Milestone> {
        let milestone_key = DataKey::Milestone(id);
        if env.storage().instance().has(&milestone_key) {
            Some(env.storage().instance().get(&milestone_key).unwrap())
        } else {
            None
        }
    }
}

#[cfg(test)]
mod test;
