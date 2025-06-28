import Link from "next/link";
import { ArrowUpRight, Check, BarChart3, Wallet, Globe } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-70" />

      <div className="relative pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-8 tracking-tight">
              TangibleFi{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Dashboard
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              A comprehensive platform for managing tokenized real-world assets
              and lending activities across multiple blockchains. Monitor your
              portfolio, manage loans, and process payments in various
              cryptocurrencies.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-8 py-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
              >
                Access Dashboard
                <ArrowUpRight className="ml-2 w-5 h-5" />
              </Link>

              <Link
                href="/sign-up"
                className="inline-flex items-center px-8 py-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-lg font-medium"
              >
                Create Account
              </Link>
            </div>

            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm">
                <BarChart3 className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold mb-2">Portfolio Overview</h3>
                <p className="text-sm text-gray-600">
                  Track collateral value, loan balances, and health ratios
                </p>
              </div>
              <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm">
                <Wallet className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold mb-2">Multi-Token Payments</h3>
                <p className="text-sm text-gray-600">
                  Process payments in different cryptocurrencies
                </p>
              </div>
              <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm">
                <Globe className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold mb-2">Global Access</h3>
                <p className="text-sm text-gray-600">
                  Access your portfolio from anywhere in the world
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
