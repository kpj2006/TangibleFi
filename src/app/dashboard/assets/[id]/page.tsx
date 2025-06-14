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

export default async function AssetViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: asset, error } = await supabase
    .from("assets")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !asset) {
    return notFound();
  }

  const valueChange = asset.current_value - asset.original_value;
  const valueChangePercent = (
    (valueChange / asset.original_value) *
    100
  ).toFixed(1);
  const isPositive = valueChange >= 0;

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 animate-fadeIn">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Enhanced Header */}
          <div className="mb-8 animate-slideDown">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Link
                  href="/dashboard/assets"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Assets
                </Link>
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  Last updated:{" "}
                  {new Date(asset.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Badge
                  variant="outline"
                  className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                >
                  NFT
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs bg-blue-50 text-blue-700 border-blue-200 capitalize"
                >
                  {asset.blockchain}
                </Badge>
              </div>
              <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                {asset.name}
              </h1>
              <p className="text-xl text-muted-foreground flex items-center justify-center gap-2">
                <MapPin className="h-5 w-5" />
                {asset.location}
              </p>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-blue-200 text-blue-700 hover:bg-blue-50 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Link href={`/dashboard/assets/${asset.id}/edit`}>
                  <Edit className="h-5 w-5 mr-2" />
                  Edit Asset
                </Link>
              </Button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 animate-slideUp">
            {/* Main Content - Takes 3 columns */}
            <div className="xl:col-span-3 space-y-8">
              {/* Asset Overview */}
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Building className="h-6 w-6 text-white" />
                    </div>
                    Asset Overview
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Comprehensive details about your tokenized real-world asset
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-200">
                      <h3 className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Asset Type
                      </h3>
                      <p className="text-xl font-bold text-gray-900">
                        {asset.asset_type}
                      </p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-200">
                      <h3 className="text-sm font-semibold text-purple-600 mb-3 uppercase tracking-wide flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Blockchain
                      </h3>
                      <p className="text-xl font-bold text-gray-900 capitalize">
                        {asset.blockchain}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {asset.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-gray-500 pt-4 border-t border-gray-100">
                    <Calendar className="h-5 w-5" />
                    <span className="text-base">
                      Added{" "}
                      {new Date(asset.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Valuation */}
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-emerald-50/50 to-green-50/50">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    Valuation
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Current market value and performance tracking
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                      <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-emerald-600 mb-3 uppercase tracking-wide">
                        Current Value
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mb-2">
                        ${asset.current_value.toLocaleString()}
                      </p>
                      <div className="flex items-center justify-center gap-1 text-emerald-600">
                        <Activity className="h-4 w-4" />
                        <span className="text-sm font-medium">Live Value</span>
                      </div>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                      <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                        <Building className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                        Original Value
                      </p>
                      <p className="text-3xl font-bold text-gray-700 mb-2">
                        ${asset.original_value.toLocaleString()}
                      </p>
                      <span className="text-sm text-gray-500">
                        Initial Investment
                      </span>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md ${
                          isPositive ? "bg-emerald-600" : "bg-red-600"
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="h-6 w-6 text-white" />
                        ) : (
                          <TrendingDown className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <p className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">
                        Change
                      </p>
                      <div
                        className={`mb-2 ${isPositive ? "text-emerald-600" : "text-red-600"}`}
                      >
                        <span className="text-3xl font-bold">
                          {isPositive ? "+" : ""}${valueChange.toLocaleString()}
                        </span>
                      </div>
                      <span
                        className={`text-sm font-medium ${isPositive ? "text-emerald-600" : "text-red-600"}`}
                      >
                        ({valueChangePercent}%)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Takes 1 column */}
            <div className="xl:col-span-1 space-y-6">
              {/* Status */}
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                      Verification Status
                    </p>
                    {getStatusBadge(asset.verification_status)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                      Collateralization Status
                    </p>
                    {getStatusBadge(asset.collateralization_status)}
                  </div>
                </CardContent>
              </Card>

              {/* Available Actions */}
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Wallet className="h-5 w-5 text-emerald-600" />
                    Available Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  {asset.verification_status === "verified" &&
                    asset.collateralization_status === "available" && (
                      <Button
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md"
                        size="lg"
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        Use as Collateral
                      </Button>
                    )}

                  {asset.collateralization_status === "collateralized" && (
                    <Button className="w-full" variant="outline" size="lg">
                      <Eye className="h-4 w-4 mr-2" />
                      View Loan Details
                    </Button>
                  )}

                  <Button className="w-full" variant="outline" size="lg">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Request Revaluation
                  </Button>

                  <Button className="w-full" variant="outline" size="lg">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              {/* Asset Details */}
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-gray-600" />
                    Asset Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground font-medium">
                        Asset ID
                      </span>
                      <span
                        className="font-mono text-xs bg-gray-100 px-2 py-1 rounded max-w-32 truncate"
                        title={asset.id}
                      >
                        {asset.id.slice(-12)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground font-medium">
                        Network
                      </span>
                      <span className="capitalize font-semibold">
                        {asset.blockchain}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground font-medium">
                        Created
                      </span>
                      <span className="font-semibold">
                        {new Date(asset.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Help & Support */}
              <Card className="border border-blue-200 shadow-lg bg-gradient-to-br from-blue-50/80 to-purple-50/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold mb-3 text-gray-900">
                    Need Assistance?
                  </h3>
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    Our support team can help with asset management and lending
                    options.
                  </p>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
