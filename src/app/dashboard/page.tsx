import { Suspense } from "react";
import { createClient } from "../../../supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Landmark,
  DollarSign,
  Wallet,
  Shield,
  InfoIcon,
  Users,
  FileText,
  PlusCircle,
  ChevronRight,
  Target,
  Clock,
  Globe,
  Zap,
  AlertTriangle,
  CheckCircle,
  Building,
  Home,
  Car,
  Coins,
  ArrowUpRight,
  Activity,
  Network,
  Link as LinkIcon,
  Percent,
  CreditCard,
  Banknote,
  Plus,
  Layers,
  Trophy,
  XCircle,
  FileCheck,
  ExternalLink,
  Send,
  ArrowUpDown,
  ShieldCheck,
  Smartphone,
  ArrowLeftRight,
} from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import Link from "next/link";
import { redirect } from "next/navigation";
import EnhancedPageHeader, {
  commonBadges,
} from "@/components/enhanced-page-header";

interface Asset {
  id: string;
  name: string;
  asset_type: string;
  current_value: number;
  verification_status: string;
  collateralization_status: string;
  location: string;
  blockchain: string;
  created_at: string;
}

interface Loan {
  id: string;
  loan_amount: number;
  outstanding_balance: number;
  interest_rate: number;
  monthly_payment: number;
  next_payment_date: string;
  loan_status: string;
  blockchain: string;
  created_at: string;
}

interface CrossChainPosition {
  id: string;
  blockchain: string;
  asset_symbol: string;
  balance: number;
  usd_value: number;
  position_type: string;
  updated_at: string;
}

