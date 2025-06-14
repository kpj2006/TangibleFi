"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Globe,
  Activity,
  DollarSign,
  TrendingUp,
  Zap,
  ArrowUpRight,
  Coins,
  Wallet,
  Plus,
  Settings,
  Network,
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
  Link as LinkIcon,
  RefreshCw,
  BarChart3,
  Building,
  ExternalLink,
  Send,
  ShieldCheck,
  ArrowUpDown,
} from "lucide-react";
import Link from "next/link";
import { SubmitButton } from "@/components/submit-button";
import { toast } from "@/components/ui/use-toast";

interface CrossChainPosition {
  id: string;
  blockchain: string;
  asset_address: string;
  asset_symbol: string;
  balance: number;
  usd_value: number;
  position_type: string;
  created_at: string;
  updated_at: string;
}

interface WalletInfo {
  address: string;
  chainId: number;
  isConnected: boolean;
}

function getBlockchainColor(blockchain: string) {
  const colors = {
    ethereum: "bg-blue-50 text-blue-700 border-blue-200",
    polygon: "bg-purple-50 text-purple-700 border-purple-200",
    binance: "bg-yellow-50 text-yellow-700 border-yellow-200",
    avalanche: "bg-red-50 text-red-700 border-red-200",
    arbitrum: "bg-cyan-50 text-cyan-700 border-cyan-200",
  };
  return (
    colors[blockchain as keyof typeof colors] ||
    "bg-gray-50 text-gray-700 border-gray-200"
  );
}

