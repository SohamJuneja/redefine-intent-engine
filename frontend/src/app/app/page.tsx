"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, ArrowRight, CheckCircle, ExternalLink,
  Loader2, AlertCircle, Coins, Shield, Info,
} from "lucide-react";

const VESU_VAULT = process.env.NEXT_PUBLIC_TARGET_VESU_VAULT ||
  "0x405241a6d928e3194ed3bfb071ad21edc4778fa4723f81722fa790218368190";

type Step = "idle" | "submitting" | "success" | "error";

interface IntentResult {
  txHash: string;
  vaultTxHash: string;
  shieldedTxHash?: string | null;
  message: string;
}

function Voyager({ hash, label }: { hash: string; label: string }) {
  return (
    <a
      href={`https://sepolia.voyager.online/tx/${hash}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:border-white/20 hover:bg-white/[0.08] transition-all duration-200 group"
    >
      <div>
        <p className="text-gray-400 text-xs mb-0.5">{label}</p>
        <p className="text-white font-mono text-xs truncate max-w-[240px]">
          {hash.slice(0, 18)}…{hash.slice(-8)}
        </p>
      </div>
      <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-orange-400 transition-colors" />
    </a>
  );
}

export default function AppPage() {
  const [btcAmount, setBtcAmount] = useState("1");
  const [tongoAddress, setTongoAddress] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [result, setResult] = useState<IntentResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!btcAmount || Number(btcAmount) <= 0) return;

    setStep("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/execute-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userTongoAddress: tongoAddress || null,
          btcAmount: btcAmount,
          targetVesuVault: VESU_VAULT,
          nonce: Date.now(),
          signature: [],
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Execution failed");
      }

      setResult(data);
      setStep("success");
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong");
      setStep("error");
    }
  }

  function reset() {
    setStep("idle");
    setResult(null);
    setErrorMsg("");
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 text-xs text-orange-400 mb-4">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            Live on Starknet Sepolia
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Execute Intent</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Sign your yield intent. Rift handles the bridging, DeFi routing, and
            confidential shielding — in one transaction.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* ── IDLE / FORM ── */}
          {step === "idle" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Amount */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    BTC Amount (units)
                  </label>
                  <div className="flex items-center gap-3">
                    <Coins className="w-5 h-5 text-orange-400 shrink-0" />
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={btcAmount}
                      onChange={(e) => setBtcAmount(e.target.value)}
                      required
                      className="flex-1 bg-transparent text-white text-xl font-bold outline-none placeholder-gray-700"
                      placeholder="1"
                    />
                    <span className="text-gray-600 text-sm font-medium">units</span>
                  </div>
                  <p className="mt-2 text-gray-600 text-xs">
                    Demo: 1 unit = 1 Tongo-wrapped STRK on Sepolia testnet
                  </p>
                </div>

                {/* Tongo address */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Your Tongo Address <span className="text-gray-600 font-normal normal-case">(optional)</span>
                  </label>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                    <textarea
                      value={tongoAddress}
                      onChange={(e) => setTongoAddress(e.target.value)}
                      rows={2}
                      className="flex-1 bg-transparent text-white text-sm font-mono outline-none placeholder-gray-700 resize-none leading-relaxed"
                      placeholder="byzxzc5ESpfX7vqaBL9zPBdhENLjPsnAmUqCdKdzv7vi"
                    />
                  </div>
                  <div className="mt-2 flex items-start gap-1.5 text-gray-600 text-xs">
                    <Info className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>
                      Provide your Base58 Tongo public key to receive a confidential
                      shielded transfer. Leave blank to skip the privacy layer.
                    </span>
                  </div>
                </div>

                {/* Vault info */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                  <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-white text-xs font-semibold mb-0.5">Target: Vesu Finance</p>
                    <p className="text-gray-600 text-xs font-mono truncate">{VESU_VAULT.slice(0, 22)}…</p>
                  </div>
                  <a
                    href="https://sepolia.voyager.online/contract/0x405241a6d928e3194ed3bfb071ad21edc4778fa4723f81722fa790218368190"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-gray-600 hover:text-white transition-colors" />
                  </a>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl font-bold text-white text-base
                    bg-orange-500 hover:bg-orange-400
                    shadow-[0_0_40px_rgba(247,147,26,0.3)] hover:shadow-[0_0_60px_rgba(247,147,26,0.5)]
                    transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <Coins className="w-5 h-5" />
                  Execute Yield Intent
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-center text-gray-600 text-xs">
                  Non-custodial · Your address never appears on-chain · Powered by Tongo Protocol
                </p>
              </form>
            </motion.div>
          )}

          {/* ── SUBMITTING ── */}
          {step === "submitting" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-orange-500/15 flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
              </div>
              <h2 className="text-white font-bold text-xl mb-2">Executing Intent</h2>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                Routing your yield intent through Vesu and shielding via Tongo.
                This may take 30–60 seconds on Sepolia.
              </p>
              <div className="mt-8 space-y-2 text-left max-w-xs mx-auto">
                {[
                  "Validating intent signature…",
                  "Depositing to Vesu vault…",
                  "Funding confidential pool…",
                  "ZK shielded transfer…",
                ].map((label, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-gray-500">
                    <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                    {label}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── SUCCESS ── */}
          {step === "success" && result && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-gradient-to-br from-emerald-500/10 to-orange-500/10 border border-white/10 rounded-3xl p-8"
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-[0_0_40px_rgba(16,185,129,0.4)]"
                >
                  <CheckCircle className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-white font-black text-2xl mb-1">Intent Executed!</h2>
                <p className="text-gray-400 text-sm">{result.message}</p>
              </div>

              <div className="space-y-3 mb-6">
                <Voyager hash={result.vaultTxHash} label="Vault deposit (Vesu)" />
                {result.shieldedTxHash && (
                  <Voyager hash={result.shieldedTxHash} label="Shielded transfer (Tongo ZK)" />
                )}
              </div>

              <div className="bg-white/5 rounded-2xl p-4 mb-6">
                <p className="text-gray-500 text-xs leading-relaxed">
                  <span className="text-emerald-400 font-semibold">Dark Pool privacy:</span>{" "}
                  Only the solver address appears on Voyager. Your address was never exposed
                  on-chain. Yield accrues in Vesu, shielded via ElGamal encryption.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={reset}
                  className="flex-1 py-3 rounded-2xl font-bold text-white
                    bg-orange-500 hover:bg-orange-400 transition-all duration-300
                    flex items-center justify-center gap-2 text-sm"
                >
                  <Coins className="w-4 h-4" /> New Intent
                </button>
                <a
                  href="https://sepolia.voyager.online"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-2xl font-medium text-gray-300 text-sm
                    bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20
                    transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Voyager Explorer <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          )}

          {/* ── ERROR ── */}
          {step === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-5">
                <AlertCircle className="w-7 h-7 text-red-400" />
              </div>
              <h2 className="text-white font-bold text-xl mb-2">Execution Failed</h2>
              <p className="text-red-300 text-sm mb-6 leading-relaxed font-mono break-all">{errorMsg}</p>
              <button
                onClick={reset}
                className="px-8 py-3 rounded-2xl font-bold text-white bg-orange-500 hover:bg-orange-400 transition-all duration-300 text-sm"
              >
                Try Again
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