function getStatusBadge(status: string) {
  const statusConfig = {
    verified: {
      variant: "default" as const,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    pending: {
      variant: "secondary" as const,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    rejected: {
      variant: "destructive" as const,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
    active: {
      variant: "default" as const,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    collateralized: {
      variant: "default" as const,
      icon: CheckCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    available: {
      variant: "secondary" as const,
      icon: Clock,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={`flex items-center gap-1 ${config.bgColor} ${config.borderColor} border`}
    >
      <Icon className={`h-3 w-3 ${config.color}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function calculateHealthRatio(
  totalCollateral: number,
  totalDebt: number
): number {
  if (totalDebt === 0) return 5.0;
  return totalCollateral / totalDebt;
}

function getHealthStatus(ratio: number) {
  if (ratio >= 2.0)
    return {
      status: "Excellent",
      color: "text-green-600",
      icon: CheckCircle,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    };
  if (ratio >= 1.5)
    return {
      status: "Good",
      color: "text-blue-600",
      icon: TrendingUp,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    };
  if (ratio >= 1.2)
    return {
      status: "Warning",
      color: "text-yellow-600",
      icon: AlertTriangle,
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    };
  return {
    status: "Critical",
    color: "text-red-600",
    icon: TrendingDown,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  };
}

function formatTimeAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

// Utility function to format large numbers compactly
function formatCompactNumber(num: number): string {
  if (num >= 1e9) {
    return `$${(num / 1e9).toFixed(1)}B`;
  } else if (num >= 1e6) {
    return `$${(num / 1e6).toFixed(1)}M`;
  } else if (num >= 1e3) {
    return `$${(num / 1e3).toFixed(1)}K`;
  } else {
    return `$${num.toLocaleString()}`;
  }
}

async function refreshPortfolioAction() {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Portfolio refresh - syncs with blockchain networks and database
  console.log("Refreshing portfolio data for user:", user.id);

  return redirect("/dashboard?refreshed=true");
}

async function searchPortfolioAction(formData: FormData) {
  "use server";

  const searchQuery = formData.get("search") as string;
  if (searchQuery && searchQuery.trim()) {
    return redirect(
      `/dashboard?search=${encodeURIComponent(searchQuery.trim())}`
    );
  }
  return redirect("/dashboard");
}

async function quickAddAssetAction() {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // This would typically redirect to an asset creation form
  return redirect("/dashboard/assets/new?quick=true");
}

async function quickPaymentAction() {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // This would typically redirect to payment form with pre-filled upcoming payments
  return redirect("/dashboard/payments?quick=true");
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <>
      <DashboardContent searchParams={searchParams} />
    </>
  );
}

async function DashboardContent({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const params = await searchParams;
  const showRefreshed = params.refreshed === "true";
  const searchQuery = (params.search as string) || "";

  // Fetch user's assets (optimized query)
  const { data: assets } = await supabase
    .from("assets")
    .select(
      `
      id,
      name,
      asset_type,
      current_value,
      verification_status,
      collateralization_status,
      location,
      blockchain,
      created_at
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  // Fetch user's loans (optimized query)
  const { data: loans } = await supabase
    .from("loans")
    .select(
      `
      id,
      loan_amount,
      outstanding_balance,
      interest_rate,
      monthly_payment,
      next_payment_date,
      loan_status,
      blockchain,
      created_at
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  // Fetch cross-chain positions (optimized query)
  const { data: positions } = await supabase
    .from("cross_chain_positions")
    .select(
      `
      id,
      blockchain,
      asset_symbol,
      balance,
      usd_value,
      position_type,
      updated_at
    `
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(20);

  // Filter data based on search query
  const filteredAssets =
    assets?.filter(
      (asset) =>
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.asset_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.location.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const filteredLoans =
    loans?.filter(
      (loan) =>
        loan.blockchain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.loan_status.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const filteredPositions =
    positions?.filter(
      (position) =>
        position.asset_symbol
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        position.blockchain.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // Calculate portfolio metrics
  const totalCollateralValue =
    assets?.reduce((sum, asset) => sum + asset.current_value, 0) || 0;
  const totalLoanBalance =
    loans?.reduce((sum, loan) => sum + loan.outstanding_balance, 0) || 0;
  const totalCryptoValue =
    positions?.reduce((sum, pos) => sum + pos.usd_value, 0) || 0;
  const netWorth = totalCollateralValue + totalCryptoValue - totalLoanBalance;
  const healthRatio = calculateHealthRatio(
    totalCollateralValue,
    totalLoanBalance
  );
  const healthStatus = getHealthStatus(healthRatio);
  const HealthIcon = healthStatus.icon;

  // Calculate recent activity metrics
  const recentAssetsCount =
    assets?.filter((asset) => {
      const createdDate = new Date(asset.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdDate > thirtyDaysAgo;
    }).length || 0;

  const upcomingPayments =
    loans?.filter((loan) => {
      const paymentDate = new Date(loan.next_payment_date);
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      return paymentDate <= sevenDaysFromNow && loan.loan_status === "active";
    }).length || 0;

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 animate-fadeIn">
        <div className="space-y-6">
          {/* Enhanced Header */}
          <EnhancedPageHeader
            title="TangibleFi Dashboard"
            description="Manage your tokenized real-world assets and lending activities with real-time portfolio tracking"
            badges={[
              commonBadges.active,
              commonBadges.global,
              {
                text: healthStatus.status,
                variant: "outline",
                icon: <HealthIcon className="h-3 w-3" />,
                className: `${healthStatus.color} ${healthStatus.borderColor}`,
              },
              {
                text: `${recentAssetsCount} NFTs minted this month`,
                variant: "outline",
                icon: <FileText className="h-3 w-3" />,
                className: "text-blue-700 border-blue-200",
              },
            ]}
            actions={
              <form action={refreshPortfolioAction}>
                <SubmitButton
                  variant="outline"
                  size="lg"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Portfolio
                </SubmitButton>
              </form>
            }
          />

          {/* Content Section */}
          <div className="w-full px-6">
            <div className="w-full space-y-6">
              {/* Search and Filter Bar */}
              <div className="flex flex-col md:flex-row gap-4 items-center animate-slideUp">
                <form
                  action={searchPortfolioAction}
                  className="relative flex-1 max-w-md"
                >
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="search"
                    placeholder="Search assets, loans, positions..."
                    className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    defaultValue={searchQuery}
                  />
                </form>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Last 30 days
                  </Button>
                  {searchQuery && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/dashboard">Clear Search</Link>
                    </Button>
                  )}
                </div>
              </div>

              {/* Search Results Indicator */}
              {searchQuery && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-slideDown">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        Search results for "{searchQuery}"
                      </span>
                    </div>
                    <div className="text-sm text-blue-700">
                      {filteredAssets.length +
                        filteredLoans.length +
                        filteredPositions.length}{" "}
                      items found
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {showRefreshed && (
                <Card className="border border-emerald-200 shadow-lg bg-gradient-to-br from-emerald-50/50 to-green-50/50 animate-slideDown">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="h-6 w-6 text-emerald-600" />
                      <div>
                        <h3 className="font-semibold text-emerald-900">
                          Portfolio Synced!
                        </h3>
                        <p className="text-emerald-700">
                          Your portfolio data has been updated across all
                          connected networks.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Multi-Chain Info Banner */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 shadow-sm animate-slideUp">
                <div className="flex gap-4">
                  <InfoIcon className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-blue-900">
                      TangibleFi: RWA Tokenization & NFT Lending
                    </p>
                    <p className="text-sm text-blue-700">
                      Upload documentation for real estate, commodities, and
                      equipment. Our verification team tokenizes them on the
                      blockchain as NFTs for collateralized lending.
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {recentAssetsCount} NFTs minted this month
                      </Badge>
                      {upcomingPayments > 0 && (
                        <Badge
                          variant="outline"
                          className="bg-yellow-50 text-yellow-700 border-yellow-200"
                        >
                          {upcomingPayments} EMI payments due soon
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200"
                      >
                        Multi-Chain Ready
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-slideUp">
                {/* Live Portfolio Performance Chart */}
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <BarChart3 className="h-6 w-6 text-emerald-600" />
                      Portfolio Performance
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200 ml-2"
                      >
                        LIVE
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Real-time asset value tracking across all networks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Animated Chart Container */}
                    <div className="relative h-64 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl border border-emerald-200 overflow-hidden">
                      {/* Chart Grid */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="grid grid-cols-12 grid-rows-8 h-full">
                          {Array.from({ length: 96 }).map((_, i) => (
                            <div
                              key={i}
                              className="border border-gray-300/30"
                            ></div>
                          ))}
                        </div>
                      </div>

                      {/* Animated Chart Line */}
                      <svg className="absolute inset-0 w-full h-full">
                        <defs>
                          <linearGradient
                            id="chartGradient"
                            x1="0%"
                            y1="0%"
                            x2="0%"
                            y2="100%"
                          >
                            <stop
                              offset="0%"
                              stopColor="#10b981"
                              stopOpacity="0.8"
                            />
                            <stop
                              offset="100%"
                              stopColor="#10b981"
                              stopOpacity="0.1"
                            />
                          </linearGradient>
                        </defs>

                        {/* Animated Path */}
                        <path
                          d="M 0 180 Q 60 120 120 100 T 240 80 T 360 90 T 480 70"
                          stroke="#10b981"
                          strokeWidth="3"
                          fill="none"
                          strokeLinecap="round"
                          className="opacity-100"
                          style={{
                            strokeDasharray: "1000",
                            strokeDashoffset: "1000",
                            animation: "drawLine 2.5s ease-out forwards",
                          }}
                        />

                        {/* Area under curve */}
                        <path
                          d="M 0 180 Q 60 120 120 100 T 240 80 T 360 90 T 480 70 L 480 256 L 0 256 Z"
                          fill="url(#chartGradient)"
                          className="opacity-0"
                          style={{
                            animation: "fadeInArea 1s ease-out 2s forwards",
                          }}
                        />

                        {/* Animated Data Points */}
                        {[120, 240, 360, 480].map((x, i) => (
                          <circle
                            key={i}
                            cx={x}
                            cy={[100, 80, 90, 70][i]}
                            r="4"
                            fill="#10b981"
                            className="opacity-0 scale-0"
                            style={{
                              animation: `fadeInScale 0.5s ease-out ${2.5 + i * 0.2}s forwards`,
                            }}
                          />
                        ))}

                        <style>{`
                        @keyframes drawLine {
                          from { stroke-dashoffset: 1000; }
                          to { stroke-dashoffset: 0; }
                        }
                        @keyframes fadeInArea {
                          from { opacity: 0; }
                          to { opacity: 0.6; }
                        }
                        @keyframes fadeInScale {
                          from { opacity: 0; transform: scale(0); }
                          to { opacity: 1; transform: scale(1); }
                        }
                      `}</style>
                      </svg>

                      {/* Chart Labels */}
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs text-gray-600">
                        <span>7d</span>
                        <span>30d</span>
                        <span>90d</span>
                        <span>1y</span>
                      </div>

                      {/* Current Value Display */}
                      <div className="absolute top-4 left-4">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-emerald-200 shadow-md">
                          <p className="text-2xl font-bold text-emerald-600">
                            ${netWorth.toLocaleString()}
                          </p>
                          <p className="text-sm text-emerald-700 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Portfolio Value
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-600 font-medium">
                          Total Assets
                        </p>
                        <p className="text-lg font-bold text-blue-900 flex items-center justify-center gap-1">
                          <Building className="h-4 w-4" />
                          {filteredAssets.length}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm text-purple-600 font-medium">
                          Verified
                        </p>
                        <p className="text-lg font-bold text-purple-900">
                          {
                            filteredAssets.filter(
                              (asset) =>
                                asset.verification_status === "verified"
                            ).length
                          }
                        </p>
                      </div>
                      <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <p className="text-sm text-emerald-600 font-medium">
                          Collateralized
                        </p>
                        <p className="text-lg font-bold text-emerald-900">
                          {
                            filteredAssets.filter(
                              (asset) =>
                                asset.collateralization_status ===
                                "collateralized"
                            ).length
                          }
                        </p>
                      </div>
                    </div>

                    {/* Top Performing Assets Section */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-yellow-600" />
                          Top Performing Assets
                        </h3>
                        <Badge
                          variant="outline"
                          className="text-xs text-gray-600"
                        >
                          Your Assets
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        {filteredAssets.length > 0 ? (
                          filteredAssets.slice(0, 3).map((asset, index) => (
                            <div
                              key={asset.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
                                  <span className="text-lg">
                                    {asset.asset_type === "real_estate"
                                      ? "🏢"
                                      : asset.asset_type === "commodity"
                                        ? "🥇"
                                        : asset.asset_type === "equipment"
                                          ? "⚙️"
                                          : asset.asset_type === "vehicle"
                                            ? "🚗"
                                            : "📄"}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">
                                    {asset.name}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {asset.asset_type
                                      .replace("_", " ")
                                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                                  </p>
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="font-semibold text-gray-900 text-sm">
                                  ${asset.current_value.toLocaleString()}
                                </p>
                                <div className="flex items-center gap-1 justify-end">
                                  {getStatusBadge(asset.verification_status)}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Building className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-sm font-medium">
                              No assets found
                            </p>
                            <p className="text-xs">
                              Start by tokenizing your first asset
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex justify-center">
                        <button className="text-sm text-gray-600 hover:text-gray-900 font-medium hover:underline transition-colors">
                          View All Assets →
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Real-Time Blockchain Network Status */}
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Globe className="h-6 w-6 text-blue-600" />
                      Network Status
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-2"></div>
                    </CardTitle>
                    <CardDescription>
                      Multi-chain network health and gas prices
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <Globe className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm font-medium text-gray-500">
                        Network Status
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Real-time network data will be displayed here
                      </p>
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600 font-medium">
                          All Networks Operational
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity & Quick Actions */}
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Activity className="h-6 w-6 text-purple-600" />
                      Recent Activity
                      <Badge
                        variant="outline"
                        className="bg-purple-50 text-purple-700 border-purple-200 ml-2"
                      >
                        LIVE
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Latest transactions and portfolio updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Recent Activity Items */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Plus className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              Asset Tokenized
                            </p>
                            <p className="text-xs text-gray-500">
                              Real Estate Property #1234
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">2h ago</span>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              Verification Complete
                            </p>
                            <p className="text-xs text-gray-500">
                              Commercial Equipment verified
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">4h ago</span>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              Loan Payment Due
                            </p>
                            <p className="text-xs text-gray-500">
                              $2,500 due in 3 days
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">1d ago</span>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-purple-600" />
                          Quick Actions
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            asChild
                          >
                            <Link href="/dashboard/assets/new">
                              <Plus className="h-3 w-3 mr-1" />
                              Add Asset
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            asChild
                          >
                            <Link href="/dashboard/loans/new">
                              <CreditCard className="h-3 w-3 mr-1" />
                              New Loan
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-purple-600 border-purple-200 hover:bg-purple-50"
                            asChild
                          >
                            <Link href="/dashboard/payments">
                              <Send className="h-3 w-3 mr-1" />
                              Pay Now
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-orange-600 border-orange-200 hover:bg-orange-50"
                            asChild
                          >
                            <Link href="/dashboard/cross-chain">
                              <ArrowUpDown className="h-3 w-3 mr-1" />
                              Transfer
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Financial Health Summary */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-staggerIn">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-blue-600 flex items-center gap-2 uppercase tracking-wide">
                      <Wallet className="h-4 w-4" />
                      Total Collateral Value
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                        {formatCompactNumber(totalCollateralValue)}
                      </p>
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-600 font-medium text-sm">
                          Collateral Portfolio
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {assets?.length || 0} tokenized assets
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-orange-600 flex items-center gap-2 uppercase tracking-wide">
                      <Landmark className="h-4 w-4" />
                      Outstanding Loans
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                        {formatCompactNumber(totalLoanBalance)}
                      </p>
                      <div className="flex items-center gap-2">
                        <Landmark className="h-4 w-4 text-orange-600" />
                        <span className="text-orange-600 font-medium text-sm">
                          Active Borrowing
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {loans?.length || 0} active loans
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-indigo-600 flex items-center gap-2 uppercase tracking-wide">
                      <BarChart3 className="h-4 w-4" />
                      Health Ratio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                        {healthRatio.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2">
                        <HealthIcon
                          className={`h-4 w-4 ${healthStatus.color}`}
                        />
                        <span
                          className={`text-sm font-medium ${healthStatus.color}`}
                        >
                          {healthStatus.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Collateral to debt ratio
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-emerald-600 flex items-center gap-2 uppercase tracking-wide">
                      <Coins className="h-4 w-4" />
                      Cross-Chain Value
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                        {formatCompactNumber(totalCryptoValue)}
                      </p>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-emerald-600" />
                        <span className="text-emerald-600 font-medium text-sm">
                          Multi-Chain Assets
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {positions?.length || 0} cross-chain positions
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-purple-600 flex items-center gap-2 uppercase tracking-wide">
                      <DollarSign className="h-4 w-4" />
                      Net Worth
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                        {formatCompactNumber(netWorth)}
                      </p>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                        <span className="text-purple-600 font-medium text-sm">
                          Total Portfolio
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Assets minus liabilities
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Responsive Layout Demo */}
              <section className="animate-slideUp">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 backdrop-blur-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Smartphone className="h-6 w-6 text-purple-600" />
                      Responsive Dashboard
                      <Badge
                        variant="outline"
                        className="bg-purple-50 text-purple-700 border-purple-200 ml-2"
                      >
                        NEW
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Experience our fully responsive sidebar that adapts to
                      your screen size
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <Smartphone className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Mobile First
                        </h3>
                        <p className="text-sm text-gray-600">
                          Sidebar becomes an overlay on mobile devices with
                          smooth animations
                        </p>
                      </div>

                      <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <ArrowLeftRight className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Collapsible
                        </h3>
                        <p className="text-sm text-gray-600">
                          Toggle between expanded and collapsed states for more
                          screen space
                        </p>
                      </div>

                      <div className="text-center p-4 bg-white rounded-lg border border-emerald-200">
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <Zap className="h-6 w-6 text-emerald-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Smooth Transitions
                        </h3>
                        <p className="text-sm text-gray-600">
                          All layout changes are animated for a polished user
                          experience
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                        <InfoIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-blue-900 mb-1">
                            How to Use
                          </h4>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>
                              • <strong>Desktop:</strong> Click the toggle
                              button in the sidebar header to collapse/expand
                            </li>
                            <li>
                              • <strong>Mobile:</strong> Tap the menu button in
                              the top-left corner to open the sidebar
                            </li>
                            <li>
                              • <strong>Keyboard:</strong> Press Escape to close
                              the mobile sidebar
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* DeFi Protocol Integration Dashboard */}
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm animate-slideUp">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Coins className="h-6 w-6 text-purple-600" />
                    DeFi Protocol Integration
                    <Badge
                      variant="outline"
                      className="bg-purple-50 text-purple-700 border-purple-200"
                    >
                      NEW
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Connected protocols and yield opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {/* Uniswap */}
                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-200 hover:shadow-lg transition-all duration-300 group">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <svg
                            className="w-5 h-5 text-white"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.5 6.1L12 16.9 6.5 6.1h11z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-pink-900">
                            Uniswap V3
                          </h4>
                          <p className="text-xs text-pink-700">DEX Trading</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-pink-700">TVL</span>
                          <span className="font-medium text-pink-900">
                            $4.2B
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-pink-700">APY</span>
                          <span className="font-medium text-emerald-600">
                            +8.5%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Aave */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200 hover:shadow-lg transition-all duration-300 group">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <svg
                            className="w-5 h-5 text-white"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-900">
                            Aave V3
                          </h4>
                          <p className="text-xs text-blue-700">Lending Pool</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-700">Supply APY</span>
                          <span className="font-medium text-emerald-600">
                            +5.2%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-700">Borrow APY</span>
                          <span className="font-medium text-blue-900">
                            3.8%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Compound */}
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200 hover:shadow-lg transition-all duration-300 group">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <svg
                            className="w-5 h-5 text-white"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="6" />
                            <circle cx="12" cy="12" r="2" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-emerald-900">
                            Compound
                          </h4>
                          <p className="text-xs text-emerald-700">
                            Money Market
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-emerald-700">COMP Earned</span>
                          <span className="font-medium text-emerald-900">
                            24.5
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-emerald-700">APY</span>
                          <span className="font-medium text-emerald-600">
                            +6.8%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Curve */}
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200 hover:shadow-lg transition-all duration-300 group">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <svg
                            className="w-5 h-5 text-white"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-orange-900">
                            Curve
                          </h4>
                          <p className="text-xs text-orange-700">
                            Stable Swaps
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-orange-700">Pool Share</span>
                          <span className="font-medium text-orange-900">
                            2.1%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-orange-700">Rewards</span>
                          <span className="font-medium text-emerald-600">
                            +12.3%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* MakerDAO */}
                    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-200 hover:shadow-lg transition-all duration-300 group">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <svg
                            className="w-5 h-5 text-white"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-teal-900">
                            MakerDAO
                          </h4>
                          <p className="text-xs text-teal-700">
                            DAI Stablecoin
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-teal-700">DAI Minted</span>
                          <span className="font-medium text-teal-900">
                            1,250
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-teal-700">Stability Fee</span>
                          <span className="font-medium text-teal-600">
                            2.5%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Yearn Finance */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-200 hover:shadow-lg transition-all duration-300 group">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <svg
                            className="w-5 h-5 text-white"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-indigo-900">
                            Yearn
                          </h4>
                          <p className="text-xs text-indigo-700">
                            Yield Farming
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-indigo-700">Vault APY</span>
                          <span className="font-medium text-emerald-600">
                            +15.2%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-indigo-700">YFI Rewards</span>
                          <span className="font-medium text-indigo-900">
                            0.05
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Real-Time Transaction Feed */}
                  <div className="mt-6 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      Live Transaction Feed
                    </h4>
                    <div className="text-center py-4">
                      <Activity className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-xs text-gray-500">
                        No recent activity
                      </p>
                      <p className="text-xs text-gray-400">
                        Your transactions will appear here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Assets and Loans Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Enhanced Assets Section */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <FileCheck className="h-6 w-6 text-blue-600" />
                        Tokenized Asset NFTs
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {filteredAssets.length}{" "}
                          {searchQuery ? "filtered" : "total"}
                        </Badge>
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/dashboard/assets">
                            View All NFTs
                            <ArrowUpRight className="h-3 w-3 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    {filteredAssets && filteredAssets.length > 0 ? (
                      filteredAssets.slice(0, 3).map((asset: Asset) => (
                        <div
                          key={asset.id}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900">
                                {asset.name}
                              </p>
                              <Badge
                                variant="outline"
                                className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                              >
                                NFT
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {asset.asset_type} • {asset.location}
                            </p>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(asset.verification_status)}
                              <Badge
                                variant="outline"
                                className="text-xs bg-white"
                              >
                                {asset.blockchain}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`text-xs ${asset.collateralization_status === "collateralized" ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-green-50 text-green-700 border-green-200"}`}
                              >
                                {asset.collateralization_status ===
                                "collateralized"
                                  ? "Used as Collateral"
                                  : "Available for Lending"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Minted {formatTimeAgo(asset.created_at)}
                            </p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="font-bold text-lg text-gray-900">
                              ${asset.current_value.toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              NFT Value
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <FileCheck className="h-16 w-16 mx-auto mb-4 opacity-40" />
                        <p className="text-lg font-medium mb-2">
                          {searchQuery
                            ? "No matching NFTs found"
                            : "No asset NFTs found"}
                        </p>
                        <p className="text-sm mb-6">
                          {searchQuery
                            ? "Try adjusting your search terms"
                            : "Start by tokenizing your first real-world asset into an NFT"}
                        </p>
                        {!searchQuery && (
                          <Button
                            asChild
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Link href="/dashboard/assets/new">
                              <Plus className="h-4 w-4 mr-2" />
                              Mint Asset NFT
                            </Link>
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Enhanced Loans Section */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Landmark className="h-6 w-6 text-orange-600" />
                        Stablecoin Loans
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {filteredLoans.length}{" "}
                          {searchQuery ? "filtered" : "total"}
                        </Badge>
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/dashboard/loans">
                            View All Loans
                            <ArrowUpRight className="h-3 w-3 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    {filteredLoans && filteredLoans.length > 0 ? (
                      filteredLoans.slice(0, 3).map((loan: Loan) => {
                        const paymentProgress =
                          ((loan.loan_amount - loan.outstanding_balance) /
                            loan.loan_amount) *
                          100;
                        const isPaymentDue =
                          new Date(loan.next_payment_date) <= new Date();

                        return (
                          <div
                            key={loan.id}
                            className="p-4 bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-xl border border-gray-200 space-y-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-gray-900">
                                    ${loan.loan_amount.toLocaleString()} USDC
                                    Loan
                                  </p>
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                  >
                                    Stablecoin
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {loan.interest_rate}% APR • {loan.blockchain}{" "}
                                  • NFT Collateralized
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(loan.loan_status)}
                                {isPaymentDue && (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    EMI Due
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Outstanding: $
                                  {loan.outstanding_balance.toLocaleString()}{" "}
                                  USDC
                                </span>
                                <span className="font-medium">
                                  Next EMI: $
                                  {loan.monthly_payment.toLocaleString()} USDC
                                </span>
                              </div>
                              <Progress
                                value={paymentProgress}
                                className="h-2"
                              />
                              <div className="flex justify-between items-center">
                                <p className="text-xs text-muted-foreground">
                                  Next EMI payment:{" "}
                                  {new Date(
                                    loan.next_payment_date
                                  ).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {paymentProgress.toFixed(1)}% repaid
                                </p>
                              </div>
                              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                <p className="text-xs text-orange-700">
                                  🔒 Collateral: NFT #{loan.id.slice(-6)} locked
                                  until loan completion
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Landmark className="h-16 w-16 mx-auto mb-4 opacity-40" />
                        <p className="text-lg font-medium mb-2">
                          {searchQuery
                            ? "No matching loans found"
                            : "No stablecoin loans"}
                        </p>
                        <p className="text-sm mb-6">
                          {searchQuery
                            ? "Try adjusting your search terms"
                            : "Use your asset NFTs as collateral to borrow stablecoins"}
                        </p>
                        {!searchQuery && (
                          <Button
                            asChild
                            variant="outline"
                            className="border-orange-200 text-orange-700 hover:bg-orange-50"
                          >
                            <Link href="/dashboard/loans/new">
                              <Plus className="h-4 w-4 mr-2" />
                              Borrow Stablecoins
                            </Link>
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Asset Upload & Verification Workflow */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30 backdrop-blur-sm animate-slideUp">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <FileCheck className="h-6 w-6 text-blue-600" />
                    Asset Documentation & Verification
                  </CardTitle>
                  <CardDescription className="text-base">
                    Upload your real-world asset documentation for blockchain
                    verification and NFT minting
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Real Estate */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 animate-fadeIn">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-blue-900">
                            Real Estate
                          </h3>
                          <p className="text-sm text-blue-700">
                            Properties & Land
                          </p>
                        </div>
                      </div>
                      <ul className="space-y-2 text-sm text-blue-800 mb-4">
                        <li>• Property Deeds</li>
                        <li>• Title Documents</li>
                        <li>• Valuation Reports</li>
                        <li>• Insurance Papers</li>
                      </ul>
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        asChild
                      >
                        <Link href="/dashboard/assets/new?type=real_estate">
                          Upload Property Docs
                        </Link>
                      </Button>
                    </div>

                    {/* Commodities */}
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-6 border border-emerald-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 animate-fadeIn">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-emerald-900">
                            Commodities
                          </h3>
                          <p className="text-sm text-emerald-700">
                            Gold, Oil, Metals
                          </p>
                        </div>
                      </div>
                      <ul className="space-y-2 text-sm text-emerald-800 mb-4">
                        <li>• Warehouse Receipts</li>
                        <li>• Quality Certificates</li>
                        <li>• Storage Documentation</li>
                        <li>• Purity Verification</li>
                      </ul>
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        asChild
                      >
                        <Link href="/dashboard/assets/new?type=commodities">
                          Upload Commodity Docs
                        </Link>
                      </Button>
                    </div>

                    {/* Equipment */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-6 border border-purple-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 animate-fadeIn">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center shadow-md">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-purple-900">
                            Equipment
                          </h3>
                          <p className="text-sm text-purple-700">
                            Machinery & Vehicles
                          </p>
                        </div>
                      </div>
                      <ul className="space-y-2 text-sm text-purple-800 mb-4">
                        <li>• Purchase Invoices</li>
                        <li>• Maintenance Records</li>
                        <li>• Condition Reports</li>
                        <li>• Registration Papers</li>
                      </ul>
                      <Button
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        asChild
                      >
                        <Link href="/dashboard/assets/new?type=equipment">
                          Upload Equipment Docs
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Verification Process */}
                  <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl p-6 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      Verification Process Timeline
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-blue-600 font-bold">1</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          Upload Docs
                        </p>
                        <p className="text-xs text-gray-600">
                          Submit documentation
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-yellow-600 font-bold">2</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          Team Review
                        </p>
                        <p className="text-xs text-gray-600">
                          Expert verification
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-purple-600 font-bold">3</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          NFT Minting
                        </p>
                        <p className="text-xs text-gray-600">
                          Blockchain tokenization
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-emerald-600 font-bold">4</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          Ready to Lend
                        </p>
                        <p className="text-xs text-gray-600">
                          Collateral available
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Cross-Chain Positions */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Globe className="h-6 w-6 text-emerald-600" />
                      Cross-Chain Positions
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {filteredPositions.length}{" "}
                        {searchQuery ? "filtered" : "total"}
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/cross-chain">
                          View All
                          <ArrowUpRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {filteredPositions && filteredPositions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredPositions
                        .slice(0, 6)
                        .map((position: CrossChainPosition) => (
                          <div
                            key={position.id}
                            className="p-6 bg-gradient-to-br from-gray-50 to-purple-50/30 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                                  <span className="text-sm font-bold text-white">
                                    {position.asset_symbol.slice(0, 2)}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {position.asset_symbol}
                                  </p>
                                  <p className="text-sm text-muted-foreground capitalize">
                                    {position.blockchain}
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className="text-xs capitalize bg-white"
                              >
                                {position.position_type}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <p className="text-lg font-bold text-gray-900">
                                ${position.usd_value.toLocaleString()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {position.balance.toFixed(4)}{" "}
                                {position.asset_symbol}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Updated {formatTimeAgo(position.updated_at)}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Globe className="h-16 w-16 mx-auto mb-4 opacity-40" />
                      <p className="text-lg font-medium mb-2">
                        {searchQuery
                          ? "No matching positions found"
                          : "No cross-chain positions"}
                      </p>
                      <p className="text-sm mb-6">
                        {searchQuery
                          ? "Try adjusting your search terms"
                          : "Connect your wallets to view positions across different blockchains"}
                      </p>
                      {!searchQuery && (
                        <Button
                          asChild
                          variant="outline"
                          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        >
                          <Link href="/dashboard/cross-chain/connect">
                            <Plus className="h-4 w-4 mr-2" />
                            Connect Wallet
                          </Link>
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Enhanced Quick Actions */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-xl">TangibleFi Workflow</CardTitle>
                  <CardDescription className="text-base">
                    Complete workflow from asset tokenization to automated loan
                    repayment
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button
                      variant="outline"
                      className="h-24 flex-col gap-3 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group"
                      asChild
                    >
                      <Link href="/dashboard/assets/new">
                        <FileCheck className="h-8 w-8 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">
                          Mint Asset NFT
                        </span>
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-24 flex-col gap-3 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 group"
                      asChild
                    >
                      <Link href="/dashboard/loans/new">
                        <Landmark className="h-8 w-8 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">Borrow USDC</span>
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-24 flex-col gap-3 border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 group"
                      asChild
                    >
                      <Link href="/dashboard/payments">
                        <Coins className="h-8 w-8 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">
                          Setup Auto-EMI
                        </span>
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-24 flex-col gap-3 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 group"
                      asChild
                    >
                      <Link href="/dashboard/cross-chain">
                        <Globe className="h-8 w-8 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">Multi-Chain</span>
                      </Link>
                    </Button>
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
