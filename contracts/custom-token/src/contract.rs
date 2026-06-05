//! Custom token contract.
//!
//! Implements the SEP-41 token interface (the standard Soroban fungible token
//! interface: `transfer`, `balance`, `approve`, `allowance`, `burn`, plus
//! metadata) together with an admin-controlled `mint` and `set_admin`.
//!
//! The public methods here are exactly what the wallet front-end calls through
//! the Stellar SDK (`Contract.call("transfer", ...)`, etc).

use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, String};

use crate::storage::{
    extend_instance_ttl, has_admin, read_admin, read_allowance, read_balance, read_metadata,
    receive_balance, spend_allowance, spend_balance, write_admin, write_allowance, write_metadata,
    TokenMetadata,
};

fn check_nonnegative_amount(amount: i128) {
    if amount < 0 {
        panic!("negative amounts are not allowed");
    }
}

#[contract]
pub struct CustomToken;

#[contractimpl]
impl CustomToken {
    /// One-time setup. Sets the admin (the only account allowed to mint) and
    /// the token metadata. Panics if called twice.
    pub fn initialize(e: Env, admin: Address, decimal: u32, name: String, symbol: String) {
        if has_admin(&e) {
            panic!("contract already initialized");
        }
        if decimal > 18 {
            panic!("decimal must not be greater than 18");
        }
        write_admin(&e, &admin);
        write_metadata(
            &e,
            &TokenMetadata {
                decimal,
                name,
                symbol,
            },
        );
        extend_instance_ttl(&e);
    }

    /// Create new tokens and credit them to `to`. Admin only.
    pub fn mint(e: Env, to: Address, amount: i128) {
        check_nonnegative_amount(amount);
        let admin = read_admin(&e);
        admin.require_auth();
        extend_instance_ttl(&e);

        receive_balance(&e, to.clone(), amount);
        e.events()
            .publish((symbol_short!("mint"), admin, to), amount);
    }

    /// Transfer the admin role to a new account. Admin only.
    pub fn set_admin(e: Env, new_admin: Address) {
        let admin = read_admin(&e);
        admin.require_auth();
        extend_instance_ttl(&e);

        write_admin(&e, &new_admin);
        e.events()
            .publish((symbol_short!("set_admin"), admin), new_admin);
    }

    /// The current admin account.
    pub fn admin(e: Env) -> Address {
        read_admin(&e)
    }

    // --- SEP-41 token interface ------------------------------------------

    pub fn allowance(e: Env, from: Address, spender: Address) -> i128 {
        extend_instance_ttl(&e);
        read_allowance(&e, from, spender).amount
    }

    pub fn approve(e: Env, from: Address, spender: Address, amount: i128, expiration_ledger: u32) {
        from.require_auth();
        check_nonnegative_amount(amount);
        extend_instance_ttl(&e);

        write_allowance(
            &e,
            from.clone(),
            spender.clone(),
            amount,
            expiration_ledger,
        );
        e.events().publish(
            (symbol_short!("approve"), from, spender),
            (amount, expiration_ledger),
        );
    }

    pub fn balance(e: Env, id: Address) -> i128 {
        extend_instance_ttl(&e);
        read_balance(&e, id)
    }

    pub fn transfer(e: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        check_nonnegative_amount(amount);
        extend_instance_ttl(&e);

        spend_balance(&e, from.clone(), amount);
        receive_balance(&e, to.clone(), amount);
        e.events()
            .publish((symbol_short!("transfer"), from, to), amount);
    }

    pub fn transfer_from(e: Env, spender: Address, from: Address, to: Address, amount: i128) {
        spender.require_auth();
        check_nonnegative_amount(amount);
        extend_instance_ttl(&e);

        spend_allowance(&e, from.clone(), spender, amount);
        spend_balance(&e, from.clone(), amount);
        receive_balance(&e, to.clone(), amount);
        e.events()
            .publish((symbol_short!("transfer"), from, to), amount);
    }

    pub fn burn(e: Env, from: Address, amount: i128) {
        from.require_auth();
        check_nonnegative_amount(amount);
        extend_instance_ttl(&e);

        spend_balance(&e, from.clone(), amount);
        e.events().publish((symbol_short!("burn"), from), amount);
    }

    pub fn burn_from(e: Env, spender: Address, from: Address, amount: i128) {
        spender.require_auth();
        check_nonnegative_amount(amount);
        extend_instance_ttl(&e);

        spend_allowance(&e, from.clone(), spender, amount);
        spend_balance(&e, from.clone(), amount);
        e.events().publish((symbol_short!("burn"), from), amount);
    }

    // --- Metadata --------------------------------------------------------

    pub fn decimals(e: Env) -> u32 {
        read_metadata(&e).decimal
    }

    pub fn name(e: Env) -> String {
        read_metadata(&e).name
    }

    pub fn symbol(e: Env) -> String {
        read_metadata(&e).symbol
    }
}
