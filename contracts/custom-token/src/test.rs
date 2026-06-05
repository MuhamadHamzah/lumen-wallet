#![cfg(test)]

use crate::{CustomToken, CustomTokenClient};
use soroban_sdk::{testutils::Address as _, Address, Env, String};

fn create_token<'a>(e: &Env, admin: &Address) -> CustomTokenClient<'a> {
    let contract_id = e.register(CustomToken, ());
    let client = CustomTokenClient::new(e, &contract_id);
    client.initialize(
        admin,
        &7u32,
        &String::from_str(e, "Demo Token"),
        &String::from_str(e, "DEMO"),
    );
    client
}

#[test]
fn test_mint_and_transfer() {
    let e = Env::default();
    e.mock_all_auths();

    let admin = Address::generate(&e);
    let user1 = Address::generate(&e);
    let user2 = Address::generate(&e);

    let token = create_token(&e, &admin);

    assert_eq!(token.decimals(), 7);
    assert_eq!(token.name(), String::from_str(&e, "Demo Token"));
    assert_eq!(token.symbol(), String::from_str(&e, "DEMO"));

    token.mint(&user1, &1_000);
    assert_eq!(token.balance(&user1), 1_000);

    token.transfer(&user1, &user2, &400);
    assert_eq!(token.balance(&user1), 600);
    assert_eq!(token.balance(&user2), 400);
}

#[test]
fn test_approve_and_transfer_from() {
    let e = Env::default();
    e.mock_all_auths();

    let admin = Address::generate(&e);
    let owner = Address::generate(&e);
    let spender = Address::generate(&e);
    let recipient = Address::generate(&e);

    let token = create_token(&e, &admin);
    token.mint(&owner, &1_000);

    let expiration = e.ledger().sequence() + 1_000;
    token.approve(&owner, &spender, &500, &expiration);
    assert_eq!(token.allowance(&owner, &spender), 500);

    token.transfer_from(&spender, &owner, &recipient, &300);
    assert_eq!(token.balance(&owner), 700);
    assert_eq!(token.balance(&recipient), 300);
    assert_eq!(token.allowance(&owner, &spender), 200);
}

#[test]
fn test_burn() {
    let e = Env::default();
    e.mock_all_auths();

    let admin = Address::generate(&e);
    let user = Address::generate(&e);

    let token = create_token(&e, &admin);
    token.mint(&user, &1_000);

    token.burn(&user, &250);
    assert_eq!(token.balance(&user), 750);
}

#[test]
#[should_panic(expected = "insufficient balance")]
fn test_transfer_insufficient_balance() {
    let e = Env::default();
    e.mock_all_auths();

    let admin = Address::generate(&e);
    let user1 = Address::generate(&e);
    let user2 = Address::generate(&e);

    let token = create_token(&e, &admin);
    token.mint(&user1, &100);
    token.transfer(&user1, &user2, &200);
}
