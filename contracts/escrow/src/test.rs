#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

fn setup_test() -> (Env, Address, Address, Address, Address, Address, EscrowContractClient<'static>) {
    let env = Env::default();
    env.mock_all_auths();

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token_admin = Address::generate(&env);

    // Register a token
    let token_address = env.register_stellar_asset_contract(token_admin.clone());
    let token_client = soroban_sdk::token::Client::new(&env, &token_address);
    // Mint tokens to the client
    token_client.mint(&client, &10_000);

    let escrow_id = env.register(EscrowContract, ());
    let escrow_client = EscrowContractClient::new(&env, &escrow_id);

    escrow_client.initialize(&client, &freelancer, &arbitrator, &token_address);

    (env, client, freelancer, arbitrator, token_admin, token_address, escrow_client)
}

#[test]
fn test_milestone_success_flow() {
    let (env, client, freelancer, _arbitrator, _token_admin, token_address, escrow_client) = setup_test();
    let token_client = soroban_sdk::token::Client::new(&env, &token_address);

    // Initial balances
    assert_eq!(token_client.balance(&client), 10_000);
    assert_eq!(token_client.balance(&freelancer), 0);
    assert_eq!(token_client.balance(&escrow_client.address), 0);

    // 1. Deposit
    escrow_client.deposit(&1, &1000);
    assert_eq!(token_client.balance(&client), 9_000);
    assert_eq!(token_client.balance(&escrow_client.address), 1000);

    let milestone = escrow_client.get_milestone(&1).unwrap();
    assert_eq!(milestone.amount, 1000);
    assert_eq!(milestone.status, 1); // Funded

    // 2. Submit
    escrow_client.submit(&1);
    let milestone = escrow_client.get_milestone(&1).unwrap();
    assert_eq!(milestone.status, 2); // Submitted

    // 3. Release
    escrow_client.release(&1);
    let milestone = escrow_client.get_milestone(&1).unwrap();
    assert_eq!(milestone.status, 3); // Released

    assert_eq!(token_client.balance(&freelancer), 1000);
    assert_eq!(token_client.balance(&escrow_client.address), 0);
}

#[test]
fn test_milestone_dispute_and_resolution() {
    let (env, client, freelancer, arbitrator, _token_admin, token_address, escrow_client) = setup_test();
    let token_client = soroban_sdk::token::Client::new(&env, &token_address);

    // Deposit & Dispute
    escrow_client.deposit(&1, &2000);
    escrow_client.dispute(&client, &1); // Client disputes

    let milestone = escrow_client.get_milestone(&1).unwrap();
    assert_eq!(milestone.status, 4); // Disputed

    // Resolve: 1500 to freelancer, 500 back to client
    escrow_client.resolve(&1, &1500, &500);

    let milestone = escrow_client.get_milestone(&1).unwrap();
    assert_eq!(milestone.status, 5); // Resolved

    assert_eq!(token_client.balance(&freelancer), 1500);
    assert_eq!(token_client.balance(&client), 8500); // 10000 - 2000 + 500 = 8500
}

#[test]
fn test_milestone_refund_by_freelancer() {
    let (env, client, freelancer, _arbitrator, _token_admin, token_address, escrow_client) = setup_test();
    let token_client = soroban_sdk::token::Client::new(&env, &token_address);

    // Deposit & Refund by freelancer
    escrow_client.deposit(&1, &1500);
    escrow_client.refund_by_freelancer(&1);

    let milestone = escrow_client.get_milestone(&1).unwrap();
    assert_eq!(milestone.status, 5); // Resolved/Cancelled

    assert_eq!(token_client.balance(&freelancer), 0);
    assert_eq!(token_client.balance(&client), 10_000); // Refunded completely
}

#[test]
#[should_panic(expected = "milestone must be funded to submit")]
fn test_submit_without_funding() {
    let (_env, _client, _freelancer, _arbitrator, _token_admin, _token_address, escrow_client) = setup_test();
    escrow_client.submit(&1);
}

#[test]
#[should_panic(expected = "shares sum must equal total milestone amount")]
fn test_invalid_resolution_shares() {
    let (_env, client, _freelancer, _arbitrator, _token_admin, _token_address, escrow_client) = setup_test();
    escrow_client.deposit(&1, &1000);
    escrow_client.dispute(&client, &1);
    escrow_client.resolve(&1, &500, &600); // Sum is 1100, which is invalid
}

#[test]
fn test_deposit_with_deadline_success() {
    let (env, client, _freelancer, _arbitrator, _token_admin, token_address, escrow_client) = setup_test();
    let token_client = soroban_sdk::token::Client::new(&env, &token_address);

    let deadline_timestamp = 1787500000;
    escrow_client.deposit_with_deadline(&1, &2500, &deadline_timestamp);

    let milestone = escrow_client.get_milestone(&1).unwrap();
    assert_eq!(milestone.amount, 2500);
    assert_eq!(milestone.status, 1); // Funded
    assert_eq!(milestone.deadline, deadline_timestamp);
    assert_eq!(token_client.balance(&escrow_client.address), 2500);
    assert_eq!(token_client.balance(&client), 7500);
}

#[test]
fn test_claim_expired_milestone_clawback() {
    let (env, client, _freelancer, _arbitrator, _token_admin, token_address, escrow_client) = setup_test();
    let token_client = soroban_sdk::token::Client::new(&env, &token_address);

    let deadline = 1000;
    env.ledger().set_timestamp(500);
    escrow_client.deposit_with_deadline(&1, &3000, &deadline);

    // Fast-forward timestamp past deadline
    env.ledger().set_timestamp(1500);

    // Client executes timeout clawback
    escrow_client.claim_expired(&1);

    let milestone = escrow_client.get_milestone(&1).unwrap();
    assert_eq!(milestone.status, 5); // Resolved / Refunded
    assert_eq!(token_client.balance(&client), 10_000); // Fully recovered
    assert_eq!(token_client.balance(&escrow_client.address), 0);
}

#[test]
#[should_panic(expected = "cannot submit: milestone deadline has expired")]
fn test_submit_after_deadline_fails() {
    let (env, _client, _freelancer, _arbitrator, _token_admin, _token_address, escrow_client) = setup_test();

    let deadline = 1000;
    env.ledger().set_timestamp(500);
    escrow_client.deposit_with_deadline(&1, &2000, &deadline);

    // Fast-forward past deadline
    env.ledger().set_timestamp(1500);

    // Submitting work after deadline must panic
    escrow_client.submit(&1);
}
