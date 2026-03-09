import Link from "next/link";
import { Shield, Lock, Eye, EyeOff, Key, FileKey, ArrowRight, Coins } from "lucide-react";

const layers = [
  {
    icon: EyeOff,
    title: "Address Unlinkability",
    color: "orange",
    desc: "When you execute an intent on Rift, the solver's Starknet address is the only address that appears on Voyager. Your Bitcoin address and Starknet wallet are never linked to any on-chain activity. This is the core of the Dark Pool privacy model.",
    bullets: [
      "Solver address is the only on-chain signer",
      "Your wallet submits a signed intent off-chain",
      "Zero on-chain footprint for the user",
      "Voyager shows solver address for all DeFi interactions",
    ],
  },
  {
    icon: Lock,
    title: "ElGamal Encrypted Balances",
    color: "violet",
    desc: "The Tongo Protocol encrypts your balance using ElGamal encryption over the BabyJubJub elliptic curve. Your balance appears on-chain as two EC points (L, R) that are computationally indistinguishable from random curve points without your private key.",
    bullets: [
      "Ciphertext: (L, R) = (g^r · y^b, g^r) where b = amount, y = pubkey",
      "Additive homomorphism: balances can be added/subtracted homomorphically",
      "BabyJubJub curve — optimized for STARK proof systems",
      "Only your private key x can decrypt: b = DLog(L - R^x)",
    ],
  },
  {
    icon: Shield,
    title: "Zero-Knowledge Transfer Proofs",
    color: "violet",
    desc: "Every transfer requires a Schnorr sigma proof that the sender knows the private key, and that both the sender and receiver ciphertexts encrypt the same amount — without revealing the amount or either private key.",
    bullets: [
      "Proof of Equality (PoE): know private key of sender address",
      "SameEncrypt: both (L, R) and (L̄, R̄) encrypt same amount b",
      "SameEncryptUnknownRandom: balance update correctness",
      "Fiat-Shamir heuristic: non-interactive via Poseidon hash",
    ],
  },
  {
    icon: FileKey,
    title: "32-bit Range Proofs",
    color: "emerald",
    desc: "To prevent negative balances (underflow), each transfer includes two range proofs: one proving the transfer amount is in [0, 2^32-1] and one proving the remaining balance is also positive. These are Bulletproof-style range proofs adapted for Cairo.",
    bullets: [
      "Proves amount ∈ [0, 2^32 - 1] without revealing amount",
      "Two proofs per transfer: transfer amount + leftover balance",
      "~120K Cairo steps for full transfer verification",
      "V = g^b · H^r committed in the proof prefix",
    ],
  },
  {
    icon: Eye,
    title: "Optional Auditor Key",
    color: "emerald",
    desc: "For compliance purposes, the Tongo contract supports an auditor key that can decrypt all balances. When an auditor key is set, every transfer also includes an audit ciphertext encrypted under the auditor's public key — with a ZK proof that it encrypts the same amount.",
    bullets: [
      "Auditor key is optional — can be set/unset by contract admin",
      "SameEncryptUnknownRandom proof: audit ciphertext = same amount",
      "Auditor can view total flows without seeing individual users",
      "Regulatory compliance without compromising user privacy",
    ],
  },
  {
    icon: Key,
    title: "Tongo Base58 Addresses",
    color: "orange",
    desc: "Your Tongo address is your public key encoded in Base58 — a compressed representation of your EC point on BabyJubJub. It has nothing to do with your Starknet or Bitcoin addresses, providing complete cross-chain unlinkability.",
    bullets: [
      "Derived from: private_key → G · private_key → Base58(x, y)",
      "No relationship to Bitcoin or Starknet addresses",
      "Can be shared publicly to receive private transfers",
      "Nonce prevents replay attacks in the Fiat-Shamir prefix",
    ],
  },
];