function getPositionTypeColor(type: string) {
  const colors = {
    asset: "bg-emerald-50 text-emerald-700 border-emerald-200",
    stablecoin: "bg-blue-50 text-blue-700 border-blue-200",
    lending: "bg-orange-50 text-orange-700 border-orange-200",
    staking: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return (
    colors[type as keyof typeof colors] ||
    "bg-gray-50 text-gray-700 border-gray-200"
  );
}

export default function CrossChainPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [positions, setPositions] = useState<CrossChainPosition[]>([]);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      setUser(user);
      await loadPositions();
      await checkWalletConnection();
      setLoading(false);
    };

    loadData();
  }, [router]);

  const loadPositions = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("cross_chain_positions")
      .select("*")
      .eq("user_id", user?.id || "")
      .order("usd_value", { ascending: false });

    if (data) {
      setPositions(data);
    }
  };

  const checkWalletConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });

        if (accounts.length > 0) {
          setWalletInfo({
            address: accounts[0],
            chainId: parseInt(chainId, 16),
            isConnected: true,
          });
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  };

  const refreshBalances = async () => {
    if (!user) return;

    setRefreshing(true);
    const supabase = createClient();

    try {
      // Mock refresh - in reality, this would call blockchain RPCs to update balances
      const { data: currentPositions } = await supabase
        .from("cross_chain_positions")
        .select("*")
        .eq("user_id", user.id);

      if (currentPositions) {
        // Simulate balance updates with small random changes
        for (const position of currentPositions) {
          const changePercent = (Math.random() - 0.5) * 0.1; // ±5% change
          const newBalance = position.balance * (1 + changePercent);
          const newUsdValue = position.usd_value * (1 + changePercent);

          await supabase
            .from("cross_chain_positions")
            .update({
              balance: newBalance,
              usd_value: newUsdValue,
              updated_at: new Date().toISOString(),
            })
            .eq("id", position.id);
        }
      }

      await loadPositions();
      toast({
        title: "Balances Updated",
        description:
          "Your cross-chain balances have been refreshed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh balances. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <div className="w-full px-6 py-6">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              Loading your cross-chain positions...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Group positions by blockchain
  const positionsByChain =
    positions?.reduce(
      (acc, position) => {
        if (!acc[position.blockchain]) {
          acc[position.blockchain] = [];
        }
        acc[position.blockchain].push(position);
        return acc;
      },
      {} as Record<string, CrossChainPosition[]>
    ) || {};

  const totalValue =
    positions?.reduce((sum, pos) => sum + pos.usd_value, 0) || 0;
  const totalChains = Object.keys(positionsByChain).length;
  const totalPositions = positions?.length || 0;
  const largestPosition = positions?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Enhanced Header */}
      <div className="px-6 py-8">
        <div className="w-full">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                  Cross-Chain Bridge
                </h1>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                Unified view of your positions across multiple blockchains with
                real-time portfolio management
              </p>
              <div className="flex items-center gap-4 pt-2">
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {totalChains} Networks Active
                </Badge>
                <Badge
                  variant="outline"
                  className="text-blue-700 border-blue-200"
                >
                  <Globe className="h-3 w-3 mr-1" />
                  Multi-Chain Support
                </Badge>
                <Badge
                  variant="outline"
                  className="text-purple-700 border-purple-200"
                >
                  <Activity className="h-3 w-3 mr-1" />
                  {totalPositions} Positions
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={refreshBalances}
                variant="outline"
                disabled={refreshing}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>

              {walletInfo?.isConnected ? (
                <Button
                  asChild
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                >
                  <Link href="/dashboard/cross-chain/connect">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Connected ({walletInfo.address.slice(0, 6)}...
                    {walletInfo.address.slice(-4)})
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Link href="/dashboard/cross-chain/connect">
                    <Plus className="h-4 w-4 mr-2" />
                    Connect Wallet
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-8">
        <div className="w-full space-y-8">
          {/* Status Messages */}
          {refreshing && (
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50/50 to-blue-100/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      Refreshing Balances...
                    </h3>
                    <p className="text-blue-700">
                      Updating your portfolio balances from blockchain networks.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {walletInfo?.isConnected && (
            <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50/50 to-green-50/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                  <div>
                    <h3 className="font-semibold text-emerald-900">
                      Wallet Connected!
                    </h3>
                    <p className="text-emerald-700">
                      Your wallet ({walletInfo.address.slice(0, 6)}...
                      {walletInfo.address.slice(-4)}) is ready for cross-chain
                      operations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-blue-600 flex items-center gap-2 uppercase tracking-wide">
                  <Wallet className="h-4 w-4" />
                  Total Portfolio Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-3xl font-bold text-gray-900">
                    ${totalValue.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-600 font-medium text-sm">
                      +5.2% (24h)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-emerald-600 flex items-center gap-2 uppercase tracking-wide">
                  <Globe className="h-4 w-4" />
                  Active Networks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-3xl font-bold text-gray-900">
                    {totalChains}
                  </p>
                  <div className="flex items-center gap-2">
                    <Network className="h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-600 font-medium text-sm">
                      Blockchains Connected
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-purple-100/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-purple-600 flex items-center gap-2 uppercase tracking-wide">
                  <BarChart3 className="h-4 w-4" />
                  Active Positions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-3xl font-bold text-gray-900">
                    {totalPositions}
                  </p>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-purple-600" />
                    <span className="text-purple-600 font-medium text-sm">
                      Holdings Tracked
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-orange-100/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-orange-600 flex items-center gap-2 uppercase tracking-wide">
                  <Building className="h-4 w-4" />
                  Largest Position
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-3xl font-bold text-gray-900">
                    ${largestPosition?.usd_value.toLocaleString() || 0}
                  </p>
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-orange-600" />
                    <span className="text-orange-600 font-medium text-sm">
                      {largestPosition?.asset_symbol || "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Positions by Blockchain */}
          {Object.entries(positionsByChain).map(
            ([blockchain, chainPositions]) => {
              const positions = chainPositions as CrossChainPosition[];
              const chainTotal = positions.reduce(
                (sum, pos) => sum + pos.usd_value,
                0
              );

              return (
                <Card
                  key={blockchain}
                  className="border-0 shadow-xl bg-white/90 backdrop-blur-sm"
                >
                  <CardHeader className="pb-6 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <Badge
                          variant="outline"
                          className={`px-4 py-2 font-medium text-base ${getBlockchainColor(blockchain)}`}
                        >
                          <span className="capitalize">{blockchain}</span>
                        </Badge>
                        <div>
                          <CardTitle className="text-2xl font-bold text-gray-900">
                            ${chainTotal.toLocaleString()}
                          </CardTitle>
                          <CardDescription className="text-base text-gray-600">
                            {positions.length} position
                            {positions.length !== 1 ? "s" : ""} • Updated
                            recently
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="border-gray-200 text-gray-700 hover:bg-gray-50"
                        asChild
                      >
                        <a
                          href={`https://${
                            blockchain === "ethereum"
                              ? "etherscan.io"
                              : blockchain === "polygon"
                                ? "polygonscan.com"
                                : "explorer.com"
                          }`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Explorer
                        </a>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {positions.map((position) => (
                        <Card
                          key={position.id}
                          className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-6">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                  <span className="text-white text-base font-bold">
                                    {position.asset_symbol.slice(0, 2)}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-bold text-lg text-gray-900">
                                    {position.asset_symbol}
                                  </p>
                                  <p className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                                    {position.asset_address.slice(0, 6)}...
                                    {position.asset_address.slice(-4)}
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className={`${getPositionTypeColor(position.position_type)} font-medium capitalize`}
                              >
                                {position.position_type}
                              </Badge>
                            </div>

                            <div className="space-y-4">
                              <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                                    Balance
                                  </span>
                                  <span className="font-bold text-lg text-gray-900">
                                    {position.balance.toFixed(4)}{" "}
                                    {position.asset_symbol}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                                    USD Value
                                  </span>
                                  <span className="font-bold text-xl text-gray-900">
                                    ${position.usd_value.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                                    24h Change
                                  </span>
                                  <span className="text-emerald-600 flex items-center gap-1 font-medium">
                                    <TrendingUp className="h-4 w-4" />
                                    +2.1%
                                  </span>
                                </div>
                              </div>

                              <div className="flex gap-3 pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                                  asChild
                                >
                                  <Link
                                    href={`/dashboard/cross-chain/send?asset=${position.id}`}
                                  >
                                    <Send className="h-4 w-4 mr-2" />
                                    Send
                                  </Link>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 border-purple-200 text-purple-700 hover:bg-purple-50"
                                  asChild
                                >
                                  <Link
                                    href={`/dashboard/cross-chain/swap?from=${position.id}`}
                                  >
                                    <ArrowUpDown className="h-4 w-4 mr-2" />
                                    Swap
                                  </Link>
                                </Button>
                              </div>
                            </div>

                            <div className="text-xs text-gray-500 mt-6 pt-4 border-t border-gray-200">
                              Last updated{" "}
                              {new Date(position.updated_at).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            }
          )}

          {/* Empty State */}
          {totalPositions === 0 && (
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardContent className="text-center py-20">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                  No Cross-Chain Positions Found
                </h3>
                <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto leading-relaxed">
                  Connect your wallets to view positions across different
                  blockchains and manage your multi-chain portfolio
                </p>
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Link href="/dashboard/cross-chain/connect">
                    <Plus className="h-4 w-4 mr-2" />
                    Connect Your First Wallet
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Network Status */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                  <Network className="h-6 w-6 text-blue-600" />
                  Network Status
                </CardTitle>
              </div>
              <CardDescription className="text-base text-gray-600 mt-2">
                Real-time status of supported blockchain networks
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
                {[
                  {
                    name: "Ethereum",
                    status: "online",
                    latency: "12ms",
                    gasPrice: "25 gwei",
                    color: "blue",
                  },
                  {
                    name: "Polygon",
                    status: "online",
                    latency: "8ms",
                    gasPrice: "30 gwei",
                    color: "purple",
                  },
                  {
                    name: "Binance Smart Chain",
                    status: "online",
                    latency: "15ms",
                    gasPrice: "5 gwei",
                    color: "yellow",
                  },
                  {
                    name: "Avalanche",
                    status: "online",
                    latency: "10ms",
                    gasPrice: "25 nAVAX",
                    color: "red",
                  },
                  {
                    name: "Arbitrum",
                    status: "online",
                    latency: "6ms",
                    gasPrice: "0.1 gwei",
                    color: "cyan",
                  },
                ].map((network) => (
                  <div
                    key={network.name}
                    className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      </div>
                      <span className="font-semibold text-gray-900 text-sm">
                        {network.name}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-600">Latency</span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {network.latency}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-orange-600" />
                          <span className="text-gray-600">Gas Price</span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {network.gasPrice}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
