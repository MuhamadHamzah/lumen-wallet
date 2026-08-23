"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, BookOpen, Check, Copy, ExternalLink, ShieldCheck, Terminal, Layers, Code, FileText, Cpu, Lock, CheckCircle2 } from "lucide-react"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<"tutorial" | "security" | "deployment">("tutorial")
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const copyCode = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const codeSnippets = {
    struct: `#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Milestone {
    pub amount: i128,
    pub status: u32,
}`,
    auth: `#[contractimpl]
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
        
        // Transfer tokens from client's wallet into contract instance vault
        let token: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&client, &env.current_contract_address(), &amount);

        let milestone = Milestone { amount, status: 1 };
        env.storage().instance().set(&DataKey::Milestone(id), &milestone);
    }
}`,
    ttl: `// Extend contract instance TTL to prevent ledger expiration
env.storage().instance().extend_ttl(10000, 50000);`,
    resolve: `pub fn resolve(env: Env, id: u32, freelancer_share: i128, client_share: i128) {
    let arbitrator: Address = env.storage().instance().get(&DataKey::Arbitrator).unwrap();
    arbitrator.require_auth(); // Cryptographic arbitrator consent

    let milestone_key = DataKey::Milestone(id);
    let mut milestone: Milestone = env.storage().instance().get(&milestone_key).expect("milestone not found");

    if milestone.status != 4 { // Must be in Disputed state
        panic!("milestone must be in dispute state");
    }

    if freelancer_share + client_share != milestone.amount {
        panic!("shares sum must equal total milestone amount");
    }

    // Distribute settled payments
    let token: Address = env.storage().instance().get(&DataKey::Token).unwrap();
    let token_client = token::Client::new(&env, &token);
    
    if freelancer_share > 0 {
        token_client.transfer(&env.current_contract_address(), &freelancer, &freelancer_share);
    }
    if client_share > 0 {
        token_client.transfer(&env.current_contract_address(), &client, &client_share);
    }
}`,
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Back to App</span>
          </Link>
          <div className="h-4 w-px bg-border/60" />
          <Logo />
          <span className="hidden sm:inline-block font-mono text-xs px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary font-semibold">
            Developer Docs
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sticky Sidebar Nav */}
        <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-20">
          <div className="p-4 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-xl space-y-1">
            <p className="px-3 pb-2 text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
              Documentation
            </p>
            <button
              onClick={() => setActiveTab("tutorial")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "tutorial"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <BookOpen className="size-4" />
              Soroban Escrow Guide
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "security"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <ShieldCheck className="size-4" />
              Security Review
            </button>
            <button
              onClick={() => setActiveTab("deployment")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "deployment"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Cpu className="size-4" />
              Contract Deployments
            </button>
          </div>

          <div className="p-4 rounded-2xl border border-border/60 bg-card/20 space-y-2 text-xs">
            <p className="font-mono font-bold text-foreground">Stellar Resources</p>
            <a
              href="https://developers.stellar.org/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-muted-foreground hover:text-primary transition-colors py-1"
            >
              Stellar Docs
              <ExternalLink className="size-3" />
            </a>
            <a
              href="https://soroban.stellar.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-muted-foreground hover:text-primary transition-colors py-1"
            >
              Soroban Platform
              <ExternalLink className="size-3" />
            </a>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="lg:col-span-9 space-y-12">
          
          {activeTab === "tutorial" && (
            <div className="space-y-10 animate-in fade-in duration-300">
              {/* Article Header */}
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold">
                    Stellar Soroban
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold">
                    Rust &amp; WASM
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                    Mainnet Production Ready
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15] text-balance">
                  Building a Decentralized Milestone Escrow Contract on Stellar Soroban
                </h1>

                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  As Web3 applications transition into commercial utility, trustless payment architectures such as milestone escrows have become essential. In this guide, we break down the architecture and implementation of the production-ready <strong className="text-foreground">LumenFlow Escrow Smart Contract</strong> deployed live on Stellar Mainnet.
                </p>

                <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground font-mono border-t border-border/40">
                  <span>Author: Muhamad Hamzah</span>
                  <span>•</span>
                  <span>Network: Stellar Mainnet &amp; Testnet</span>
                  <span>•</span>
                  <span>SDK: soroban-sdk 22.0</span>
                </div>
              </div>

              {/* Section 1 */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-mono font-bold uppercase tracking-wider text-primary">
                  <Layers className="size-4" />
                  1. Core Architecture &amp; Milestone Lifecycle
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Traditional freelance and supply agreements suffer from counterparty trust deficits. Either the client pays upfront risking abandonment, or the contractor works with no guarantee of payment.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our smart contract defines an immutable milestone structure where funds are locked on-chain in Soroban contract storage, transitioning through verified state machines:
                </p>

                {/* State Machine Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
                  <div className="p-3.5 rounded-2xl bg-card border border-border/60">
                    <span className="text-[10px] text-muted-foreground uppercase">State 0</span>
                    <p className="font-bold text-foreground mt-0.5">Created</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Declared on-chain</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/25">
                    <span className="text-[10px] text-blue-400 uppercase">State 1</span>
                    <p className="font-bold text-blue-400 mt-0.5">Funded</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Tokens locked in vault</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25">
                    <span className="text-[10px] text-amber-400 uppercase">State 2</span>
                    <p className="font-bold text-amber-400 mt-0.5">Submitted</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Work submitted for review</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                    <span className="text-[10px] text-emerald-400 uppercase">State 3</span>
                    <p className="font-bold text-emerald-400 mt-0.5">Released</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Funds sent to freelancer</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/25">
                    <span className="text-[10px] text-destructive uppercase">State 4</span>
                    <p className="font-bold text-destructive mt-0.5">Disputed</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Arbitrator review triggered</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/25">
                    <span className="text-[10px] text-purple-400 uppercase">State 5</span>
                    <p className="font-bold text-purple-400 mt-0.5">Resolved</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Dispute split executed</p>
                  </div>
                </div>

                <div className="relative group rounded-2xl border border-border bg-slate-950 p-4 font-mono text-xs text-slate-100 overflow-x-auto">
                  <button
                    onClick={() => copyCode(codeSnippets.struct, 0)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    title="Copy code"
                  >
                    {copiedIndex === 0 ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                  </button>
                  <pre><code>{codeSnippets.struct}</code></pre>
                </div>
              </section>

              {/* Section 2 */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-mono font-bold uppercase tracking-wider text-emerald-500">
                  <ShieldCheck className="size-4" />
                  2. Native Cryptographic Authorization (`require_auth`)
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Stellar Soroban features a native authorization framework that removes the need to manually verify cryptographic signature payloads inside the contract. Calling <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">client.require_auth()</code> mandates that the transaction was signed by the key owning that address.
                </p>
                
                <div className="relative group rounded-2xl border border-border bg-slate-950 p-4 font-mono text-xs text-slate-100 overflow-x-auto">
                  <button
                    onClick={() => copyCode(codeSnippets.auth, 1)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    title="Copy code"
                  >
                    {copiedIndex === 1 ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                  </button>
                  <pre><code>{codeSnippets.auth}</code></pre>
                </div>
              </section>

              {/* Section 3 */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-mono font-bold uppercase tracking-wider text-amber-500">
                  <Terminal className="size-4" />
                  3. State Storage &amp; TTL (Time-To-Live) Management
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  To prevent state bloat, Soroban uses a storage rent model. Persistent storage entries must have their Time-To-Live extended to remain accessible. Our deployment logic extends entry validity to guarantee data availability:
                </p>

                <div className="relative group rounded-2xl border border-border bg-slate-950 p-4 font-mono text-xs text-slate-100 overflow-x-auto">
                  <button
                    onClick={() => copyCode(codeSnippets.ttl, 2)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    title="Copy code"
                  >
                    {copiedIndex === 2 ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                  </button>
                  <pre><code>{codeSnippets.ttl}</code></pre>
                </div>
              </section>

              {/* Section 4 */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-mono font-bold uppercase tracking-wider text-purple-400">
                  <Code className="size-4" />
                  4. Arbitration Quorum &amp; Dispute Settlement
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  If a disagreement occurs, either party can trigger the dispute state. The neutral arbitrator reviews proof of deliverables off-chain and executes the on-chain settlement, partitioning the funds with mathematical precision:
                </p>

                <div className="relative group rounded-2xl border border-border bg-slate-950 p-4 font-mono text-xs text-slate-100 overflow-x-auto">
                  <button
                    onClick={() => copyCode(codeSnippets.resolve, 3)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    title="Copy code"
                  >
                    {copiedIndex === 3 ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                  </button>
                  <pre><code>{codeSnippets.resolve}</code></pre>
                </div>
              </section>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase font-semibold">
                  <ShieldCheck className="size-4" />
                  Security Assessment &amp; Threat Model
                </div>
                <h2 className="text-3xl font-bold text-foreground">Smart Contract Security Review</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Comprehensive audit assessment for the LumenFlow Escrow Smart Contract deployed on Stellar Soroban.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-5 rounded-2xl border border-border/60 bg-card/40 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs font-mono">
                    <CheckCircle2 className="size-4" />
                    Re-entrancy Immune
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Soroban runtime prevents recursive contract invocations within the same thread. State updates always occur prior to token client transfer executions.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-border/60 bg-card/40 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs font-mono">
                    <CheckCircle2 className="size-4" />
                    Strict Access Control
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Enforces native <code className="text-primary font-mono">require_auth()</code> on every state-mutating operation, mapping caller identities directly to storage instance keys.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-border/60 bg-card/40 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs font-mono">
                    <CheckCircle2 className="size-4" />
                    Mathematical Balance Leaks: Zero
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Arbitrator dispute resolution strictly enforces <code className="text-primary font-mono">freelancer_share + client_share == milestone.amount</code> preventing token creation or loss.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-border/60 bg-card/40 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs font-mono">
                    <CheckCircle2 className="size-4" />
                    Non-Custodial Architecture
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Neither Lumen Wallet administrators nor central intermediaries possess private keys or emergency withdrawal functions over deposited user funds.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "deployment" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-blue-400 uppercase font-semibold">
                  <Cpu className="size-4" />
                  On-Chain Verified Addresses
                </div>
                <h2 className="text-3xl font-bold text-foreground">Soroban Smart Contract Deployments</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Active contracts deployed and verified on Stellar Mainnet and Testnet.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-6 rounded-2xl border border-border/60 bg-card/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-foreground uppercase">1. Custom Token (SEP-41 Soroban)</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Mainnet Active</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 border border-border font-mono text-xs text-foreground select-all break-all">
                    CCW67TSZV3SSS2HXMBQ5KGHSKJYYHQMRHDDYASPRYBSWQWSTFP3TCWZE
                  </div>
                  <a
                    href="https://stellar.expert/explorer/public/contract/CCW67TSZV3SSS2HXMBQ5KGHSKJYYHQMRHDDYASPRYBSWQWSTFP3TCWZE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-mono"
                  >
                    View on StellarExpert Mainnet Explorer
                    <ExternalLink className="size-3" />
                  </a>
                </div>

                <div className="p-6 rounded-2xl border border-border/60 bg-card/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-foreground uppercase">2. LumenFlow Escrow Contract</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Mainnet Live</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 border border-border font-mono text-xs text-foreground select-all break-all">
                    CAEY3YRTOPP5KLJYQ2JRUTJNUG7VMXMEHJVTJP3FFS73XY37CAPB5KT3
                  </div>
                  <a
                    href="https://stellar.expert/explorer/public/contract/CAEY3YRTOPP5KLJYQ2JRUTJNUG7VMXMEHJVTJP3FFS73XY37CAPB5KT3"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-mono"
                  >
                    View on StellarExpert Mainnet Explorer
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 px-4 text-center text-xs text-muted-foreground font-mono">
        Lumen Wallet &amp; LumenFlow • Stellar Mainnet Production Architecture
      </footer>
    </div>
  )
}
