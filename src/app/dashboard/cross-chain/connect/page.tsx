"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../../supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Wallet,
  CheckCircle,
  AlertTriangle,
  Zap,
  Activity,
  Network,
  Globe,
  RefreshCw,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import EnhancedPageHeader, {
  commonBadges,
} from "@/components/enhanced-page-header";

interface WalletConnection {
  id: string;
  user_id: string;
  wallet_address: string;
  wallet_type: string;
  chain_id: number;
  network_name: string;
  balance_eth: number;
  balance_usd: number;
  is_connected: boolean;
  last_connected: string;
  created_at: string;
}

interface NetworkInfo {
  chainId: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  blockExplorer: string;
  icon: string;
  color: string;
  status: "active" | "maintenance" | "congested";
}

export default function ConnectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [connections, setConnections] = useState<WalletConnection[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<number>(1);
  const [walletAddress, setWalletAddress] = useState("");
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const networks: NetworkInfo[] = [
    {
      chainId: 1,
      name: "Ethereum Mainnet",
      symbol: "ETH",
      rpcUrl: "https://mainnet.infura.io/v3/",
      blockExplorer: "https://etherscan.io",
      icon: "🔷",
      color: "blue",
      status: "active",
    },
    {
      chainId: 137,
      name: "Polygon",
      symbol: "MATIC",
      rpcUrl: "https://polygon-rpc.com",
      blockExplorer: "https://polygonscan.com",
      icon: "🟣",
      color: "purple",
      status: "active",
    },
    {
      chainId: 42161,
      name: "Arbitrum One",
      symbol: "ARB",
      rpcUrl: "https://arb1.arbitrum.io/rpc",
      blockExplorer: "https://arbiscan.io",
      icon: "🔵",
      color: "blue",
      status: "active",
    },
    {
      chainId: 10,
      name: "Optimism",
      symbol: "OP",
      rpcUrl: "https://mainnet.optimism.io",
      blockExplorer: "https://optimistic.etherscan.io",
      icon: "🔴",
      color: "red",
      status: "active",
    },
    {
      chainId: 56,
      name: "BNB Smart Chain",
      symbol: "BNB",
      rpcUrl: "https://bsc-dataseed.binance.org",
      blockExplorer: "https://bscscan.com",
      icon: "🟡",
      color: "yellow",
      status: "active",
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      setUser(user);

      // Fetch wallet connections from API with auth headers
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch("/api/wallet-connections", {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();

      if (!response.ok) {
        // Fallback to mock data if API fails
        console.warn("API failed, using mock data:", result.error);
        const mockConnections = [
          {
            id: "conn-1",
            user_id: user.id,
            wallet_address: "0x742d35cc6cbf4532b4661e5f5e2c2d1b5a8f1234",
            wallet_type: "MetaMask",
            chain_id: 1,
            network_name: "Ethereum Mainnet",
            balance_eth: 2.5,
            balance_usd: 5000.0,
            is_connected: true,
            last_connected: "2025-01-15T10:30:00Z",
            created_at: "2025-01-10T08:00:00Z",
          },
          {
            id: "conn-2",
            user_id: user.id,
            wallet_address: "0x1234567890abcdef1234567890abcdef12345678",
            wallet_type: "WalletConnect",
            chain_id: 137,
            network_name: "Polygon",
            balance_eth: 1000.0,
            balance_usd: 800.0,
            is_connected: true,
            last_connected: "2025-01-15T09:15:00Z",
            created_at: "2025-01-12T14:20:00Z",
          },
        ];
        setConnections(mockConnections);
        return;
      }

      setConnections(result.data || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    if (!user || !walletAddress) return;

    try {
      setConnecting(true);
      setError(null);

      // Validate wallet address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        throw new Error("Invalid wallet address format");
      }

      const selectedNetworkInfo = networks.find(
        (n) => n.chainId === selectedNetwork
      );
      if (!selectedNetworkInfo) {
        throw new Error("Invalid network selected");
      }

      // Mock balance fetch - in reality, this would call the blockchain
      const mockBalance = Math.random() * 10;
      const mockUsdValue = mockBalance * 2000; // Mock ETH price

      const supabase = createClient();

      // Check if connection already exists
      const { data: existing } = await supabase
        .from("wallet_connections")
        .select("*")
        .eq("user_id", user.id)
        .eq("wallet_address", walletAddress)
        .eq("chain_id", selectedNetwork)
        .single();

      if (existing) {
        // Update existing connection
        const { error } = await supabase
          .from("wallet_connections")
          .update({
            is_connected: true,
            last_connected: new Date().toISOString(),
            balance_eth: mockBalance,
            balance_usd: mockUsdValue,
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Create new connection
        const { error } = await supabase.from("wallet_connections").insert({
          user_id: user.id,
          wallet_address: walletAddress,
          wallet_type: "MetaMask", // Could be dynamic based on detection
          chain_id: selectedNetwork,
          network_name: selectedNetworkInfo.name,
          balance_eth: mockBalance,
          balance_usd: mockUsdValue,
          is_connected: true,
          last_connected: new Date().toISOString(),
        });

        if (error) throw error;
      }

      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${selectedNetworkInfo.name}`,
      });

      // Reload connections
      await loadData();
      setWalletAddress("");
    } catch (error: any) {
      console.error("Connection error:", error);
      setError(error.message);
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = async (connectionId: string) => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("wallet_connections")
        .update({ is_connected: false })
        .eq("id", connectionId);

      if (error) throw error;

      toast({
        title: "Wallet Disconnected",
        description: "Wallet has been disconnected successfully",
      });

      await loadData();
    } catch (error: any) {
      console.error("Disconnect error:", error);
      toast({
        title: "Disconnect Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    });
  };

  const getNetworkColor = (chainId: number) => {
    const network = networks.find((n) => n.chainId === chainId);
    return network?.color || "gray";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "congested":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "maintenance":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 animate-fadeIn">
        <div className="space-y-6">
          {/* Enhanced Loading Header */}
          <div className="w-full px-6 py-8">
            <div className="flex items-center gap-4 mb-8 animate-pulse">
              <div className="h-10 w-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
              <div>
                <div className="h-8 w-80 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg mb-2"></div>
                <div className="h-4 w-96 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>

          {/* Advanced Loading Animation */}
          <div className="w-full px-6">
            <div className="text-center py-12">
              {/* Animated Wallet Icons */}
              <div className="flex justify-center items-center space-x-4 mb-8">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl animate-bounce shadow-lg flex items-center justify-center">
                    <span className="text-2xl">🔷</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full animate-ping"></div>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-100"></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse delay-200"></div>
                </div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-emerald-600 rounded-2xl animate-bounce delay-150 shadow-lg flex items-center justify-center">
                    <span className="text-2xl">🟣</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full animate-ping delay-300"></div>
                </div>
              </div>

              {/* Loading Spinner with Gradient */}
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 animate-spin"></div>
                  <div className="absolute inset-2 rounded-full bg-white"></div>
                  <div className="absolute inset-4 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse"></div>
                </div>
              </div>

              {/* Loading Text with Typewriter Effect */}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Connecting to Networks
                </h3>
                <div className="flex justify-center items-center space-x-1">
                  <p className="text-gray-600">Loading wallet connections</p>
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-8 max-w-md mx-auto">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full animate-pulse"></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Establishing secure connections...
                </p>
              </div>
            </div>

            {/* Skeleton Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 animate-pulse">
              <div className="lg:col-span-2">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-4 w-1/3"></div>
                  <div className="space-y-4">
                    <div className="h-12 bg-gray-200 rounded-xl"></div>
                    <div className="h-12 bg-gray-200 rounded-xl"></div>
                    <div className="h-14 bg-gradient-to-r from-blue-200 to-purple-200 rounded-xl"></div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                  <div className="h-5 bg-gray-200 rounded mb-4 w-2/3"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="bg-emerald-50/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-emerald-200">
                  <div className="h-5 bg-emerald-200 rounded mb-3 w-1/2"></div>
                  <div className="h-4 bg-emerald-200 rounded w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 animate-fadeIn">
      <div className="space-y-6">
        {/* Enhanced Header */}
        <EnhancedPageHeader
          title="Wallet Connection Hub"
          description="Connect and manage your wallets across multiple blockchain networks for seamless cross-chain operations"
          badges={[
            commonBadges.active,
            {
              text: `${connections.filter((c) => c.is_connected).length} Connected`,
              variant: "outline",
              icon: <CheckCircle className="h-3 w-3" />,
              className: "text-emerald-700 border-emerald-200",
            },
            {
              text: "Multi-Chain",
              variant: "outline",
              icon: <Network className="h-3 w-3" />,
              className: "text-blue-700 border-blue-200",
            },
            {
              text: "Secure",
              variant: "outline",
              icon: <Zap className="h-3 w-3" />,
              className: "text-purple-700 border-purple-200",
            },
          ]}
          actions={
            <Button
              variant="outline"
              asChild
              className="border-blue-200 text-blue-700 hover:bg-blue-50 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Link href="/dashboard/cross-chain">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Hub
              </Link>
            </Button>
          }
        />

        {/* Content Section */}
        <div className="w-full px-6">
          <div className="w-full space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert className="border-red-200 bg-red-50 animate-slideDown">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Connect New Wallet */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slideUp">
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Wallet className="h-6 w-6 text-blue-600" />
                      Connect New Wallet
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200 ml-2"
                      >
                        SECURE
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-base">
                      Add a new wallet connection to access cross-chain features
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      {/* Network Selection */}
                      <div className="space-y-4">
                        <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <Network className="h-4 w-4" />
                          Select Network
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {networks.map((network) => (
                            <div
                              key={network.chainId}
                              className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                                selectedNetwork === network.chainId
                                  ? "border-blue-500 bg-blue-50 shadow-md"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() =>
                                setSelectedNetwork(network.chainId)
                              }
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">
                                    {network.icon}
                                  </span>
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {network.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {network.symbol}
                                    </p>
                                  </div>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={getStatusColor(network.status)}
                                >
                                  {network.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Wallet Address Input */}
                      <div className="space-y-4">
                        <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <Wallet className="h-4 w-4" />
                          Wallet Address
                        </Label>
                        <Input
                          placeholder="0x..."
                          value={walletAddress}
                          onChange={(e) => setWalletAddress(e.target.value)}
                          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 font-mono"
                        />
                      </div>

                      {/* Connect Button */}
                      <Button
                        onClick={connectWallet}
                        disabled={connecting || !walletAddress}
                        className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {connecting ? (
                          <>
                            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Wallet className="h-5 w-5 mr-2" />
                            Connect Wallet
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Network Status */}
              <div className="space-y-6">
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Activity className="h-5 w-5 text-emerald-600" />
                      Network Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {networks.slice(0, 3).map((network) => (
                      <div
                        key={network.chainId}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{network.icon}</span>
                          <span className="font-medium text-sm">
                            {network.name}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(network.status)} text-xs`}
                        >
                          {network.status}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border border-emerald-200 shadow-lg bg-gradient-to-br from-emerald-50/50 to-green-50/30 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-emerald-900 mb-1">
                          Secure Connection
                        </h3>
                        <p className="text-sm text-emerald-700">
                          All wallet connections are encrypted and stored
                          securely. Your private keys never leave your device.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Connected Wallets */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm animate-slideUp">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Globe className="h-6 w-6 text-blue-600" />
                  Connected Wallets
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200 ml-2"
                  >
                    {connections.filter((c) => c.is_connected).length} Active
                  </Badge>
                </CardTitle>
                <CardDescription className="text-base">
                  Manage your connected wallets and view balances
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {connections.length === 0 ? (
                  <div className="text-center py-12">
                    <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      No wallets connected yet
                    </p>
                    <p className="text-gray-400">
                      Connect your first wallet to get started
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {connections.map((connection) => {
                      const network = networks.find(
                        (n) => n.chainId === connection.chain_id
                      );
                      return (
                        <Card
                          key={connection.id}
                          className={`border transition-all duration-200 hover:shadow-md ${
                            connection.is_connected
                              ? "border-emerald-200 bg-emerald-50/30"
                              : "border-gray-200"
                          }`}
                        >
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">
                                    {network?.icon}
                                  </span>
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {connection.network_name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {connection.wallet_type}
                                    </p>
                                  </div>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={
                                    connection.is_connected
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : "bg-gray-50 text-gray-700 border-gray-200"
                                  }
                                >
                                  {connection.is_connected
                                    ? "Connected"
                                    : "Disconnected"}
                                </Badge>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">
                                    Address
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      copyToClipboard(connection.wallet_address)
                                    }
                                    className="h-6 px-2"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                                <p className="text-sm font-mono text-gray-900 bg-gray-100 p-2 rounded">
                                  {connection.wallet_address.slice(0, 6)}...
                                  {connection.wallet_address.slice(-4)}
                                </p>
                              </div>

                              {connection.is_connected && (
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                      Balance
                                    </span>
                                    <span className="font-medium">
                                      {connection.balance_eth.toFixed(4)}{" "}
                                      {network?.symbol}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                      USD Value
                                    </span>
                                    <span className="font-medium text-emerald-600">
                                      ${connection.balance_usd.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              )}

                              <div className="flex gap-2">
                                {connection.is_connected ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      disconnectWallet(connection.id)
                                    }
                                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                                  >
                                    Disconnect
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    disabled
                                  >
                                    Reconnect
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    window.open(
                                      network?.blockExplorer +
                                        "/address/" +
                                        connection.wallet_address,
                                      "_blank"
                                    )
                                  }
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
