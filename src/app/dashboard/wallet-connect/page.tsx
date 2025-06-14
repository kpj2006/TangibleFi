"use client";

import { useState, useEffect } from "react";
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
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function DashboardWalletConnectPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [supabaseHealth, setSupabaseHealth] = useState<any>(null);

  useEffect(() => {
    checkMetaMaskInstallation();
    checkDatabaseHealth();
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

  const walletOptions = [
    {
      name: "MetaMask",
      description: "Connect using MetaMask browser extension",
      icon: "🦊",
      status: hasMetaMask ? "available" : "install",
      color: "from-orange-500 to-orange-600",
    },
    {
      name: "WalletConnect",
      description: "Connect with WalletConnect protocol",
      icon: "🔗",
      status: "coming-soon",
      color: "from-blue-500 to-blue-600",
    },
    {
      name: "Coinbase Wallet",
      description: "Connect using Coinbase Wallet",
      icon: "🔵",
      status: "coming-soon",
      color: "from-blue-600 to-blue-700",
    },
    {
      name: "Trust Wallet",
      description: "Connect using Trust Wallet",
      icon: "🛡️",
      status: "coming-soon",
      color: "from-blue-400 to-blue-500",
    },
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Secure Authentication",
      description: "Login with your wallet using cryptographic signatures",
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
    {
      icon: Coins,
      title: "Lending & Borrowing",
      description: "Use your crypto assets as collateral for RWA loans",
      color: "from-orange-500/20 to-orange-600/20",
      iconColor: "text-orange-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <div className="px-6 py-8">
        <div className="w-full">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                  Connect Wallet
                </h1>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                Connect your crypto wallet to access TangibleFi's RWA platform
              </p>
              <div className="flex items-center gap-4 pt-2">
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Secure
                </Badge>
                <Badge
                  variant="outline"
                  className="text-blue-700 border-blue-200"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Instant
                </Badge>
                <Badge
                  variant="outline"
                  className="text-purple-700 border-purple-200"
                >
                  <Globe className="h-3 w-3 mr-1" />
                  Multi-Chain
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 space-y-8">
        <div className="w-full space-y-8">
          {/* Connection Status */}
          {connectionError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {connectionError}
              </AlertDescription>
            </Alert>
          )}

          {isConnected && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Wallet connected successfully! You can now access all platform
                features.
              </AlertDescription>
            </Alert>
          )}

          {/* Wallet Options */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Choose Your Wallet
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {walletOptions.map((wallet, index) => (
                <Card
                  key={index}
                  className={`hover:shadow-lg transition-all duration-200 ${
                    wallet.status === "available" ? "hover:-translate-y-1" : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${wallet.color} rounded-xl flex items-center justify-center text-2xl`}
                      >
                        {wallet.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {wallet.name}
                          </h3>
                          <Badge
                            variant={
                              wallet.status === "available"
                                ? "default"
                                : "outline"
                            }
                            className={
                              wallet.status === "available"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : wallet.status === "install"
                                  ? "bg-orange-100 text-orange-800 border-orange-200"
                                  : "bg-gray-100 text-gray-800 border-gray-200"
                            }
                          >
                            {wallet.status === "available"
                              ? "Available"
                              : wallet.status === "install"
                                ? "Install Required"
                                : "Coming Soon"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {wallet.description}
                        </p>

                        {wallet.name === "MetaMask" && (
                          <div className="space-y-2">
                            {!hasMetaMask ? (
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="w-full"
                              >
                                <a
                                  href="https://metamask.io/download/"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Install MetaMask
                                </a>
                              </Button>
                            ) : (
                              <MetaMaskConnect
                                onSuccess={handleConnectionSuccess}
                                onError={handleConnectionError}
                                className="w-full"
                              />
                            )}
                          </div>
                        )}

                        {wallet.status === "coming-soon" && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                            className="w-full"
                          >
                            Coming Soon
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Supported Networks */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Supported Networks
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {supportedNetworks.map((network, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">{network.logo}</div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {network.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {network.symbol}
                    </p>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      {network.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Why Connect Your Wallet?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <Card
                    key={index}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${benefit.color} rounded-xl flex items-center justify-center mb-4`}
                      >
                        <IconComponent
                          className={`w-6 h-6 ${benefit.iconColor}`}
                        />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {benefit.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* System Status */}
          <Card className="bg-gradient-to-r from-gray-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Database</h4>
                  <Badge
                    variant="outline"
                    className={
                      supabaseHealth?.isHealthy
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }
                  >
                    {supabaseHealth?.isHealthy
                      ? "Operational"
                      : "Issues Detected"}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Globe className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Network</h4>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    All Networks Online
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Security</h4>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    Fully Secured
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Install MetaMask
                    </h4>
                    <p className="text-sm text-gray-600">
                      Download and install the MetaMask browser extension from
                      their official website.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Create or Import Wallet
                    </h4>
                    <p className="text-sm text-gray-600">
                      Set up a new wallet or import an existing one using your
                      seed phrase.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Connect to TangibleFi
                    </h4>
                    <p className="text-sm text-gray-600">
                      Click the "Connect MetaMask" button above and approve the
                      connection.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
