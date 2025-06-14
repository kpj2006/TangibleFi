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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowUpDown,
  DollarSign,
  Clock,
  Shield,
  CheckCircle,
  AlertTriangle,
  Zap,
  Activity,
  TrendingUp,
  Coins,
  RefreshCw,
  Network,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import EnhancedPageHeader, {
  commonBadges,
} from "@/components/enhanced-page-header";

export default function SwapPage() {
  const router = useRouter();
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [swapping, setSwapping] = useState(false);

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

      // Fetch user's positions for selection
      const { data: positions } = await supabase
        .from("cross_chain_positions")
        .select("*")
        .eq("user_id", user.id)
        .order("usd_value", { ascending: false });

      setPositions(positions || []);
      setLoading(false);
    };

    loadData();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setSwapping(true);
    const formData = new FormData(e.currentTarget);
    const fromAssetId = formData.get("from_asset_id") as string;
    const toAssetSymbol = formData.get("to_asset_symbol") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const slippage = formData.get("slippage") as string;

    try {
      // Mock transaction - in reality, this would interact with DEX protocols
      const transactionHash = "0x" + Math.random().toString(16).substring(2, 66);

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log("Swapping assets:", {
        fromAssetId,
        toAssetSymbol,
        amount,
        slippage,
        transactionHash,
      });

      toast({
        title: "Swap Completed",
        description: "Your asset swap has been completed successfully.",
      });

      router.push("/dashboard/cross-chain?swapped=true");
    } catch (error) {
      toast({
        title: "Swap Failed",
        description: "There was an error processing your swap. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSwapping(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 animate-fadeIn">
        <div className="space-y-6">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading swap interface...</p>
          </div>
        </div>
      </main>
    );
  }

  const availableTokens = [
    { symbol: "USDC", name: "USD Coin" },
    { symbol: "USDT", name: "Tether" },
    { symbol: "ETH", name: "Ethereum" },
    { symbol: "WBTC", name: "Wrapped Bitcoin" },
    { symbol: "MATIC", name: "Polygon" },
    { symbol: "LINK", name: "Chainlink" },
    { symbol: "UNI", name: "Uniswap" },
    { symbol: "AAVE", name: "Aave" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 animate-fadeIn">
      <div className="space-y-6">
        {/* Enhanced Header */}
        <EnhancedPageHeader
          title="Cross-Chain Asset Swap"
          description="Exchange your assets at the best rates across multiple blockchain networks with minimal slippage and optimal routing"
          badges={[
            commonBadges.active,
            {
              text: "Best Rates",
              variant: "outline",
              icon: <TrendingUp className="h-3 w-3" />,
              className: "text-emerald-700 border-emerald-200",
            },
            {
              text: "Multi-Chain",
              variant: "outline",
              icon: <Network className="h-3 w-3" />,
              className: "text-blue-700 border-blue-200",
            },
            {
              text: "Instant Swap",
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
            {/* Swap Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slideUp">
              {/* Main Form */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <ArrowUpDown className="h-6 w-6 text-blue-600" />
                      Exchange Details
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200 ml-2"
                      >
                        LIVE
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-base">
                      Configure your asset swap with optimal routing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                      {/* From Asset */}
                      <div className="space-y-4">
                        <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <DollarSign className="h-4 w-4" />
                          From Asset *
                        </Label>
                        <div className="border border-gray-200 bg-gradient-to-br from-gray-50/50 to-blue-50/30 rounded-xl p-6 shadow-sm">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <Label className="text-sm text-gray-600">
                                Asset
                              </Label>
                              <Select name="from_asset_id" required>
                                <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                                  <SelectValue placeholder="Select asset to swap" />
                                </SelectTrigger>
                                <SelectContent>
                                  {positions?.map((position) => (
                                    <SelectItem
                                      key={position.id}
                                      value={position.id}
                                    >
                                      <div className="flex items-center justify-between w-full">
                                        <span className="font-medium">
                                          {position.asset_symbol}
                                        </span>
                                        <span className="text-sm text-gray-500 ml-4">
                                          {position.balance.toFixed(4)}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm text-gray-600">
                                Amount
                              </Label>
                              <Input
                                name="amount"
                                type="number"
                                step="0.0001"
                                placeholder="0.00"
                                required
                                className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Swap Direction Indicator */}
                      <div className="flex justify-center">
                        <div className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
                          <ArrowUpDown className="h-6 w-6 text-white" />
                        </div>
                      </div>

                      {/* To Asset */}
                      <div className="space-y-4">
                        <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <Coins className="h-4 w-4" />
                          To Asset *
                        </Label>
                        <div className="border border-gray-200 bg-gradient-to-br from-gray-50/50 to-purple-50/30 rounded-xl p-6 shadow-sm">
                          <div className="space-y-2">
                            <Label className="text-sm text-gray-600">
                              Target Asset
                            </Label>
                            <Select name="to_asset_symbol" required>
                              <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                                <SelectValue placeholder="Select target asset" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableTokens.map((token) => (
                                  <SelectItem key={token.symbol} value={token.symbol}>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{token.symbol}</span>
                                      <span className="text-sm text-gray-500">
                                        {token.name}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Advanced Settings */}
                      <div className="space-y-4">
                        <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <Shield className="h-4 w-4" />
                          Slippage Tolerance
                        </Label>
                        <div className="border border-gray-200 bg-gradient-to-br from-gray-50/50 to-emerald-50/30 rounded-xl p-6 shadow-sm">
                          <Select name="slippage" defaultValue="0.5">
                            <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0.1">0.1% (Low Risk)</SelectItem>
                              <SelectItem value="0.5">0.5% (Recommended)</SelectItem>
                              <SelectItem value="1.0">1.0% (High Liquidity)</SelectItem>
                              <SelectItem value="3.0">3.0% (Maximum)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={swapping}
                        className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {swapping ? (
                          <>
                            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                            Processing Swap...
                          </>
                        ) : (
                          <>
                            <ArrowUpDown className="h-5 w-5 mr-2" />
                            Execute Swap
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                {/* Swap Summary */}
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Activity className="h-5 w-5 text-emerald-600" />
                      Swap Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Exchange Rate</span>
                      <span className="font-medium text-gray-900">1:1.0234</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Network Fee</span>
                      <span className="font-medium text-gray-900">~$2.50</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Platform Fee</span>
                      <span className="font-medium text-gray-900">0.25%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Estimated Time</span>
                      <span className="font-medium text-gray-900">~30 seconds</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-900">You'll Receive</span>
                        <span className="font-bold text-emerald-600">~0.0000 TOKEN</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Market Info */}
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Market Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">24h Volume</span>
                      <span className="font-medium text-gray-900">$2.4M</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Liquidity</span>
                      <span className="font-medium text-emerald-600">High</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Price Impact</span>
                      <span className="font-medium text-gray-900">{"< 0.01%"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Route</span>
                      <span className="font-medium text-blue-600">Optimal</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Notice */}
                <Card className="border border-emerald-200 shadow-lg bg-gradient-to-br from-emerald-50/50 to-green-50/30 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-emerald-900 mb-1">
                          Secure Swapping
                        </h3>
                        <p className="text-sm text-emerald-700">
                          All swaps are executed through audited smart contracts with
                          maximum security protocols.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
