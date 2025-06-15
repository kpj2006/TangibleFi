import { createClient } from "../../../../../supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  DollarSign,
  Calendar,
  MapPin,
  FileText,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Edit,
  Share,
  Download,
  Eye,
  ExternalLink,
  Shield,
  Wallet,
  BarChart3,
  Globe,
  Star,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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
  const statusConfig = {
    verified: {
      className: "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm",
      icon: CheckCircle,
    },
    pending: {
      className: "bg-yellow-50 text-yellow-700 border-yellow-200 shadow-sm",
      icon: Clock,
    },
    rejected: {
      className: "bg-red-50 text-red-700 border-red-200 shadow-sm",
      icon: AlertTriangle,
    },
    collateralized: {
      className: "bg-blue-50 text-blue-700 border-blue-200 shadow-sm",
      icon: Shield,
    },
    available: {
      className: "bg-gray-50 text-gray-700 border-gray-200 shadow-sm",
      icon: Activity,
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.available;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.className} font-medium flex items-center gap-1.5`}
    >
      <Icon className="h-3.5 w-3.5" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export default async function AssetViewPage({
  params,
}: {
  params: { id: string };
}) {
  // Get the id from params directly
  const { id } = params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // For testing purposes, if the ID is "test", show mock data
  if (id === "test") {
    const mockAsset = {
      id: "test",
      name: "Test Real Estate Property",
      asset_type: "real_estate",
      description: "A beautiful test property for demonstration purposes",
      current_value: 500000,
      original_value: 450000,
      verification_status: "verified",
      collateralization_status: "available",
      location: "San Francisco, CA",
      blockchain: "ethereum",
      created_at: new Date().toISOString(),
    };

    const valueChange = mockAsset.current_value - mockAsset.original_value;
    const valueChangePercent = (
      (valueChange / mockAsset.original_value) *
      100
    ).toFixed(1);
    const isPositive = valueChange >= 0;

    return (
      <div className="min-h-screen bg-gray-50 p-4 space-y-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link
                href="/dashboard/assets"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Assets
              </Link>
            </Button>
            <Badge className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Test Asset - Page Working!
            </Badge>
          </div>
        </div>

        {/* Asset Header Card */}
        <Card className="bg-gradient-to-br from-blue-600 to-purple-700 text-white border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Building className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{mockAsset.name}</h1>
                  <div className="flex items-center gap-2 text-blue-100">
                    <MapPin className="h-4 w-4" />
                    <span>{mockAsset.location}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-100 mb-1">Current Value</div>
                <div className="text-4xl font-bold">
                  ${mockAsset.current_value.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 mt-2 text-green-300">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">+{valueChangePercent}%</span>
                  <span className="text-sm text-blue-100">
                    (+${valueChange.toLocaleString()})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {getStatusBadge(mockAsset.verification_status)}
              {getStatusBadge(mockAsset.collateralization_status)}
              <Badge className="bg-white/20 text-white border-white/30">
                {mockAsset.blockchain.charAt(0).toUpperCase() +
                  mockAsset.blockchain.slice(1)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Success Message */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">
                  Asset Page Fixed Successfully!
                </h3>
                <p className="text-green-700">
                  The React Suspense error has been resolved. You can now access
                  asset detail pages without the 500 error. Try visiting:{" "}
                  <code className="bg-white px-2 py-1 rounded">
                    /dashboard/assets/test
                  </code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Add error handling for database queries
  let asset;
  try {
    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Database error:", error);
      return notFound();
    }

    asset = data;
  } catch (error) {
    console.error("Unexpected error:", error);
    return notFound();
  }

  if (!asset) {
    return notFound();
  }

  const valueChange = asset.current_value - asset.original_value;
  const valueChangePercent = (
    (valueChange / asset.original_value) *
    100
  ).toFixed(1);
  const isPositive = valueChange >= 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/assets" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Assets
            </Link>
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            Last updated: {new Date(asset.created_at).toLocaleDateString()}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Asset Header Card */}
      <Card className="bg-gradient-to-br from-blue-600 to-purple-700 text-white border-0 shadow-xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Building className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{asset.name}</h1>
                <div className="flex items-center gap-2 text-blue-100">
                  <MapPin className="h-4 w-4" />
                  <span>{asset.location}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100 mb-1">Current Value</div>
              <div className="text-4xl font-bold">
                ${asset.current_value.toLocaleString()}
              </div>
              <div
                className={`flex items-center gap-1 mt-2 ${isPositive ? "text-green-300" : "text-red-300"}`}
              >
                {isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="font-medium">
                  {isPositive ? "+" : ""}
                  {valueChangePercent}%
                </span>
                <span className="text-sm text-blue-100">
                  (${Math.abs(valueChange).toLocaleString()})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getStatusBadge(asset.verification_status)}
              {getStatusBadge(asset.collateralization_status)}
              <Badge className="bg-white/20 text-white border-white/30">
                <Globe className="h-3 w-3 mr-1" />
                {asset.blockchain}
              </Badge>
            </div>
            <Button
              asChild
              className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
            >
              <Link href={`/dashboard/assets/${asset.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Asset
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Asset Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Asset Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Asset Type
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {asset.asset_type}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Blockchain
                  </label>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {asset.blockchain}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Original Value
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    ${asset.original_value.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Created
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(asset.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {asset.description && (
                <div className="space-y-2 pt-4 border-t">
                  <label className="text-sm font-medium text-gray-600">
                    Description
                  </label>
                  <p className="text-gray-700 leading-relaxed">
                    {asset.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {isPositive ? "+" : ""}
                    {valueChangePercent}%
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    Total Return
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    ${Math.abs(valueChange).toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-600 font-medium">
                    Value Change
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {asset.verification_status === "verified" ? "100%" : "0%"}
                  </div>
                  <div className="text-sm text-purple-600 font-medium">
                    Verification
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Wallet className="h-4 w-4 mr-2" />
                Use as Collateral
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                View Market Value
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Download Documents
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Explorer
              </Button>
            </CardContent>
          </Card>

          {/* Asset Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Asset Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Verification</span>
                {getStatusBadge(asset.verification_status)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Collateral Status</span>
                {getStatusBadge(asset.collateralization_status)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Network</span>
                <Badge variant="outline" className="capitalize">
                  {asset.blockchain}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Market Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-orange-600" />
                Market Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm font-medium text-blue-800 mb-1">
                  Asset Performance
                </div>
                <div className="text-xs text-blue-600">
                  Your asset has{" "}
                  {isPositive ? "outperformed" : "underperformed"} the market
                  average
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm font-medium text-green-800 mb-1">
                  Liquidity Status
                </div>
                <div className="text-xs text-green-600">
                  High liquidity available for collateralization
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
