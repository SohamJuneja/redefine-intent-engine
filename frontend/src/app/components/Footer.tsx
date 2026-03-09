import Link from "next/link";
import { Zap, Github, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 mt-24">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" fill="white" />
              </div>
              <span className="text-white font-black text-lg tracking-tight">Rift</span>
            </Link>
            <p className="text-gray-600 text-xs max-w-xs leading-relaxed">
              Non-custodial yield intent engine. Bridge BTC to Starknet DeFi in one
              click with zero gas and full privacy.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col sm:flex-row gap-8 text-sm">
            <div className="flex flex-col gap-3">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Product</p>
              <Link href="/app" className="text-gray-400 hover:text-white transition-colors duration-200">Launch App</Link>
              <Link href="/how-it-works" className="text-gray-400 hover:text-white transition-colors duration-200">How It Works</Link>
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors duration-200">Privacy Model</Link>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Resources</p>
              <a
                href="https://docs.tongo.cash"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-1"
              >
                Tongo Docs <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://sepolia.voyager.online"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-1"
              >
                Voyager Explorer <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-1"
              >
                GitHub <Github className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-700 text-xs">
            © 2025 Rift. Built for the Starknet hackathon.
          </p>
          <p className="text-gray-700 text-xs">
            Live on Starknet Sepolia ·{" "}
            <span className="text-orange-500/70">Powered by Tongo Protocol</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
