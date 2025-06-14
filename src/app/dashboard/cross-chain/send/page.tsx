"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { createClient } from "../../../../../supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Dynamically import UI components
const Card = dynamic(
  () => import("@/components/ui/card").then((mod) => ({ default: mod.Card })),
  { ssr: false }
);
const CardContent = dynamic(
  () =>
    import("@/components/ui/card").then((mod) => ({
      default: mod.CardContent,
    })),
  { ssr: false }
);
const CardDescription = dynamic(
  () =>
    import("@/components/ui/card").then((mod) => ({
      default: mod.CardDescription,
    })),
  { ssr: false }
);
const CardHeader = dynamic(
  () =>
    import("@/components/ui/card").then((mod) => ({ default: mod.CardHeader })),
  { ssr: false }
);
const CardTitle = dynamic(
  () =>
    import("@/components/ui/card").then((mod) => ({ default: mod.CardTitle })),
  { ssr: false }
);

const Button = dynamic(
  () =>
    import("@/components/ui/button").then((mod) => ({ default: mod.Button })),
  { ssr: false }
);
const Select = dynamic(
  () =>
    import("@/components/ui/select").then((mod) => ({ default: mod.Select })),
  { ssr: false }
);
const SelectContent = dynamic(
  () =>
    import("@/components/ui/select").then((mod) => ({
      default: mod.SelectContent,
    })),
  { ssr: false }
);
const SelectItem = dynamic(
  () =>
    import("@/components/ui/select").then((mod) => ({
      default: mod.SelectItem,
    })),
  { ssr: false }
);
const SelectTrigger = dynamic(
  () =>
    import("@/components/ui/select").then((mod) => ({
      default: mod.SelectTrigger,
    })),
  { ssr: false }
);
const SelectValue = dynamic(
  () =>
    import("@/components/ui/select").then((mod) => ({
      default: mod.SelectValue,
    })),
  { ssr: false }
);
const Badge = dynamic(
  () => import("@/components/ui/badge").then((mod) => ({ default: mod.Badge })),
  { ssr: false }
);

// Dynamically import icons
const Icons = {
  ArrowLeft: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.ArrowLeft })),
    { ssr: false }
  ),
  Send: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.Send })),
    { ssr: false }
  ),
  Globe: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.Globe })),
    { ssr: false }
  ),
  DollarSign: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.DollarSign })),
    { ssr: false }
  ),
  Clock: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.Clock })),
    { ssr: false }
  ),
  Shield: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.Shield })),
    { ssr: false }
  ),
  CheckCircle: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.CheckCircle })),
    { ssr: false }
  ),
  AlertTriangle: dynamic(
    () =>
      import("lucide-react").then((mod) => ({ default: mod.AlertTriangle })),
    { ssr: false }
  ),
  ArrowRight: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.ArrowRight })),
    { ssr: false }
  ),
  Zap: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.Zap })),
    { ssr: false }
  ),
  Network: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.Network })),
    { ssr: false }
  ),
  Wallet: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.Wallet })),
    { ssr: false }
  ),
};

import Link from "next/link";
import { toast } from "@/components/ui/use-toast";

export default function SendPage() {
  const router = useRouter();
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

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

    const assetId = formData.get("asset_id") as string;
    const recipientAddress = formData.get("recipient_address") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const network = formData.get("network") as string;

    // Mock transaction - in reality, this would interact with blockchain
    const transactionHash = "0x" + Math.random().toString(16).substring(2, 66);

    // Here you would implement actual blockchain transaction logic
    console.log("Sending transaction:", {
      assetId,
      recipientAddress,
      amount,
      network,
      transactionHash,
    });

    toast({
      title: "Transaction Sent",
      description: "Your asset transfer has been initiated.",
    });

    router.push("/dashboard/cross-chain?sent=true");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="sm" asChild className="shadow-sm">
              <Link href="/dashboard/cross-chain">
                <Icons.ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cross-Chain
              </Link>
            </Button>
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                Send Assets
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Transfer your cross-chain assets to any address
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Icons.Send className="h-6 w-6 text-blue-600" />
                    Transfer Details
                  </CardTitle>
                  <CardDescription className="text-base">
                    Configure your asset transfer
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <form action={handleSubmit} className="space-y-8">
                    <div className="space-y-3">
                      <Label
                        htmlFor="asset_id"
                        className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                      >
                        <Icons.Wallet className="h-4 w-4" />
                        Select Asset *
                      </Label>
                      <Select name="asset_id" required>
                        <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                          <SelectValue placeholder="Choose asset to send" />
                        </SelectTrigger>
                        <SelectContent>
                          {positions?.map((position) => (
                            <SelectItem key={position.id} value={position.id}>
                              <div className="flex items-center justify-between w-full">
                                <span className="font-medium">
                                  {position.asset_symbol}
                                </span>
                                <span className="text-sm text-muted-foreground ml-4">
                                  {position.balance.toFixed(4)} available
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="recipient_address"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Recipient Address *
                      </Label>
                      <Input
                        id="recipient_address"
                        name="recipient_address"
                        placeholder="0x..."
                        required
                        className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label
                          htmlFor="amount"
                          className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                        >
                          <Icons.DollarSign className="h-4 w-4" />
                          Amount *
                        </Label>
                        <Input
                          id="amount"
                          name="amount"
                          type="number"
                          step="0.000001"
                          placeholder="0.00"
                          required
                          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label
                          htmlFor="network"
                          className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                        >
                          <Icons.Network className="h-4 w-4" />
                          Destination Network *
                        </Label>
                        <Select name="network" required>
                          <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                            <SelectValue placeholder="Select network" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ethereum">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                                Ethereum
                              </div>
                            </SelectItem>
                            <SelectItem value="polygon">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                                Polygon
                              </div>
                            </SelectItem>
                            <SelectItem value="arbitrum">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                                Arbitrum
                              </div>
                            </SelectItem>
                            <SelectItem value="optimism">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                                Optimism
                              </div>
                            </SelectItem>
                            <SelectItem value="bsc">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                                BSC
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <Icons.Send className="h-5 w-5 mr-2" />
                      Send Assets
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Info Panel */}
            <div className="space-y-6">
              {/* Network Status */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-green-800">
                    <Icons.Globe className="h-5 w-5" />
                    Network Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Ethereum</span>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Polygon</span>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Arbitrum</span>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Online
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Transfer Fees */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
                    <Icons.DollarSign className="h-5 w-5" />
                    Transfer Fees
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Base Fee</span>
                    <span className="text-sm font-medium">$2.50</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Network Fee</span>
                    <span className="text-sm font-medium">Dynamic</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900">
                        Estimated Total
                      </span>
                      <span className="text-sm font-bold text-blue-600">
                        $3.75 - $12.50
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Notice */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-amber-800">
                    <Icons.Shield className="h-5 w-5" />
                    Security Notice
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Icons.CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">
                      All transfers are secured by blockchain technology
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icons.CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">
                      Smart contracts ensure automated execution
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icons.AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">
                      Double-check recipient address before sending
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
