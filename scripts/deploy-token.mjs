/**
 * Deploy the Soroban custom token contract to Stellar Testnet using Node.js.
 * Uses Horizon for classic ops and Soroban RPC for contract deployment.
 *
 * Usage: node scripts/deploy-token.mjs
 */

import {
  Keypair,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Operation,
  Asset,
  StrKey,
  Horizon,
} from "@stellar/stellar-sdk";
import { Server as SorobanServer } from "@stellar/stellar-sdk/rpc";

const SOROBAN_TESTNET_URL = "https://soroban-testnet.stellar.org";
const HORIZON_TESTNET_URL = "https://horizon-testnet.stellar.org";
const FRIENDBOT_URL = "https://friendbot.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;

const TOKEN_SYMBOL = "LMT";
const TOKEN_NAME = "Lumen Token";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fundAccount(publicKey) {
  console.log(`💰 Funding ${publicKey.slice(0, 12)}... via Friendbot...`);
  const res = await fetch(`${FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (JSON.stringify(data).includes("already")) {
      console.log("   Already funded.");
      return;
    }
    throw new Error(`Friendbot failed: ${JSON.stringify(data)}`);
  }
  console.log("   ✅ Funded.");
}

async function main() {
  console.log("🚀 Lumen Token Deployment Script (Stellar Testnet)");
  console.log("=".repeat(55));

  const horizon = new Horizon.Server(HORIZON_TESTNET_URL);
  const soroban = new SorobanServer(SOROBAN_TESTNET_URL);

  // Step 1: Generate keypairs
  const issuer = Keypair.random();
  const distributor = Keypair.random();

  console.log(`\n🔑 Issuer:      ${issuer.publicKey()}`);
  console.log(`   Secret:      ${issuer.secret()}`);
  console.log(`🔑 Distributor: ${distributor.publicKey()}`);
  console.log(`   Secret:      ${distributor.secret()}`);

  // Step 2: Fund both accounts
  await fundAccount(issuer.publicKey());
  await fundAccount(distributor.publicKey());
  await sleep(5000);

  const customAsset = new Asset(TOKEN_SYMBOL, issuer.publicKey());
  console.log(`\n📦 Asset: ${customAsset.getCode()}:${customAsset.getIssuer()}`);

  // Step 3: Create trustline (classic op via Horizon)
  console.log(`\n🔗 Creating trustline for ${TOKEN_SYMBOL}...`);
  let distAccount = await horizon.loadAccount(distributor.publicKey());
  let tx = new TransactionBuilder(distAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.changeTrust({ asset: customAsset }))
    .setTimeout(60)
    .build();
  tx.sign(distributor);
  let result = await horizon.submitTransaction(tx);
  console.log(`   ✅ Trustline created. Hash: ${result.hash.slice(0, 12)}...`);

  await sleep(3000);

  // Step 4: Issue tokens (classic op via Horizon)
  console.log(`\n💎 Issuing 100,000 ${TOKEN_SYMBOL} tokens...`);
  let issuerAccount = await horizon.loadAccount(issuer.publicKey());
  tx = new TransactionBuilder(issuerAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.payment({
        destination: distributor.publicKey(),
        asset: customAsset,
        amount: "100000",
      })
    )
    .setTimeout(60)
    .build();
  tx.sign(issuer);
  result = await horizon.submitTransaction(tx);
  console.log(`   ✅ Issued. Hash: ${result.hash.slice(0, 12)}...`);

  await sleep(3000);

  // Step 5: Deploy SAC (Soroban op via Soroban RPC)
  console.log(`\n🔗 Deploying Stellar Asset Contract (SAC)...`);
  issuerAccount = await soroban.getAccount(issuer.publicKey());
  tx = new TransactionBuilder(issuerAccount, {
    fee: "10000000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.createStellarAssetContract({ asset: customAsset }))
    .setTimeout(120)
    .build();

  const prepared = await soroban.prepareTransaction(tx);
  prepared.sign(issuer);
  const sendResult = await soroban.sendTransaction(prepared);

  if (sendResult.status === "ERROR") {
    throw new Error(`SAC deploy error: ${JSON.stringify(sendResult)}`);
  }

  // Wait for confirmation
  console.log(`   ⏳ Waiting for tx ${sendResult.hash.slice(0, 12)}...`);
  for (let i = 0; i < 30; i++) {
    const txResult = await soroban.getTransaction(sendResult.hash);
    if (txResult.status === "SUCCESS") {
      console.log("   ✅ SAC deployed.");
      break;
    }
    if (txResult.status === "FAILED") {
      throw new Error(`SAC deploy failed: ${JSON.stringify(txResult)}`);
    }
    await sleep(2000);
  }

  // Get the contract ID
  const contractId = StrKey.encodeContract(
    customAsset.contractId(NETWORK_PASSPHRASE)
  );

  console.log(`\n${"=".repeat(55)}`);
  console.log(`🎉 DEPLOYMENT SUCCESSFUL!`);
  console.log(`${"=".repeat(55)}`);
  console.log(`\n📋 Contract Details:`);
  console.log(`   Token Name:    ${TOKEN_NAME}`);
  console.log(`   Token Symbol:  ${TOKEN_SYMBOL}`);
  console.log(`   Decimals:      7`);
  console.log(`   Network:       Stellar Testnet`);
  console.log(`   Contract ID:   ${contractId}`);
  console.log(`   Issuer:        ${issuer.publicKey()}`);
  console.log(`   Distributor:   ${distributor.publicKey()}`);
  console.log(`\n🔑 SAVE THESE KEYS:`);
  console.log(`   Issuer Secret:      ${issuer.secret()}`);
  console.log(`   Distributor Secret:  ${distributor.secret()}`);
  console.log(`\n🌐 View on Stellar Expert:`);
  console.log(`   https://stellar.expert/explorer/testnet/contract/${contractId}`);
}

main().catch((err) => {
  console.error("\n❌ Error:", err.message || err);
  process.exit(1);
});
