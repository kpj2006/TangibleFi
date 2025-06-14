"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import MetaMaskConnect from "@/components/metamask-connect";
import { checkSupabaseHealth } from "@/lib/supabase-health";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Wallet,
  Shield,
  ArrowLeft,
  CheckCircle,
  Globe,
  Zap,
  Lock,
  TrendingUp,
  Coins,
  AlertTriangle,
  RefreshCw,
  Download,
  ExternalLink,
  Database,
} from "lucide-react";

export default function WalletConnectPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [supabaseHealth, setSupabaseHealth] = useState<any>(null);
  const [particles, setParticles] = useState<
    Array<{
      left: string;
      top: string;
      animationDelay: string;
      animationDuration: string;
    }>
  >([]);

  useEffect(() => {
    checkMetaMaskInstallation();
    checkDatabaseHealth();
    // Generate particles on client side only to avoid hydration mismatch
    const newParticles = [...Array(50)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${2 + Math.random() * 2}s`,
    }));
    setParticles(newParticles);
  }, []);

  const checkMetaMaskInstallation = () => {
    setIsLoading(true);
    setTimeout(() => {
      const installed =
        typeof window !== "undefined" && window.ethereum?.isMetaMask;
      setHasMetaMask(installed);
      setIsLoading(false);
    }, 500);
  };

  const checkDatabaseHealth = async () => {
    try {
      const health = await checkSupabaseHealth();
      setSupabaseHealth(health);
    } catch (error) {
      console.error("Health check failed:", error);
      setSupabaseHealth({
        isHealthy: false,
        message: "Health check failed",
        details: error,
      });
    }
  };

  const handleConnectionSuccess = () => {
    setIsConnected(true);
    setConnectionError(null);
  };

  const handleConnectionError = (error: string) => {
    setConnectionError(error);
    setIsConnected(false);
  };

  const supportedNetworks = [
    {
      name: "Ethereum",
      symbol: "ETH",
      chainId: 1,
      logo: "🔷",
      status: "live",
      color: "from-blue-500 to-blue-600",
    },
    {
      name: "Polygon",
      symbol: "MATIC",
      chainId: 137,
      logo: "🟣",
      status: "live",
      color: "from-purple-500 to-purple-600",
    },
    {
      name: "BNB Chain",
      symbol: "BNB",
      chainId: 56,
      logo: "🟡",
      status: "live",
      color: "from-yellow-500 to-yellow-600",
    },
    {
      name: "Arbitrum",
      symbol: "ARB",
      chainId: 42161,
      logo: "🔵",
      status: "live",
      color: "from-blue-400 to-blue-500",
    },
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Secure Authentication",
      description:
        "Login with your MetaMask wallet using cryptographic signatures",
      color: "from-emerald-500/20 to-emerald-600/20",
      iconColor: "text-emerald-400",
    },
    {
      icon: Globe,
      title: "Multi-Chain Access",
      description: "Access your assets across multiple blockchain networks",
      color: "from-blue-500/20 to-blue-600/20",
      iconColor: "text-blue-400",
    },
    {
      icon: Zap,
      title: "Instant Connection",
      description: "Connect instantly without lengthy registration processes",
      color: "from-yellow-500/20 to-yellow-600/20",
      iconColor: "text-yellow-400",
    },
    {
      icon: Lock,
      title: "Self-Custody",
      description: "You maintain full control of your private keys and assets",
      color: "from-purple-500/20 to-purple-600/20",
      iconColor: "text-purple-400",
    },
    // {
    //   icon: TrendingUp,
    //   title: "Portfolio Tracking",
    //   description: "View your tokenized real-world assets across all chains",
    //   color: "from-indigo-500/20 to-indigo-600/20",
    //   iconColor: "text-indigo-400",
    // },
    {
      icon: Coins,
      title: "Lending & Borrowing",
      description: "Use your crypto assets as collateral for RWA loans",
      color: "from-orange-500/20 to-orange-600/20",
      iconColor: "text-orange-400",
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
          
          {/* Floating particles */}
          <div className="absolute inset-0">
            {particles.map((particle, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/20 rounded-full animate-ping"
                style={{
                  left: particle.left,
                  top: particle.top,
                  animationDelay: particle.animationDelay,
                  animationDuration: particle.animationDuration,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 mb-6 transition-all duration-300 hover:translate-x-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="text-center mb-8">
              <h1 className="text-6xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                Connect Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                  Wallet
                </span>
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                Securely access TangibleFi using your MetaMask wallet. Manage
                your tokenized real-world assets across multiple blockchain
                networks with institutional-grade security.
              </p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
                <p className="text-blue-200">
                  Checking MetaMask installation...
                </p>
              </div>
            </div>
          )}

          {!isLoading && (
            <>
              {/* Database Health Status */}
              {/* {supabaseHealth && (
                <div className="mb-8">
                  <Card className={`bg-white/10 backdrop-blur-lg border-white/20 ${
                    supabaseHealth.isHealthy 
                      ? 'border-green-400/30' 
                      : 'border-red-400/30'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          supabaseHealth.isHealthy 
                            ? 'bg-green-500/20' 
                            : 'bg-red-500/20'
                        }`}>
                          <Database className={`w-5 h-5 ${
                            supabaseHealth.isHealthy 
                              ? 'text-green-400' 
                              : 'text-red-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium ${
                            supabaseHealth.isHealthy 
                              ? 'text-green-100' 
                              : 'text-red-100'
                          }`}>
                            Database Status: {supabaseHealth.isHealthy ? 'Connected' : 'Disconnected'}
                          </div>
                          <div className="text-xs text-gray-300">
                            {supabaseHealth.message}
                          </div>
                        </div>
                        <Button
                          onClick={checkDatabaseHealth}
                          variant="outline"
                          size="sm"
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                      {supabaseHealth.details && typeof supabaseHealth.details === 'object' && (
                        <div className="mt-3 text-xs text-gray-400 space-y-1">
                          {Object.entries(supabaseHealth.details).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span>{key}:</span>
                              <span>{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )} */}

              <div className="grid lg:grid-cols-2 gap-12 items-start mb-8">
                {/* Left Side - Connection */}
                <div className="space-y-8">
                  <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300">
                    <CardHeader className="text-center">
                      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                        <Wallet className="h-10 w-10 text-white" />
                      </div>
                      <CardTitle className="text-3xl font-bold text-white">
                        MetaMask Wallet
                      </CardTitle>
                      <CardDescription className="text-blue-100 text-lg">
                        The most trusted way to access decentralized finance
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Connection Status */}
                      {!hasMetaMask && (
                        <Alert className="bg-amber-500/20 border-amber-400/30 backdrop-blur-sm">
                          <Download className="h-4 w-4 text-amber-400" />
                          <AlertDescription className="text-amber-100">
                            MetaMask is not installed. Please install MetaMask
                            to continue.
                          </AlertDescription>
                        </Alert>
                      )}

                      {connectionError && (
                        <Alert className="bg-red-500/20 border-red-400/30 backdrop-blur-sm">
                          <AlertTriangle className="h-4 w-4 text-red-400" />
                          <AlertDescription className="text-red-100">
                            {connectionError}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Connection Component */}
                      <div className="space-y-4">
                        {!hasMetaMask ? (
                          <Button
                            onClick={() =>
                              window.open(
                                "https://metamask.io/download/",
                                "_blank"
                              )
                            }
                            size="lg"
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-lg py-6 transition-all duration-300 hover:scale-105"
                          >
                            <Download className="mr-3 h-5 w-5" />
                            Install MetaMask
                            <ExternalLink className="ml-3 h-4 w-4" />
                          </Button>
                        ) : (
                          <MetaMaskConnect 
                            onSuccess={handleConnectionSuccess}
                            variant="button"
                          />
                        )}
                      </div>

                      {isConnected && (
                        <div className="mt-6 p-6 bg-green-500/20 border border-green-400/30 rounded-xl backdrop-blur-sm">
                          <div className="flex items-center gap-3 mb-3">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                            <span className="text-green-100 font-semibold text-lg">
                              Wallet Connected Successfully!
                            </span>
                          </div>
                          <p className="text-green-200 text-sm">
                            You can now access your dashboard and manage your
                            tokenized assets across multiple networks.
                          </p>
                          <Button
                            asChild
                            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Link href="/dashboard">Go to Dashboard</Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Enhanced Security Notice */}
                  <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-lg border-amber-400/30 hover:border-amber-400/50 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                          <Shield className="w-6 h-6 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-amber-800 mb-2 text-lg">
                            Security Notice
                          </h3>
                          <p className="text-amber-700 text-sm leading-relaxed mb-4">
                            We will never ask for your seed phrase or private
                            keys. Only connect to trusted websites and always
                            verify the URL before connecting your wallet.
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-amber-700 text-xs">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              SSL encrypted connection
                            </div>
                            <div className="flex items-center gap-2 text-amber-700 text-xs">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              Verified smart contracts
                            </div>
                            <div className="flex items-center gap-2 text-amber-700 text-xs">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              No seed phrase required
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Side - Benefits */}
                <div className="space-y-6">
                  <div className="mb-6">
                    <h2 className="text-4xl font-bold text-white mb-4">
                      Why Connect Your Wallet?
                    </h2>
                    <p className="text-blue-100 text-lg">
                      Unlock the full potential of decentralized asset
                      management with institutional-grade security
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {benefits.map((benefit, index) => (
                      <Card
                        key={index}
                        className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div
                              className={`w-14 h-14 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center`}
                            >
                              <benefit.icon
                                className={`w-7 h-7 ${benefit.iconColor}`}
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold text-white mb-2 text-lg">
                                {benefit.title}
                              </h3>
                              <p className="text-blue-100 text-sm leading-relaxed">
                                {benefit.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enhanced Supported Networks */}
              <Card className="bg-white/5 backdrop-blur-lg border-white/10 mb-8">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl font-bold text-white mb-2">
                    Supported Networks
                  </CardTitle>
                  <CardDescription className="text-blue-100 text-lg">
                    Access your assets across multiple blockchain networks with
                    seamless interoperability
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {supportedNetworks.map((network, index) => (
                      <div
                        key={index}
                        className="text-center p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-105 border border-white/10 hover:border-white/20"
                      >
                        <div className="text-5xl mb-4">{network.logo}</div>
                        <h3 className="font-semibold text-white mb-2 text-lg">
                          {network.name}
                        </h3>
                        <p className="text-blue-200 text-sm mb-3">
                          {network.symbol}
                        </p>
                        <Badge
                          variant="outline"
                          className="bg-green-500/20 text-green-300 border-green-400/30 px-3 py-1"
                        >
                          {network.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Call to Action */}
              <div className="text-center">
                <div className="bg-white/5 backdrop-blur-lg border-white/10 rounded-2xl p-12">
                  <h2 className="text-4xl font-bold text-white mb-6">
                    Ready to Get Started?
                  </h2>
                  <p className="text-blue-100 text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
                    Connect your wallet to access tokenized real-world assets,
                    secure loans with competitive rates, and manage your
                    diversified portfolio across multiple blockchain networks.
                  </p>
                  <div className="flex gap-6 justify-center flex-wrap">
                    <Button
                      asChild
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 text-lg transition-all duration-300 hover:scale-105"
                    >
                      <Link href="/sign-up">Create Account</Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="border-white/20 text-black hover:bg-white/10 hover:text-white px-8 py-4 text-lg transition-all duration-300 hover:scale-105"
                    >
                      <Link href="/dashboard">Explore Dashboard</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
