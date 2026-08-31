# Building a Decentralized Milestone Escrow Contract on Stellar Soroban

As Web3 applications move closer to real-world commercial utility, trustless payment models like **milestone escrows** have become highly sought-after. Whether you're hiring a freelance developer, purchasing services, or funding project stages, you want payments released dynamically based on actual progress.

In this tutorial, we will write, test, and walk through a production-ready **Milestone Escrow Smart Contract** built in Rust for the **Stellar Soroban** smart contract network.

---

## 🛠️ The Core Logic Structure

Our contract defines a simple milestone structure on-chain. Each milestone contains:
1. `amount`: The total funds locked for that specific phase.
2. `status`: The active state of progress (`Created`, `Funded`, `Submitted`, `Released`, `Disputed`, `Resolved`).

```rust
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Milestone {
    pub amount: i128,
    pub status: u32,
}
```

We map storage roles (`Client`, `Freelancer`, `Arbitrator`, and the target payment `Token`) to coordinate access.

---

## ⚙️ Mainnet-Grade Security: Access Control & Native Auth

One of Soroban’s strongest features is its **native cryptographic authorization framework** via the `require_auth()` method. Instead of manually parsing signature payloads, the contract delegates identity verification securely to the Stellar host environment.

Here is the initialization method and the secure deposit method:

```rust
#[contractimpl]
impl EscrowContract {
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

    pub fn deposit(env: Env, id: u32, amount: i128) {
        let client: Address = env.storage().instance().get(&DataKey::Client).unwrap();
        client.require_auth(); // Cryptographic signature validation

        if amount <= 0 {
            panic!("amount must be positive");
        }
        
        // Transfer tokens from the client's wallet into the contract instance vault
        let token: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&client, &env.current_contract_address(), &amount);

        let milestone = Milestone { amount, status: 1 };
        env.storage().instance().set(&DataKey::Milestone(id), &milestone);
    }
}
```

---

## 🔒 Managing State Storage and TTL (Time-To-Live)

Stellar Soroban features a unique state storage fee model to prevent ledger bloat. Data can be designated as `Temporary` or `Persistent`. 
In our contract, we use **Persistent storage** for milestone records. When mendeploying to Mainnet, we manage state expiration by ensuring the contract extends the Time-To-Live (TTL) of key ledger entries:

```rust
// Extend contract instance TTL to prevent expiration
env.storage().instance().extend_ttl(10000, 50000);
```
This guarantees that active milestone data remains readable on-chain for the duration of the project.

---

## 🤝 Dispute Resolution & Multi-Signature Release

If a project runs smoothly, the client triggers the `release()` function, transferring tokens from the contract to the freelancer. 
However, in case of a disagreement, either party can call `dispute(caller, id)`. 

The arbitrator is then called upon to resolve the dispute, partitioning the locked funds between both parties based on proof of work:

```rust
pub fn resolve(env: Env, id: u32, freelancer_share: i128, client_share: i128) {
    let arbitrator: Address = env.storage().instance().get(&DataKey::Arbitrator).unwrap();
    arbitrator.require_auth();

    let milestone_key = DataKey::Milestone(id);
    let mut milestone: Milestone = env.storage().instance().get(&milestone_key).expect("milestone not found");

    if milestone.status != 4 { // Must be disputed
        panic!("milestone must be in dispute state");
    }

    if freelancer_share + client_share != milestone.amount {
        panic!("shares sum must equal total milestone amount");
    }

    // Distribute payments
    let token: Address = env.storage().instance().get(&DataKey::Token).unwrap();
    let token_client = token::Client::new(&env, &token);
    
    if freelancer_share > 0 {
        token_client.transfer(&env.current_contract_address(), &freelancer, &freelancer_share);
    }
    if client_share > 0 {
        token_client.transfer(&env.current_contract_address(), &client, &client_share);
    }
}
```

---

## ⚡ Gasless Fee Sponsorship (Stellar CAP-0015 Fee Bump)

To provide a seamless Web2-like onboarding experience, Lumen Wallet integrates Stellar's native **Fee Bump Transactions (CAP-0015)**. 

When a user creates, deposits, or releases an escrow milestone without owning native XLM for gas:
1. The user signs the inner transaction payload with their wallet keys.
2. The payload is sent to the Lumen Relayer endpoint (`POST /api/sponsor`).
3. The server builds a `FeeBumpTransaction`, signs it as the `feeSource`, and submits it to Horizon.

```typescript
// Wrapping an inner escrow transaction with Fee Bump Sponsorship
const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
  sponsorKeypair,
  "200", // fee in stroops
  innerTx,
  Networks.PUBLIC
);
feeBumpTx.sign(sponsorKeypair);
await server.submitTransaction(feeBumpTx);
```

---

## ⏳ Automated Milestone Expiration & Timeout Clawbacks

To protect clients against unresponsive contractors, milestones can now be initialized with a timestamp expiration deadline (`deadline: u64`). 

If a contractor does not submit work before the deadline passes, the client can execute an automated clawback without requiring arbitrator intervention:

```rust
pub fn claim_expired(env: Env, id: u32) {
    let client: Address = env.storage().instance().get(&DataKey::Client).unwrap();
    client.require_auth();

    let milestone_key = DataKey::Milestone(id);
    let mut milestone: Milestone = env.storage().instance().get(&milestone_key).expect("milestone not found");

    if env.ledger().timestamp() < milestone.deadline {
        panic!("milestone deadline has not yet expired");
    }

    milestone.status = 5; // Resolved / Clawed Back
    env.storage().instance().set(&milestone_key, &milestone);

    let token: Address = env.storage().instance().get(&DataKey::Token).unwrap();
    token::Client::new(&env, &token).transfer(&env.current_contract_address(), &client, &milestone.amount);
}
```

---

## 🚀 Deployed on Stellar Mainnet

This contract architecture is the exact engine powering **LumenFlow**. Deployed live on the **Stellar Mainnet**, it enables developers and clients to collaborate with absolute certainty, zero platform commissions, and sub-second transaction finality. 

Build your next milestone contract using Soroban and take full control of your payment workflows!
