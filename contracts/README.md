# Custom Token Smart Contract (Soroban)

This folder contains a **real Soroban smart contract** written in Rust that
implements a custom fungible token (the SEP-41 token interface) plus an
admin-controlled `mint`. The wallet front-end in this project talks to a
deployed instance of this contract through the Stellar SDK.

> Soroban contracts are compiled to WASM and deployed from your own machine
> using the Rust toolchain and the `stellar` CLI. v0 cannot compile or deploy
> Rust for you, so follow the steps below in your local terminal. Once deployed,
> paste the resulting **Contract ID** (`C...`) into the wallet's **Tokens** page.

---

## 1. Install the toolchain (once)

```bash
# Rust + the wasm target
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown      # Rust < 1.85
# (newer toolchains use: rustup target add wasm32v1-none)

# Stellar CLI
cargo install --locked stellar-cli
# or: brew install stellar-cli
```

## 2. Create deployer identities

```bash
# Testnet identity (auto-funded by Friendbot)
stellar keys generate --global alice --network testnet --fund

# Mainnet identity (you must fund this account with real XLM yourself)
stellar keys generate --global alice-main --network mainnet
```

## 3. Build the contract

From this `contracts/custom-token` directory:

```bash
cd custom-token
stellar contract build
# Output: target/wasm32-unknown-unknown/release/custom_token.wasm
```

Run the unit tests (optional but recommended):

```bash
cargo test
```

## 4. Deploy

### Testnet

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/custom_token.wasm \
  --source alice \
  --network testnet
```

This prints the **Contract ID** (starts with `C...`). Save it.

### Mainnet

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/custom_token.wasm \
  --source alice-main \
  --network mainnet
```

## 5. Initialize the token

Replace `CXXXX...` with your Contract ID and `GADMIN...` with the public key of
the account that should control minting (typically your wallet's address).

```bash
stellar contract invoke \
  --id CXXXX... \
  --source alice \
  --network testnet \
  -- initialize \
  --admin GADMIN... \
  --decimal 7 \
  --name "My Token" \
  --symbol "MYT"
```

- `decimal`: number of decimal places (7 is the Stellar convention).
- `name` / `symbol`: human-readable metadata shown in the wallet.

## 6. Mint the initial supply (admin only)

```bash
stellar contract invoke \
  --id CXXXX... \
  --source alice \
  --network testnet \
  -- mint \
  --to GADMIN... \
  --amount 1000000000000   # 100,000 tokens at 7 decimals (100000 * 10^7)
```

## 7. Use it in the wallet

1. Open the wallet and go to the **Tokens** page.
2. Click **Add token** and paste your Contract ID (`C...`).
3. The wallet reads the token name, symbol, decimals, and your balance directly
   from the contract on-chain.
4. If your connected wallet is the token **admin**, a **Mint** action appears.
   Anyone holding the token can **Transfer** it.

---

## Contract interface

| Method | Auth | Description |
| --- | --- | --- |
| `initialize(admin, decimal, name, symbol)` | — | One-time setup. |
| `mint(to, amount)` | admin | Create new tokens. |
| `set_admin(new_admin)` | admin | Hand over admin rights. |
| `admin()` | — | Read the current admin. |
| `transfer(from, to, amount)` | from | Move tokens. |
| `balance(id)` | — | Read a balance. |
| `approve(from, spender, amount, expiration_ledger)` | from | Set an allowance. |
| `allowance(from, spender)` | — | Read an allowance. |
| `transfer_from(spender, from, to, amount)` | spender | Spend an allowance. |
| `burn(from, amount)` | from | Destroy your tokens. |
| `burn_from(spender, from, amount)` | spender | Burn via allowance. |
| `decimals()` / `name()` / `symbol()` | — | Token metadata. |

> **Amounts are integers in base units.** A balance of `1000000000` on a token
> with `decimal = 7` represents `100.0` tokens. The wallet UI handles this
> conversion for you.

## Network note

The wallet chooses testnet vs mainnet from the `STELLAR_NETWORK` environment
variable (`testnet` by default, `mainnet`/`public` for production). Make sure
you deploy the contract on the same network the wallet is pointed at.