const accentMap: Record<string, { bg: string; text: string; border: string }> = {
  orange: { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/20" },
  violet: { bg: "bg-violet-500/15", text: "text-violet-400", border: "border-violet-500/20" },
  emerald: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/20" },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-violet-500 text-xs font-bold uppercase tracking-widest mb-3">Privacy Model</p>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Privacy without<br />
            <span className="bg-gradient-to-r from-violet-400 to-orange-400 bg-clip-text text-transparent">
              compromise
            </span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
            Rift combines the Dark Pool model (solver intermediation) with Tongo&apos;s
            confidential protocol (ElGamal encryption + ZK proofs) to deliver
            full transaction privacy at every layer.
          </p>
        </div>

        {/* Summary card */}
        <div className="bg-gradient-to-br from-violet-500/10 to-orange-500/10 border border-white/10 rounded-3xl p-8 mb-14">
          <h2 className="text-white font-black text-xl mb-5">What is private?</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "User address", status: "Private", note: "Never on-chain" },
              { label: "Transfer amount", status: "Private", note: "ElGamal encrypted" },
              { label: "Balance", status: "Private", note: "Ciphertext only" },
              { label: "Solver address", status: "Public", note: "Appears on Voyager" },
              { label: "Vault deposit", status: "Public", note: "On-chain Vesu call" },
              { label: "Audit (optional)", status: "Auditor only", note: "With auditor key" },
            ].map((item) => (
              <div key={item.label} className="bg-white/5 rounded-xl p-3">
                <p className="text-white text-xs font-semibold mb-1">{item.label}</p>
                <p className={`text-xs font-bold mb-0.5 ${
                  item.status === "Private" ? "text-emerald-400" :
                  item.status === "Public" ? "text-red-400" : "text-orange-400"
                }`}>{item.status}</p>
                <p className="text-gray-600 text-xs">{item.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy layers */}
        <div className="space-y-5 mb-16">
          <div className="text-center mb-8">
            <p className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-2">Privacy Layers</p>
            <h2 className="text-2xl font-black text-white">Defense in depth</h2>
          </div>

          {layers.map((layer, i) => {
            const Icon = layer.icon;
            const c = accentMap[layer.color];
            return (
              <div key={i} className={`bg-white/5 border ${c.border} rounded-2xl p-6`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.text} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base">{layer.title}</h3>
                    <p className="text-gray-400 text-xs leading-relaxed mt-1">{layer.desc}</p>
                  </div>
                </div>
                <ul className="grid sm:grid-cols-2 gap-2 mt-4">
                  {layer.bullets.map((b, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-gray-500">
                      <span className={`w-1.5 h-1.5 rounded-full ${c.bg} ${c.text} mt-1.5 shrink-0 inline-block`} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Trust model */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-14">
          <h2 className="text-white font-black text-xl mb-2">Trust Model</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Rift is non-custodial. Here&apos;s what you must trust — and what you don&apos;t.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <h3 className="text-red-400 text-xs font-bold uppercase tracking-wider mb-3">Must Trust</h3>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>• Starknet L2 validity (Cairo STARK proofs)</li>
                <li>• Tongo contract implementation (open source)</li>
                <li>• Vesu finance vault contract</li>
                <li>• Solver liveness (censorship risk, not theft)</li>
              </ul>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <h3 className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">Don&apos;t Need To Trust</h3>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>• Solver with your funds (solver = intermediary only)</li>
                <li>• Any third-party bridge or custodian</li>
                <li>• Any centralized service for privacy</li>
                <li>• Tongo for correct balance (ZK proofs enforce it)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-6">
            Ready to experience private cross-chain yield?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white
                bg-orange-500 hover:bg-orange-400
                shadow-[0_0_40px_rgba(247,147,26,0.35)] hover:shadow-[0_0_70px_rgba(247,147,26,0.55)]
                transition-all duration-300"
            >
              <Coins className="w-5 h-5" />
              Launch App
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-medium text-gray-300
                bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20
                transition-all duration-300"
            >
              Technical Deep Dive <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
