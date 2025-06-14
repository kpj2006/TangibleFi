import { createClient } from "../../../../supabase/server";
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
  FileCheck,
  MapPin,
  DollarSign,
  Calendar,
  Plus,
  Eye,
  Edit,
  TrendingUp,
  Shield,
  Coins,
  Building,
  CheckCircle,
  Wallet,
  Activity,
  Package,
  Home,
  Clock,
  Globe,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import EnhancedPageHeader, {
  commonBadges,
} from "@/components/enhanced-page-header";

// Utility function to format large numbers compactly
const formatCompactNumber = (num: number) => {
  if (num >= 1000000000) {
    return `$${(num / 1000000000).toFixed(1)}B`;
  } else if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `$${(num / 1000).toFixed(1)}K`;
  } else {
    return `$${num.toLocaleString()}`;
  }
};

interface Asset {
  id: string;
  name: string;
  asset_type: string;
  description: string;
  current_value: number;
  original_value: number;
  verification_status: string;
  collateralization_status: string;
  location: string;
  blockchain: string;
  created_at: string;
}

function getStatusBadge(status: string) {
  const colors = {
    verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    collateralized: "bg-blue-50 text-blue-700 border-blue-200",
    available: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <Badge
      variant="outline"
      className={`${colors[status as keyof typeof colors] || "bg-gray-50 text-gray-700 border-gray-200"} font-medium`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export default async function AssetsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: assets } = await supabase
    .from("assets")
    .select(
      `
      id,
      name,
      asset_type,
      description,
      current_value,
      original_value,
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

  const totalValue =
    assets?.reduce((sum, asset) => sum + asset.current_value, 0) || 0;
  const verifiedAssets =
    assets?.filter((asset) => asset.verification_status === "verified")
      .length || 0;
  const collateralizedAssets =
    assets?.filter(
      (asset) => asset.collateralization_status === "collateralized"
    ).length || 0;
  const pendingAssets =
    assets?.filter((asset) => asset.verification_status === "pending").length ||
    0;

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 animate-fadeIn">
        <div className="space-y-8">
          {/* Enhanced Header */}
          <EnhancedPageHeader
            title="Asset Management"
            description="Track and manage your tokenized real-world assets with comprehensive portfolio analytics"
            breadcrumbs={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Assets" },
            ]}
            badges={[
              {
                text: `${assets?.length || 0} Total Assets`,
                variant: "outline",
                icon: <Building className="h-3 w-3" />,
                className: "text-blue-700 border-blue-200",
              },
              {
                text: `${verifiedAssets} Verified`,
                variant: "default",
                icon: <CheckCircle className="h-3 w-3" />,
                className: "bg-green-100 text-green-800 border-green-200",
              },
              {
                text: `$${totalValue.toLocaleString()} Total Value`,
                variant: "outline",
                icon: <DollarSign className="h-3 w-3" />,
                className: "text-emerald-700 border-emerald-200",
              },
              ...(pendingAssets > 0
                ? [
                    {
                      text: `${pendingAssets} Pending Review`,
                      variant: "outline" as const,
                      icon: <Clock className="h-3 w-3" />,
                      className: "text-yellow-700 border-yellow-200",
                    },
                  ]
                : []),
            ]}
            actions={
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Link href="/dashboard/assets/new">
                  <Plus className="h-5 w-5 mr-2" />
                  Tokenize Asset
                </Link>
              </Button>
            }
          />

          {/* Content */}
          <div className="px-6">
            <div className="w-full space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-staggerIn">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-blue-600 flex items-center gap-2 uppercase tracking-wide">
                      <Building className="h-4 w-4" />
                      Total Assets
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                      {assets?.length || 0}
                    </p>
                    <div className="flex items-center gap-1 text-blue-600 mt-2">
                      <Activity className="h-4 w-4" />
                      <span className="text-sm font-medium">NFTs Minted</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-emerald-600 flex items-center gap-2 uppercase tracking-wide">
                      <DollarSign className="h-4 w-4" />
                      Total Value
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                      {formatCompactNumber(totalValue)}
                    </p>
                    <div className="flex items-center gap-1 text-emerald-600 mt-2">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Portfolio Value
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-purple-600 flex items-center gap-2 uppercase tracking-wide">
                      <CheckCircle className="h-4 w-4" />
                      Verified Assets
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                      {verifiedAssets}
                    </p>
                    <div className="flex items-center gap-1 text-purple-600 mt-2">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Ready for Lending
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-orange-600 flex items-center gap-2 uppercase tracking-wide">
                      <Wallet className="h-4 w-4" />
                      Collateralized
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                      {collateralizedAssets}
                    </p>
                    <div className="flex items-center gap-1 text-orange-600 mt-2">
                      <Coins className="h-4 w-4" />
                      <span className="text-sm font-medium">Active Loans</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Assets Grid */}
              {assets && assets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slideUp">
                  {assets.map((asset) => (
                    <Card
                      key={asset.id}
                      className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1 group"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                              <span className="text-white font-bold text-lg">
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
                              <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {asset.name}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground capitalize">
                                {asset.asset_type.replace("_", " ")}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {getStatusBadge(asset.verification_status)}
                            {getStatusBadge(asset.collateralization_status)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Current Value
                            </span>
                            <span className="font-bold text-base sm:text-lg text-gray-900 break-words">
                              {formatCompactNumber(asset.current_value)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Original Value
                            </span>
                            <span className="text-sm text-gray-600 break-words">
                              {formatCompactNumber(asset.original_value)}
                            </span>
                          </div>
                          {asset.location && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {asset.location}
                            </div>
                          )}
                          {asset.blockchain && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Globe className="h-4 w-4" />
                              {asset.blockchain}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            Created {formatTimeAgo(asset.created_at)}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 group-hover:border-blue-300 group-hover:text-blue-600 transition-colors"
                            asChild
                          >
                            <Link href={`/dashboard/assets/${asset.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 group-hover:border-purple-300 group-hover:text-purple-600 transition-colors"
                            asChild
                          >
                            <Link href={`/dashboard/assets/${asset.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Package className="h-12 w-12 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      No Assets Yet
                    </h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                      Start building your portfolio by tokenizing your first
                      real-world asset. Upload documentation and get it verified
                      by our expert team.
                    </p>
                    <Button
                      asChild
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Link href="/dashboard/assets/new">
                        <Plus className="h-5 w-5 mr-2" />
                        Tokenize Your First Asset
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
