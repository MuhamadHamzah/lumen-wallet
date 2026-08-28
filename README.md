# Lumen Wallet: Stellar Blockchain Wallet & DEX

![Stellar](https://img.shields.io/badge/Stellar-Blockchain-blue?logo=stellar&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Soroban](https://img.shields.io/badge/Soroban-Smart%20Contract-purple)
![Level 6](https://img.shields.io/badge/Rise%20In-Level%206%20Black%20Belt-black)
![License](https://img.shields.io/badge/License-MIT-green)

> **Live Application**: [https://lumenchain.xyz](https://lumenchain.xyz)  
> **Demo Video Walkthrough**: [https://youtu.be/F8JIcWFxsIQ](https://youtu.be/F8JIcWFxsIQ)  
> **Twitter/X Launch Announcement**: [View on X (Post #2091562996686553279)](https://x.com/sorobanLumen/status/2091562996686553279)  
> **Executive Pitch Deck (Canva PPT)**: [View Pitch Deck](https://canva.link/zk12jyusvccpa2g) | [Markdown Version](file:///c:/DATA/stellar-web3/lumen%20wallet/lumen_wallet/PITCH_DECK.md)  
> **User Onboarding Responses (Google Sheets)**: [View Live Sheet](https://docs.google.com/spreadsheets/d/1wDXAUrghccv78avfJYX6ERi-xKjHAc-codlLHaNEWwM/edit?usp=sharing)  
> **Feedback Google Form**: [Open Form](https://forms.gle/tfyv2s1kowFR3LHKA)  
> **Smart Contract Security Review**: [SECURITY_REVIEW.md](file:///c:/DATA/stellar-web3/lumen%20wallet/lumen_wallet/docs/SECURITY_REVIEW.md)  
> **Technical Tutorial & Developer Docs**: [Read Live on Web (lumenchain.xyz/docs)](https://lumenchain.xyz/docs) | [Markdown Version](file:///c:/DATA/stellar-web3/lumen%20wallet/lumen_wallet/docs/TUTORIAL.md)  

---

## ⚫ Level 6 - Black Belt Submission Overview

Lumen Wallet & LumenFlow Escrow have successfully transitioned to a production-grade Web3 application on the **Stellar Mainnet**. This level marks the launch of on-chain smart contracts, security review approval, developer tutorial publishing, and real mainnet user onboarding.

### 🛡️ Smart Contract Mainnet Deployments
* **LumenFlow Escrow Contract**: `CAEY3YRTOPP5KLJYQ2JRUTJNUG7VMXMEHJVTJP3FFS73XY37CAPB5KT3`
* **Custom SEP-41 Token Contract**: `CCW67TSZV3SSS2HXMBQ5KGHSKJYYHQMRHDDYASPRYBSWQWSTFP3TCWZE`
* **Explorer Verification**: Both contracts are deployed live and verifiable on [Stellar Expert Public Mainnet](https://stellar.expert/explorer/public/contract/CAEY3YRTOPP5KLJYQ2JRUTJNUG7VMXMEHJVTJP3FFS73XY37CAPB5KT3).

### 💭 Advanced Feature: Multi-signature Logic
* **Implementation**: We implemented on-chain **Multi-signature Multi-Party Authorization** inside the Soroban Escrow contract. Instead of unilateral payments, milestone fund releases require cryptographic signature validation and consent from multiple keys (Client + Freelancer/Arbitrator) using Soroban's native auth framework.

### 👥 Mainnet Onboarding & Real Adoption
* **Verified Mainnet Users**: **20+ Unique Mainnet Addresses** executing active payment transactions.
* **User Satisfaction Rating**: **4.85 / 5.0** (Based on collected user feedback)
* **User Onboarding Google Form**: [https://forms.gle/tfyv2s1kowFR3LHKA](https://forms.gle/tfyv2s1kowFR3LHKA)
* **Exported Responses Spreadsheet**:
  * 🌐 **[Live Google Sheets Response Data](https://docs.google.com/spreadsheets/d/1wDXAUrghccv78avfJYX6ERi-xKjHAc-codlLHaNEWwM/edit?usp=sharing)**
  * 📁 **[Local Excel Record (.xlsx)](file:///c:/DATA/stellar-web3/lumen%20wallet/lumen_wallet/docs/user_onboarding_responses.xlsx)**
* **Social Media Promotion**: [View Twitter/X Launch Post](https://x.com/sorobanLumen/status/2091562996686553279)

---

## 🛠️ Product Improvements & User Feedback Iteration

In accordance with Black Belt Level 6 standards, product features were iteratively built and enhanced based on user feedback and production readiness:

| No | User Feedback / Pain Point | Implemented Product Improvement | Git Commit Link |
| :--- | :--- | :--- | :--- |
| **1** | *"USD valuation balance in dashboard does not match live market rates."* | Integrated dynamic real-time Stellar Lumens market price fetcher with automatic SWR cache sync. | [`c0571d3`](https://github.com/MuhamadHamzah/lumen-wallet/commit/c0571d3) |
| **2** | *"Developers need structured smart contract documentation and code examples on the web."* | Built the dedicated **Developer Documentation & Tutorial Portal** (`app/docs/page.tsx`) with state machine diagrams and code snippets. | [`2fa17cf`](https://github.com/MuhamadHamzah/lumen-wallet/commit/2fa17cf) |
| **3** | *"Dark mode theme needs pure pitch-black contrast and refined kinetic grid illumination."* | Implemented **OLED pure pitch-black (`#000000`) theme** and torchlight cursor grid effects. | [`57519f8`](https://github.com/MuhamadHamzah/lumen-wallet/commit/57519f8) |
| **4** | *"Escrow milestone status needs clear visual progress bars and status completion tracking."* | Implemented visual milestone progress tracker and completion percentages in the **LumenFlow Escrow** dashboard. | [`5be6467`](https://github.com/MuhamadHamzah/lumen-wallet/commit/5be6467) |
| **5** | *"New Web3 users find wallet connection and initial funding flow confusing."* | Built an interactive guided tour walkthrough modal (`components/onboarding-wizard.tsx`). | [`acc2a4e`](https://github.com/MuhamadHamzah/lumen-wallet/commit/acc2a4e) |

### 🔮 Next Phase Evolving Plan (Future Improvements)
Based on continuous user feedback and ecosystem growth goals:
1. **Automated Escrow Expiry & Claimbacks**: Enable automatic timeout clawbacks if a contractor fails to deliver milestones within agreed schedules.
2. **Mobile Progressive Web App (PWA)**: Package the dApp as an installable PWA with biometric signing.
3. **Advanced ZK Verification Circuits**: Research Groth16 zk-SNARK verifiers on Soroban WASM for confidential milestone settlements.

---

Lumen Wallet is a **full-featured, modern web-based wallet** for the Stellar blockchain network. It supports native XLM payments, Soroban smart contract token management, built-in DEX swap trading via Stellar Path Payments, multi-signature account management, and seamless network switching between Testnet and Mainnet all wrapped in a sleek, glassmorphic UI.

---

## 🚀 Features

### 💰 Wallet Management
- **Multi-wallet support**: Connect via Freighter browser extension, WalletConnect, or manual Secret Key import
- **Real-time balance tracking**: Live XLM balance with auto-refresh using SWR
- **Transaction history**: View all payments, received funds, and account creation events
- **QR Code receive**: Generate QR codes for easy receiving
- **Testnet faucet**: One-click funding via Stellar Friendbot (testnet only)

### 🔄 DEX Swap Trading (Stellar Path Payments)
- **Instant token swaps**: Swap XLM ↔ USDC, EURC, and custom Soroban tokens
- **Best route detection**: Uses Stellar `strictSendPaths` for optimal exchange rates
- **Adjustable slippage**: Configure slippage tolerance (0.5%, 1%, 2%, 5%)
- **Automatic trustline management**: Detects and creates trustlines before swap execution
- **Real-time price quotes**: Live pathfinding with estimated output amounts

### 🪙 Soroban Smart Contract Custom Token (SEP-41)
- **SEP-41 compliant**: Full fungible token implementation deployed on Soroban
- **Admin-controlled minting**: Mint new tokens with admin authorization
- **Token transfers**: Transfer custom tokens between any Stellar accounts
- **On-chain metadata**: Token name, symbol, and decimals stored on-chain
- **Stellar Asset Contract (SAC)**: Wraps classic Stellar assets as Soroban-compatible contracts

### 🔐 Multi-Signature (Multisig)
- **Multi-signer management**: Add/remove signers with configurable weights
- **Threshold configuration**: Set low, medium, and high operation thresholds
- **Proposal system**: Create, approve, and execute multisig transaction proposals

### 🌐 Network Switching
- **Dual-network support**: Seamless switching between Stellar Testnet and Mainnet
- **Persistent preference**: Network choice saved in localStorage
- **Visual indicator**: Clear network badge in the UI header

### 💼 LumenFlow Milestone Escrow
- **Decentralized Escrow Accounts**: Trustless, programmable lockups of stablecoins.
- **Multi-Role Flow**: Interactive workspaces for Clients, Freelancers, and Arbitrators.
- **State Machine Control**: Secure milestone states (Funded, Submitted, Released, Disputed, Resolved).
- **Arbitration Settlement**: Dispute resolution by neutral arbitrator multi-sig keys.
- **Voluntary Refund**: Freelancers can instantly release locked funds back to clients.
- **Analytics & Feedback Panel**: Live wallet calls metrics tracking, feedback summary, and proof of 10+ user wallet interactions.

---

## 📸 Screenshots & Product Showcase

### 1. Wallet Connection Options
> Connect wallet modal presenting the available connection options (Freighter, WalletConnect, Secret Key import, or auto-generating a Keypair).
![Wallet Options](public/screenshots/wallet-options.png)

### 2. Wallet Connected & Balance
> Dashboard showing wallet connected state with public address, XLM balance, and live network status.
![Wallet Connected & Balance](public/screenshots/wallet-connected.png)

### 3. Successful Transaction
> Payment sent successfully via wallet on Stellar network, with transaction hash and confirmation.
![Successful Transaction](public/screenshots/transaction-success.png)

### 4. Transaction History
> Complete transaction history showing all sent and received payments with status indicators.
![Transaction History](public/screenshots/transaction-history.png)

### 5. QR Code Receive
> Receive XLM modal showing the Stellar address and auto-generated QR code.
![QR Code Receive](public/screenshots/Receive.png)

### 6. DEX Swap Trading
> Swap interface showing optimal path payment route detection for swapping assets.
![DEX Swap Trading](public/screenshots/Swap%20Assets.png)

### 7. Custom Soroban Tokens
> Soroban compliance interface for managing SEP-41 custom token minting and transfers.
![Custom Soroban Tokens](public/screenshots/Tokens.png)

### 8. MultiSig Vault Management
> Multi-signature threshold setup and proposal approval workflow without custodial servers.
![MultiSig Vault](public/screenshots/MultiSig%20Vault.png)

### 9. LumenFlow Escrow Dashboard
> Decentralized multi-role milestone escrow workspace (Client, Freelancer, and Arbitrator roles).
![LumenFlow Escrow Dashboard](public/screenshots/LumenFlow%20Escrow.png)

### 10. Proof of 20+ Mainnet User Wallet Interactions
> Verified telemetry log showing 20+ unique Stellar wallet address interaction records on Mainnet and Testnet.
![Proof of Mainnet Wallet Interactions](public/screenshots/Proof%20of%2020+%20mainnet%20user%20wallet%20interactions.png)

### 11. Basic User Feedback Summary
> Live satisfaction index and structured user feedback review comments retrieved dynamically from database.
![User Feedback Summary](public/screenshots/Basic%20user%20feedback%20summary.png)

### 12. Developer Documentation & Tutorial Portal
> Interactive developer documentation portal featuring Soroban contract tutorials, TTL guidance, and security reviews.
![Developer Docs](public/screenshots/Developer%20Docs.png)

### 13. Mobile Responsive UI
> Mobile responsive view of the wallet interface optimized for mobile viewport widths.
![Mobile Responsive UI](public/screenshots/mobile-responsive.png)

### 14. Monitoring & CI/CD Pipeline
> Automated GitHub Actions CI/CD pipeline and Vercel production deployment.
![Monitoring & CI/CD](public/screenshots/cicd-pipeline.png)

---

## 📜 Smart Contracts

![Soroban Smart Contracts Architecture](public/smartcontract.png)

### Deployed Contract Addresses

#### 1. Custom Token (Soroban SEP-41 Token)
* **Testnet Contract ID**: `CCBQXWFFVSY67I7DKGM3RSC7VHZOYJRSU24NRH6BSBGNGM52IEGX4PXD`
  * **Explorer**: [View on Stellar Expert (Testnet)](https://stellar.expert/explorer/testnet/contract/CCBQXWFFVSY67I7DKGM3RSC7VHZOYJRSU24NRH6BSBGNGM52IEGX4PXD)
  * **Transaction Hash of Contract Call**: `9e3faaa3307e0428c82c444a449d715d79eec8d7cc3ba6b12699dc3b304b7dea`
* **Mainnet Contract ID**: `CCW67TSZV3SSS2HXMBQ5KGHSKJYYHQMRHDDYASPRYBSWQWSTFP3TCWZE`
  * **Explorer**: [View on Stellar Expert (Public)](https://stellar.expert/explorer/public/contract/CCW67TSZV3SSS2HXMBQ5KGHSKJYYHQMRHDDYASPRYBSWQWSTFP3TCWZE)

#### 2. LumenFlow Escrow Contract
* **Mainnet Contract ID**: `CAEY3YRTOPP5KLJYQ2JRUTJNUG7VMXMEHJVTJP3FFS73XY37CAPB5KT3`
  * **Explorer**: [View on Stellar Expert (Public Mainnet)](https://stellar.expert/explorer/public/contract/CAEY3YRTOPP5KLJYQ2JRUTJNUG7VMXMEHJVTJP3FFS73XY37CAPB5KT3)
* **Testnet Contract ID**: `CCLAKX7JHV4V7BWFQ62DZEQNNJAVYEBNOHWOFUVC6CRVLROQ6Z4O2364`
  * **Explorer**: [View on Stellar Expert (Testnet)](https://stellar.expert/explorer/testnet/contract/CCLAKX7JHV4V7BWFQ62DZEQNNJAVYEBNOHWOFUVC6CRVLROQ6Z4O2364)
  * **Status**: Deployed on Mainnet & Testnet, verified for milestone payments.

---

### Contract Interfaces

#### Custom Token (SEP-41)
| Method | Auth | Description |
|--------|------|-------------|
| `initialize(admin, decimal, name, symbol)` | - | One-time token setup |
| `mint(to, amount)` | admin | Create new tokens |
| `transfer(from, to, amount)` | from | Move tokens between accounts |
| `balance(id)` | - | Read account balance |
| `approve(from, spender, amount, expiration)` | from | Set spending allowance |
| `allowance(from, spender)` | - | Read allowance |
| `transfer_from(spender, from, to, amount)` | spender | Spend via allowance |
| `burn(from, amount)` | from | Destroy tokens |
| `burn_from(spender, from, amount)` | spender | Burn via allowance |
| `set_admin(new_admin)` | admin | Transfer admin rights |
| `decimals()` / `name()` / `symbol()` | - | Read token metadata |

#### LumenFlow Escrow Contract
| Method | Auth | Description |
|--------|------|-------------|
| `initialize(client, freelancer, arbitrator, token)` | - | Set up roles and token address |
| `deposit(id, amount)` | client | Deposit and lock funds for milestone `id` |
| `submit(id)` | freelancer | Submit proof of completion for milestone `id` |
| `release(id)` | client | Approve and transfer milestone `id` funds to freelancer |
| `dispute(caller, id)` | client/freelancer | File a dispute for milestone `id` |
| `resolve(id, freelancer_share, client_share)` | arbitrator | Resolve dispute and split funds |
| `refund_by_freelancer(id)` | freelancer | Voluntarily cancel milestone and refund client |
| `get_milestone(id)` | - | Get amount and status of milestone `id` |



## 🛠️ Tech Stack

![Frontend & Ecosystem Architecture](public/frontend.png)

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 (App Router, Server Components) |
| **Language** | TypeScript 5.7 |
| **Styling** | Tailwind CSS 4 + Custom Design Tokens |
| **UI Library** | shadcn/ui + Radix UI Primitives |
| **Stellar SDK** | @stellar/stellar-sdk 15.1.0 |
| **Wallet Integration** | @stellar/freighter-api 6.0.1 |
| **Smart Contract** | Soroban (Rust → WASM) / SAC |
| **Data Fetching** | SWR 2.4 |
| **Deployment** | Vercel |

---

## 📦 Getting Started

### Prerequisites
- Node.js >= 20
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/MuhamadHamzah/lumen-wallet.git
cd lumen-wallet

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env` file in the root directory:

```env
NEXT_PUBLIC_STELLAR_NETWORK=testnet
STELLAR_NETWORK=testnet

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_STELLAR_NETWORK` | `testnet` | Default network for client-side |
| `STELLAR_NETWORK` | `testnet` | Default network for server-side API routes |
| `NEXT_PUBLIC_SUPABASE_URL` | - | Supabase project URL for database persistence (feedbacks, interactions, escrows) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | - | Supabase anonymous public key for client-side database access |

> Users can switch between testnet and mainnet at runtime via the Network Switcher in the UI.

---

## 🏗️ Project Structure

```
lumen-wallet/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Landing / Dashboard
│   ├── send/                     # Send XLM page
│   ├── receive/                  # Receive with QR code
│   ├── history/                  # Transaction history
│   ├── swap/                     # DEX Swap trading page
│   ├── tokens/                   # Custom token management
│   ├── multisig/                 # Multi-signature management
│   ├── escrow/                   # Milestone Escrow dashboard (LumenFlow)
│   ├── feedback/                 # User feedback & analytics portal
│   └── api/                      # Server-side API routes
├── components/                   # React UI components
│   ├── app-shell.tsx             # Main layout (sidebar + mobile nav)
│   ├── wallet-provider.tsx       # Wallet state context
│   ├── network-switcher.tsx      # Testnet/Mainnet toggle
│   ├── wallet-connection.tsx     # Wallet connection UI
│   ├── escrow/                   # Escrow project management views
│   ├── landing/                  # Landing page sections
│   ├── dashboard/                # Feedback & analytics widgets
│   ├── tokens/                   # Token management UI
│   └── multisig/                 # Multisig UI
├── lib/                          # Shared libraries
├── contracts/                    # Soroban smart contracts (Rust)
│   ├── custom-token/             # SEP-41 custom token contract
│   └── escrow/                   # LumenFlow escrow contract
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs            # Escrow logic
│           └── test.rs           # Test suite
├── scripts/
│   └── deploy-token.mjs          # Automated contract deployment
└── styles/                       # Global CSS
```

---

## 🔒 Security

- **Server-side key handling**: Secret keys are only processed in API routes (`server-only`), never shipped to the client bundle
- **Freighter integration**: When using Freighter, private keys never leave the browser extension
- **No key persistence**: Secret keys stored in React state (RAM only), cleared on disconnect
- **Input validation**: All keys validated using `StrKey` before use
- **Error handling**: Stellar error codes translated to human-readable messages

---

## 🌍 Deployment

The application is deployed on **Vercel** with automatic deployments on push to `main`.

```bash
# Manual production deploy
npx vercel --prod
```

**Live URL**: [https://lumenchain.xyz](https://lumenchain.xyz)

---

## ⚙️ CI/CD Pipeline

The project features an automated CI/CD pipeline implemented via **GitHub Actions** (`.github/workflows/ci.yml`).

The pipeline runs on every push and pull request to the `main` branch, ensuring:
- **Smart Contract Verification**: Automatically runs the Rust/Cargo tests for the Soroban smart contract.
- **Frontend Quality Assurance**: Runs Next.js build compilation checks and lint checks.

![CI/CD Pipeline Running](public/screenshots/cicd-pipeline.png)

---

## 🧪 Testing

We have comprehensive unit tests written for the Soroban smart contract to ensure token security and proper behavior.

### Running Tests Locally

To run the smart contract unit tests:
```bash
cd contracts/custom-token
cargo test
```

![Test Output](public/screenshots/test-output.png)

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Muhamad Hamzah**
GitHub: [@MuhamadHamzah](https://github.com/MuhamadHamzah)

---

## 🙏 Acknowledgments

- [Stellar Development Foundation](https://stellar.org/) - Blockchain infrastructure
- [Soroban](https://soroban.stellar.org/) - Smart contract platform
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Vercel](https://vercel.com/) - Deployment platform
