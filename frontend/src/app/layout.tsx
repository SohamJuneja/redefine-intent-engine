import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rift — Yield Intents. Zero Friction.",
  description:
    "Declare your intent on Bitcoin. Rift's solvers bridge, route, and deposit into Starknet DeFi — one click, zero gas, full privacy.",
  openGraph: {
    title: "Rift — Yield Intents. Zero Friction.",
    description:
      "Non-custodial cross-chain yield routing from Bitcoin to Starknet DeFi. Powered by ElGamal encryption and zero-knowledge proofs.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-white`}>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
