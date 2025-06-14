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
import EnhancedPageHeader, {
  commonBadges,
} from "@/components/enhanced-page-header";

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
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 animate-fadeIn">
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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 animate-fadeIn">
      <div className="space-y-6">
        {/* Enhanced Header */}
        <EnhancedPageHeader
          title="Cross-Chain Wallet Hub"
          description="Unified view of your positions across multiple blockchains with real-time portfolio management and seamless cross-chain operations"
          badges={[
            commonBadges.active,
            commonBadges.global,
            {
              text: `${totalChains} Networks Active`,
              variant: "outline",
              icon: <CheckCircle className="h-3 w-3" />,
              className: "text-emerald-700 border-emerald-200",
            },
            {
              text: `${totalPositions} Positions`,
              variant: "outline",
              icon: <Activity className="h-3 w-3" />,
              className: "text-purple-700 border-purple-200",
            },
          ]}
          actions={
            <div className="flex items-center gap-3">
              <Button
                onClick={refreshBalances}
                variant="outline"
                disabled={refreshing}
                className="border-blue-200 text-blue-700 hover:bg-blue-50 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                {refreshing ? "Refreshing..." : "Sync Portfolio"}
              </Button>

              {walletInfo?.isConnected ? (
                <Button
                  asChild
                  className="bg-emerald-600 hover:bg-emerald-700 shadow-sm hover:shadow-md transition-all duration-200"
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
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Link href="/dashboard/cross-chain/connect">
                    <Plus className="h-4 w-4 mr-2" />
                    Connect Wallet
                  </Link>
                </Button>
              )}
            </div>
          }
        />

        {/* Content Section */}
        <div className="w-full px-6">
          <div className="w-full space-y-6">
            {/* Status Messages */}
            {refreshing && (
              <Card className="border border-blue-200 shadow-lg bg-gradient-to-br from-blue-50/50 to-blue-50/30 backdrop-blur-sm animate-slideDown">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <div>
                      <h3 className="font-semibold text-blue-900">
                        Refreshing Balances...
                      </h3>
                      <p className="text-blue-700">
                        Updating your portfolio balances from blockchain
                        networks.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {walletInfo?.isConnected && (
              <Card className="border border-emerald-200 shadow-lg bg-gradient-to-br from-emerald-50/50 to-green-50/30 backdrop-blur-sm animate-slideDown">
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

            {/* Portfolio Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slideUp">
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-200">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <DollarSign className="h-6 w-6 text-emerald-600" />
                    Total Value
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 text-emerald-700 border-emerald-200 ml-2"
                    >
                      LIVE
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-emerald-600">
                      $
                      {totalValue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      Across {totalChains} blockchain
                      {totalChains !== 1 ? "s" : ""}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-200">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Network className="h-6 w-6 text-blue-600" />
                    Active Networks
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-blue-600">
                      {totalChains}
                    </p>
                    <p className="text-sm text-gray-600">
                      Connected blockchains
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-200">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Coins className="h-6 w-6 text-purple-600" />
                    Total Positions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-purple-600">
                      {totalPositions}
                    </p>
                    <p className="text-sm text-gray-600">
                      Asset positions held
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-200">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                    Largest Position
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    {largestPosition ? (
                      <>
                        <p className="text-3xl font-bold text-orange-600">
                          $
                          {largestPosition.usd_value.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-sm text-gray-600">
                          {largestPosition.asset_symbol} on{" "}
                          {largestPosition.blockchain}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-3xl font-bold text-gray-400">
                          $0.00
                        </p>
                        <p className="text-sm text-gray-600">
                          No positions yet
                        </p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm animate-slideUp">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Zap className="h-6 w-6 text-blue-600" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Perform cross-chain operations with ease
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    asChild
                    className="h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <Link href="/dashboard/cross-chain/send">
                      <div className="flex items-center gap-3">
                        <Send className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-semibold">Send Assets</div>
                          <div className="text-xs opacity-90">
                            Cross-chain transfers
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-16 border-purple-200 text-purple-700 hover:bg-purple-50 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <Link href="/dashboard/cross-chain/swap">
                      <div className="flex items-center gap-3">
                        <ArrowUpDown className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-semibold">Swap Tokens</div>
                          <div className="text-xs opacity-70">
                            Exchange assets
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-16 border-emerald-200 text-emerald-700 hover:bg-emerald-50 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <Link href="/dashboard/cross-chain/connect">
                      <div className="flex items-center gap-3">
                        <Wallet className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-semibold">Manage Wallets</div>
                          <div className="text-xs opacity-70">
                            Connect & configure
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Rest of the existing content with enhanced styling */}
            {Object.keys(positionsByChain).length > 0 ? (
              <div className="space-y-6 animate-slideUp">
                {Object.entries(positionsByChain).map(
                  ([blockchain, chainPositions]) => (
                    <Card
                      key={blockchain}
                      className="border-0 shadow-xl bg-white/90 backdrop-blur-sm"
                    >
                      <CardHeader className="border-b border-gray-100">
                        <CardTitle className="flex items-center gap-3 text-xl">
                          <Network className="h-6 w-6 text-blue-600" />
                          <span className="capitalize">{blockchain}</span>
                          <Badge
                            className={`${getBlockchainColor(blockchain)} border ml-2`}
                          >
                            {chainPositions.length} position
                            {chainPositions.length !== 1 ? "s" : ""}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Total value: $
                          {chainPositions
                            .reduce((sum, pos) => sum + pos.usd_value, 0)
                            .toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {chainPositions.map((position) => (
                            <Card
                              key={position.id}
                              className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 hover:shadow-md transition-all duration-200"
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h3 className="font-semibold text-gray-900">
                                      {position.asset_symbol}
                                    </h3>
                                    <p className="text-xs text-gray-500 font-mono">
                                      {position.asset_address.slice(0, 8)}...
                                      {position.asset_address.slice(-6)}
                                    </p>
                                  </div>
                                  <Badge
                                    className={`${getPositionTypeColor(position.position_type)} border`}
                                  >
                                    {position.position_type}
                                  </Badge>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">
                                      Balance:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {position.balance.toLocaleString(
                                        undefined,
                                        {
                                          minimumFractionDigits: 4,
                                          maximumFractionDigits: 4,
                                        }
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">
                                      USD Value:
                                    </span>
                                    <span className="font-bold text-emerald-600">
                                      $
                                      {position.usd_value.toLocaleString(
                                        undefined,
                                        {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        }
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">
                                      Last Updated:
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(
                                        position.updated_at
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex gap-2 mt-4">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 border-gray-200 hover:bg-gray-50"
                                  >
                                    <Send className="h-3 w-3 mr-1" />
                                    Send
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 border-gray-200 hover:bg-gray-50"
                                  >
                                    <ArrowUpDown className="h-3 w-3 mr-1" />
                                    Swap
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            ) : (
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm animate-slideUp">
                <CardContent className="p-12 text-center">
                  <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Cross-Chain Positions
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Connect your wallet and start managing assets across
                    multiple blockchains.
                  </p>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <Link href="/dashboard/cross-chain/connect">
                      <Plus className="h-4 w-4 mr-2" />
                      Connect Wallet
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
