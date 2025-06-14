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
  ArrowRight,
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
  Bridge,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import EnhancedPageHeader, {
  commonBadges,
} from "@/components/enhanced-page-header";

interface BridgeNetwork {
  id: string;
  name: string;
  symbol: string;
  chainId: number;
  icon: string;
  gasToken: string;
  bridgeFee: number;
  estimatedTime: string;
  status: "active" | "maintenance" | "congested";
}

export default function BridgePage() {
  const router = useRouter();
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [bridging, setBridging] = useState(false);
  const [selectedFromNetwork, setSelectedFromNetwork] = useState<string>("");
  const [selectedToNetwork, setSelectedToNetwork] = useState<string>("");

  const networks: BridgeNetwork[] = [
    {
      id: "ethereum",
      name: "Ethereum",
      symbol: "ETH",
      chainId: 1,
      icon: "🔷",
      gasToken: "ETH",
      bridgeFee: 0.005,
      estimatedTime: "15-30 min",
      status: "active",
    },
    {
      id: "polygon",
      name: "Polygon",
      symbol: "MATIC",
      chainId: 137,
      icon: "🟣",
      gasToken: "MATIC",
      bridgeFee: 0.001,
      estimatedTime: "5-10 min",
      status: "active",
    },
    {
      id: "arbitrum",
      name: "Arbitrum",
      symbol: "ARB",
      chainId: 42161,
      icon: "🔵",
      gasToken: "ETH",
      bridgeFee: 0.002,
      estimatedTime: "10-15 min",
      status: "active",
    },
    {
      id: "optimism",
      name: "Optimism",
      symbol: "OP",
      chainId: 10,
      icon: "🔴",
      gasToken: "ETH",
      bridgeFee: 0.003,
      estimatedTime: "10-15 min",
      status: "active",
    },
    {
      id: "bsc",
      name: "BNB Smart Chain",
      symbol: "BNB",
      chainId: 56,
      icon: "🟡",
      gasToken: "BNB",
      bridgeFee: 0.0005,
      estimatedTime: "3-5 min",
      status: "active",
    },
    {
      id: "avalanche",
      name: "Avalanche",
      symbol: "AVAX",
      chainId: 43114,
      icon: "🔺",
      gasToken: "AVAX",
      bridgeFee: 0.001,
      estimatedTime: "2-5 min",
      status: "congested",
    },
  ];

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

  const handleSubmit = async (formData: FormData) => {
    if (!user) return;

    setBridging(true);
    const fromNetwork = formData.get("from_network") as string;
    const toNetwork = formData.get("to_network") as string;
    const assetId = formData.get("asset_id") as string;
    const amount = parseFloat(formData.get("amount") as string);

    try {
      // Mock transaction - in reality, this would interact with bridge protocols
      const transactionHash = "0x" + Math.random().toString(16).substring(2, 66);

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000));

      console.log("Bridging assets:", {
        fromNetwork,
        toNetwork,
        assetId,
        amount,
        transactionHash,
      });

      toast({
        title: "Bridge Transaction Initiated",
        description: `Your assets are being bridged from ${fromNetwork} to ${toNetwork}. This may take up to 30 minutes.`,
      });

      router.push("/dashboard/cross-chain?bridged=true");
    } catch (error) {
      toast({
        title: "Bridge Failed",
        description: "There was an error processing your bridge transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBridging(false);
    }
  };

  const getNetworkStatus = (status: string) => {
    switch (status) {
      case "active":
        return { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", text: "Active" };
      case "congested":
        return { color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", text: "Congested" };
      case "maintenance":
        return { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", text: "Maintenance" };
      default:
        return { color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200", text: "Unknown" };
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 animate-fadeIn">
        <div className="space-y-6">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading bridge interface...</p>
          </div>
        </div>
      </main>
    );
  }

  const selectedFromNetworkData = networks.find(n => n.id === selectedFromNetwork);
  const selectedToNetworkData = networks.find(n => n.id === selectedToNetwork);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 animate-fadeIn">
      <div className="space-y-6">
        {/* Enhanced Header */}
        <EnhancedPageHeader
          title="Cross-Chain Bridge"
          description="Transfer your assets seamlessly across different blockchain networks with secure and efficient bridging protocols"
          badges={[
            commonBadges.active,
            {
              text: "Multi-Chain",
              variant: "outline",
              icon: <Network className="h-3 w-3" />,
              className: "text-blue-700 border-blue-200",
            },
            {
              text: "Secure Bridge",
              variant: "outline",
              icon: <Shield className="h-3 w-3" />,
              className: "text-emerald-700 border-emerald-200",
            },
            {
              text: "Fast Transfer",
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
            {/* Bridge Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slideUp">
              {/* Main Form */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Bridge className="h-6 w-6 text-blue-600" />
                      Bridge Configuration
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200 ml-2"
                      >
                        SECURE
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-base">
                      Configure your cross-chain asset transfer
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <form action={handleSubmit} className="space-y-8">
                      {/* From Network */}
                      <div className="space-y-4">
                        <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <Globe className="h-4 w-4" />
                          From Network *
                        </Label>
                        <div className="border border-gray-200 bg-gradient-to-br from-gray-50/50 to-blue-50/30 rounded-xl p-6 shadow-sm">
                          <Select 
                            name="from_network" 
                            required 
                            value={selectedFromNetwork}
                            onValueChange={setSelectedFromNetwork}
                          >
                            <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                              <SelectValue placeholder="Select source network" />
                            </SelectTrigger>
                            <SelectContent>
                              {networks.map((network) => {
                                const status = getNetworkStatus(network.status);
                                return (
                                  <SelectItem key={network.id} value={network.id}>
                                    <div className="flex items-center justify-between w-full">
                                      <div className="flex items-center gap-2">
                                        <span className="text-lg">{network.icon}</span>
                                        <span className="font-medium">{network.name}</span>
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className={`${status.color} ${status.bg} ${status.border} ml-2`}
                                      >
                                        {status.text}
                                      </Badge>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Asset Selection */}
                      <div className="space-y-4">
                        <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <DollarSign className="h-4 w-4" />
                          Asset to Bridge *
                        </Label>
                        <div className="border border-gray-200 bg-gradient-to-br from-gray-50/50 to-emerald-50/30 rounded-xl p-6 shadow-sm">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm text-gray-600">
                                Asset
                              </Label>
                              <Select name="asset_id" required>
                                <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                                  <SelectValue placeholder="Select asset to bridge" />
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

                      {/* Bridge Direction Indicator */}
                      <div className="flex justify-center">
                        <div className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
                          <ArrowRight className="h-6 w-6 text-white" />
                        </div>
                      </div>

                      {/* To Network */}
                      <div className="space-y-4">
                        <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <Network className="h-4 w-4" />
                          To Network *
                        </Label>
                        <div className="border border-gray-200 bg-gradient-to-br from-gray-50/50 to-purple-50/30 rounded-xl p-6 shadow-sm">
                          <Select 
                            name="to_network" 
                            required
                            value={selectedToNetwork}
                            onValueChange={setSelectedToNetwork}
                          >
                            <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                              <SelectValue placeholder="Select destination network" />
                            </SelectTrigger>
                            <SelectContent>
                              {networks
                                .filter(network => network.id !== selectedFromNetwork)
                                .map((network) => {
                                  const status = getNetworkStatus(network.status);
                                  return (
                                    <SelectItem key={network.id} value={network.id}>
                                      <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-2">
                                          <span className="text-lg">{network.icon}</span>
                                          <span className="font-medium">{network.name}</span>
                                        </div>
                                        <Badge
                                          variant="outline"
                                          className={`${status.color} ${status.bg} ${status.border} ml-2`}
                                        >
                                          {status.text}
                                        </Badge>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={bridging}
                        className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {bridging ? (
                          <>
                            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                            Processing Bridge...
                          </>
                        ) : (
                          <>
                            <Bridge className="h-5 w-5 mr-2" />
                            Initiate Bridge
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                {/* Bridge Summary */}
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Activity className="h-5 w-5 text-emerald-600" />
                      Bridge Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {selectedFromNetworkData && selectedToNetworkData ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Route</span>
                          <span className="font-medium text-gray-900">
                            {selectedFromNetworkData.name} → {selectedToNetworkData.name}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Bridge Fee</span>
                          <span className="font-medium text-gray-900">
                            {selectedToNetworkData.bridgeFee} {selectedToNetworkData.gasToken}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Estimated Time</span>
                          <span className="font-medium text-gray-900">
                            {selectedToNetworkData.estimatedTime}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Network Status</span>
                          <Badge
                            variant="outline"
                            className={`${getNetworkStatus(selectedToNetworkData.status).color} ${getNetworkStatus(selectedToNetworkData.status).bg} ${getNetworkStatus(selectedToNetworkData.status).border}`}
                          >
                            {getNetworkStatus(selectedToNetworkData.status).text}
                          </Badge>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">
                          Select networks to see bridge details
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Network Status */}
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Network className="h-5 w-5 text-blue-600" />
                      Network Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    {networks.slice(0, 4).map((network) => {
                      const status = getNetworkStatus(network.status);
                      return (
                        <div key={network.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{network.icon}</span>
                            <span className="font-medium text-sm">{network.name}</span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`${status.color} ${status.bg} ${status.border} text-xs`}
                          >
                            {status.text}
                          </Badge>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Security Notice */}
                <Card className="border border-emerald-200 shadow-lg bg-gradient-to-br from-emerald-50/50 to-green-50/30 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-emerald-900 mb-1">
                          Secure Bridging
                        </h3>
                        <p className="text-sm text-emerald-700">
                          All bridge transactions are secured by battle-tested protocols
                          with multi-signature validation and time-lock mechanisms.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Important Notice */}
                <Card className="border border-yellow-200 shadow-lg bg-gradient-to-br from-yellow-50/50 to-orange-50/30 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-yellow-900 mb-1">
                          Bridge Time Notice
                        </h3>
                        <p className="text-sm text-yellow-700">
                          Cross-chain bridges can take 15-30 minutes to complete.
                          Your assets will be locked during this process.
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