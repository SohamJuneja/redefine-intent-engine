"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, Zap, TrendingUp, Shield, Coins,
  Lock, Globe, ChevronRight, CheckCircle,
} from "lucide-react";
import Background from "./components/Background";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5 },
});

const stats = [
  { value: "~120K", label: "Cairo steps / transfer" },
  { value: "32-bit", label: "ZK range proofs" },
  { value: "ElGamal", label: "Encryption scheme" },
  { value: "0 gas", label: "For end users" },
];

const steps = [
  {
    icon: Coins,
    num: "01",
    title: "Sign Intent",
    desc: "Sign a human-readable intent with your Bitcoin wallet. No bridge UI, no token approvals, no seed phrase exposure.",
    accent: "orange",
  },
  {
    icon: Zap,
    num: "02",
    title: "Solver Bridges",
    desc: "Rift solvers pick up your signed intent and route assets cross-chain atomically. Your address never appears on-chain.",
    accent: "violet",
  },
  {
    icon: TrendingUp,
    num: "03",
    title: "Earn Yield",
    desc: "Your funds land in Starknet DeFi protocols (Vesu). Yield accrues — with zero gas and full transaction privacy.",
    accent: "emerald",
  },
];

const accentCls = {
  orange: { bg: "bg-orange-500/15", text: "text-orange-400", label: "text-orange-500" },
  violet: { bg: "bg-violet-500/15", text: "text-violet-400", label: "text-violet-500" },
  emerald: { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "text-emerald-500" },
};

const features = [
  {
    icon: Shield,
    title: "Dark Pool Privacy",
    desc: "The solver's address appears on Voyager — yours never does. Yield routes through confidential ElGamal-encrypted channels.",
  },
  {
    icon: Lock,
    title: "Zero-Knowledge Proofs",
    desc: "Every transfer is backed by ZK range proofs and Schnorr sigma protocols, verifying amounts are valid without revealing them.",
  },
  {
    icon: Globe,
    title: "Cross-Chain by Design",
    desc: "Bitcoin signs the intent. Starknet executes it. No wrapped tokens, no custodians — just cryptographic guarantees.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Background />

      {/* Hero */}
      <section className="relative pt-40 pb-24 flex flex-col items-center px-4 text-center">
        <motion.div {...fade(0.05)} className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-gray-400 mb-8">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
          </span>
          Live on Starknet Sepolia
        </motion.div>

        <motion.h1 {...fade(0.1)} className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-5 leading-[1.05] tracking-tight">
          Yield Intents.
          <br />
          <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 bg-clip-text text-transparent">
            Zero Friction.
          </span>
        </motion.h1>

        <motion.p {...fade(0.15)} className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Declare your intent on Bitcoin. Rift&apos;s decentralized solvers handle the bridging,
          routing, and DeFi execution on Starknet — in a single click, with zero gas and full privacy.
        </motion.p>

        <motion.div {...fade(0.2)} className="flex flex-col sm:flex-row items-center gap-4 mb-20">
          <Link
            href="/app"
            className="group px-8 py-4 rounded-2xl font-bold text-white text-base
              bg-orange-500 hover:bg-orange-400
              shadow-[0_0_40px_rgba(247,147,26,0.35)] hover:shadow-[0_0_70px_rgba(247,147,26,0.55)]
              transition-all duration-300 flex items-center gap-3"
          >
            <Coins className="w-5 h-5" />
            Launch App
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
          <Link
            href="/how-it-works"
            className="px-8 py-4 rounded-2xl font-medium text-gray-300 text-base
              bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20
              transition-all duration-300 flex items-center gap-2"
          >
            How It Works <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <motion.div {...fade(0.25)} className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl">
          {stats.map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <p className="text-xl font-black text-white mb-1">{s.value}</p>
              <p className="text-gray-500 text-xs">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">Simple for users. Powerful under the hood.</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            {steps.map((step, i) => {
              const cls = accentCls[step.accent as keyof typeof accentCls];
              return (
                <div key={i} className="relative flex-1 flex items-center gap-3">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 hover:bg-white/[0.07] transition-all duration-200">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${cls.bg} ${cls.text}`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <p className={`text-xs font-bold mb-2 ${cls.label}`}>{step.num} · {step.title}</p>
                    <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                  {i < 2 && <ArrowRight className="w-4 h-4 text-gray-700 flex-shrink-0 hidden sm:block" />}
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Link href="/how-it-works" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors duration-200">
              Full technical breakdown <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-violet-500 text-xs font-bold uppercase tracking-widest mb-3">Built Different</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">Privacy without compromise.</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm leading-relaxed">
              Rift combines intent-based architecture with Tongo&apos;s confidential shielding protocol to deliver private cross-chain yield.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-white font-bold text-base mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-3">Technology</p>
            <h2 className="text-3xl font-black text-white">Built on proven primitives.</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: "Starknet", desc: "L2 execution" },
              { name: "Tongo Protocol", desc: "Confidential shielding" },
              { name: "ElGamal", desc: "Additive encryption" },
              { name: "Vesu Finance", desc: "Yield protocol" },
            ].map((t) => (
              <div key={t.name} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center hover:bg-white/[0.07] transition-all duration-200">
                <p className="text-white font-bold text-sm mb-1">{t.name}</p>
                <p className="text-gray-600 text-xs">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-orange-500/10 to-violet-500/10 border border-white/10 rounded-3xl p-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(247,147,26,0.5)]"
            >
              <Zap className="w-7 h-7 text-white" fill="white" />
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Ready to earn yield from Bitcoin?
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Connect your Xverse wallet, sign an intent, and let Rift do the rest.
              No bridges. No gas. No exposure.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/app"
                className="px-8 py-4 rounded-2xl font-bold text-white
                  bg-orange-500 hover:bg-orange-400
                  shadow-[0_0_40px_rgba(247,147,26,0.3)] hover:shadow-[0_0_60px_rgba(247,147,26,0.5)]
                  transition-all duration-300 flex items-center justify-center gap-2"
              >
                Launch App <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/privacy"
                className="px-8 py-4 rounded-2xl font-medium text-gray-300
                  bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20
                  transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" /> Privacy Model
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-600">
              {["Non-custodial", "Open source", "ZK-powered"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3 text-emerald-500" /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
