import {
  Keypair,
  TransactionBuilder,
  Networks,
  Account,
  Operation,
  Asset,
  BASE_FEE,
} from "@stellar/stellar-sdk"

async function runSponsorshipTest() {
  console.log("🧪 Running Stellar Fee-Bump Transaction Sponsorship Test Suite...")

  const clientKeypair = Keypair.random()
  const sponsorKeypair = Keypair.random()

  console.log(`[1] Client Public Key: ${clientKeypair.publicKey()}`)
  console.log(`[2] Sponsor Relayer Public Key: ${sponsorKeypair.publicKey()}`)

  const dummyAccount = new Account(clientKeypair.publicKey(), "100")
  const innerTx = new TransactionBuilder(dummyAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination: Keypair.random().publicKey(),
        asset: Asset.native(),
        amount: "10",
      })
    )
    .setTimeout(30)
    .build()

  innerTx.sign(clientKeypair)
  const innerTxXdr = innerTx.toXDR()
  console.log(`[3] Inner Transaction XDR Generated (${innerTxXdr.length} bytes)`)

  const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
    sponsorKeypair,
    "200",
    TransactionBuilder.fromXDR(innerTxXdr, Networks.TESTNET),
    Networks.TESTNET
  )
  feeBumpTx.sign(sponsorKeypair)

  const feeBumpXdr = feeBumpTx.toXDR()
  console.log(`[4] Fee Bump Transaction XDR Generated (${feeBumpXdr.length} bytes)`)

  if (!feeBumpTx.feeSource.includes(sponsorKeypair.publicKey())) {
    throw new Error("❌ Fee source does not match sponsor keypair!")
  }
  if (Number(feeBumpTx.fee) < 200) {
    throw new Error(`❌ Fee amount too low: ${feeBumpTx.fee}`)
  }

  console.log(`✅ All Fee-Bump Sponsorship tests passed successfully! (Fee: ${feeBumpTx.fee} stroops)`)
}

runSponsorshipTest().catch((err) => {
  console.error("❌ Test failed:", err)
  process.exit(1)
})
