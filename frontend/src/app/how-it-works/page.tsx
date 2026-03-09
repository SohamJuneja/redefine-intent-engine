import Link from "next/link";
import {
  ArrowRight, Coins, Zap, TrendingUp, Shield,
  Lock, Globe, CheckCircle, Code, FileKey,
} from "lucide-react";

const phases = [
  {
    num: "01",
    icon: Coins,
    accent: "orange",
    title: "Sign an Intent on Bitcoin",
    desc: "You declare what you want to achieve — e.g. \"earn yield on 0.01 BTC\" — and sign it with your Bitcoin wallet (Xverse). The signed intent is a compact, human-readable message. No on-chain transaction is needed at this step. Your address never appears anywhere.",
    details: [
      "Intent contains: amount, target protocol, nonce, user Tongo pubkey",
      "Signed with Bitcoin Schnorr (BIP-340) off-chain",
      "No seed phrase exposure, no bridge UI",
    ],
    code: `// Intent structure
{
  btcAmount: "100000",      // satoshis
  targetVesuVault: "0x...", // Starknet DeFi
  userTongoAddress: "byrz..", // Base58 ZK pubkey
  nonce: 1704067200,
  signature: "3045022100..." // BTC Schnorr sig
}`,
  },
  {
    num: "02",
    icon: Zap,
    accent: "violet",
    title: "Rift Solver Picks Up the Intent",
    desc: "A decentralized solver monitors the intent pool and validates your signature off-chain. It then executes the DeFi strategy on Starknet on your behalf — depositing into Vesu finance. The solver's address appears on Voyager, not yours.",
    details: [
      "Solver verifies BTC signature and nonce uniqueness",
      "Calls vault contract's execute_intent() with solver as user_address",
      "Yield accrues to solver's address — dark pool privacy",
    ],
    code: `// Vault contract call (Starknet)
const call = {
  contractAddress: VAULT_ADDRESS,
  entrypoint: "execute_intent",
  calldata: {
    user_address: SOLVER_ADDRESS,  // ← not user
    amount: cairo.uint256(btcAmount),
    target_protocol: targetVesuVault,
    nonce: nonce,
  }
}`,
  },
  {
    num: "03",
    icon: Lock,
    accent: "violet",
    title: "Tongo Confidential Shielding",
    desc: "The solver wraps STRK tokens into the Tongo confidential protocol — an ElGamal-encrypted balance layer on Starknet. It then performs a zero-knowledge transfer to your Tongo public key. On-chain, only a random-looking elliptic curve point appears.",
    details: [
      "fund(): approves STRK → mints encrypted ElGamal balance",
      "transfer(): proves same amount encrypted for two keys (ZK)",
      "Schnorr sigma protocols + 32-bit range proofs",
    ],
    code: `// ZK Transfer proof structure
{
  from: PublicKey,     // solver EC point
  to: PublicKey,       // user EC point (Tongo addr)
  transferBalance: CipherBalance,  // ElGamal(b, to)
  transferBalanceSelf: CipherBalance, // ElGamal(b, from)
  auxiliarCipher: CipherBalance,  // range proof V1
  auxiliarCipher2: CipherBalance, // range proof V2
  proof: SchnorrProof, // 13 EC scalars + 2 range proofs
}`,
  },
  {
    num: "04",
    icon: TrendingUp,
    accent: "emerald",
    title: "Yield Accrues Privately",
    desc: "Your funds are now inside Vesu's lending protocol earning yield, and your confidential Tongo balance reflects the transfer. Nobody on-chain can link your Bitcoin address, your Starknet activity, or your balance — because it's all encrypted.",
    details: [
      "Vesu vault earns lending yield (STRK collateral)",
      "Balance stored as ElGamal ciphertext — unreadable without private key",
      "Withdrawals use same ZK proof system, optional auditor key",
    ],
    code: `// Your Tongo balance (on-chain)
{
  L: Point { x: 0x3a7f..., y: 0x9c12... }, // g^r * y^b
  R: Point { x: 0xf801..., y: 0x2b4a... }, // g^r
}
// Decryption: b = DLog(L - R^x)
// Only you (with private key x) can decrypt`,
  },
];

const accentBorder: Record<string, string> = {
  orange: "border-orange-500/30",
  violet: "border-violet-500/30",
  emerald: "border-emerald-500/30",
};
const accentText: Record<string, string> = {
  orange: "text-orange-400",
  violet: "text-violet-400",
  emerald: "text-emerald-400",
};
const accentBg: Record<string, string> = {
  orange: "bg-orange-500/15",
  violet: "bg-violet-500/15",
  emerald: "bg-emerald-500/15",
};

const zkFacts = [
  {
    icon: FileKey,
    title: "Schnorr Sigma Protocols",
    desc: "Prove knowledge of private key and discrete-log relationships without revealing secrets. Used for PoE (Proof of Equality) and SameEncrypt proofs.",
  },
  {
    icon: Shield,
    title: "32-bit Range Proofs",
    desc: "Prove amounts are positive and within [0, 2^32-1] without revealing the value. Uses ~120K Cairo steps per transfer verification.",
  },
  {
    icon: Code,
    title: "ElGamal Encryption",
    desc: "Additively homomorphic encryption scheme on BabyJubJub elliptic curve. (L,R) = (g^r · y^b, g^r) where b is amount and y is pubkey.",
  },
  {
    icon: Globe,
    title: "Fiat-Shamir Heuristic",
    desc: "Interactive ZK proofs made non-interactive. The challenge c = Poseidon(prefix, commitments) binds the proof to public inputs on-chain.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-3">How It Works</p>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            From Bitcoin intent to<br />
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              private yield in 4 steps
            </span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
            Rift combines intent-based architecture with Tongo&apos;s confidential protocol to
            bridge Bitcoin yield intent to Starknet DeFi — with full transaction privacy.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6 mb-20">
          {phases.map((phase) => {
            const Icon = phase.icon;
            const border = accentBorder[phase.accent];
            const text = accentText[phase.accent];
            const bg = accentBg[phase.accent];
            return (
              <div
                key={phase.num}
                className={`bg-white/5 border ${border} rounded-3xl p-6 md:p-8`}
              >
                <div className="flex items-start gap-5 mb-6">
                  <div className={`w-12 h-12 rounded-xl ${bg} ${text} flex items-center justify-center shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${text} mb-1`}>{phase.num}</p>
                    <h2 className="text-white font-black text-xl">{phase.title}</h2>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-400 text-sm leading-relaxed mb-5">{phase.desc}</p>
                    <ul className="space-y-2">
                      {phase.details.map((d, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
                          <CheckCircle className={`w-3.5 h-3.5 ${text} shrink-0 mt-0.5`} />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-4 overflow-x-auto">
                    <pre className="text-xs text-gray-400 font-mono leading-relaxed whitespace-pre-wrap">
                      {phase.code}
                    </pre>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ZK Primitives */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <p className="text-violet-500 text-xs font-bold uppercase tracking-widest mb-3">Cryptographic Primitives</p>
            <h2 className="text-2xl md:text-3xl font-black text-white">Zero-knowledge under the hood</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {zkFacts.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-200">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-white font-bold text-sm mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance stats */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-16">
          <div className="text-center mb-8">
            <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-3">Performance</p>
            <h2 className="text-2xl font-black text-white">Verified on Starknet Sepolia</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "~120K", label: "Cairo steps per transfer" },
              { value: "32-bit", label: "Range proof precision" },
              { value: "29", label: "Fiat-Shamir prefix elements" },
              { value: "0 gas", label: "Cost to end user" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black text-white mb-1">{s.value}</p>
                <p className="text-gray-500 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/app"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white
              bg-orange-500 hover:bg-orange-400
              shadow-[0_0_40px_rgba(247,147,26,0.35)] hover:shadow-[0_0_70px_rgba(247,147,26,0.55)]
              transition-all duration-300"
          >
            <Coins className="w-5 h-5" />
            Try It Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
