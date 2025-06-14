"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileCheck,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  MapPin,
  FileText,
  Download,
  Eye,
  AlertTriangle,
  Calendar,
  User,
  Building,
  TrendingUp,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { web3Service } from "@/lib/web3/contracts";
import { ipfsService } from "@/lib/ipfs/service";
import { createClient } from "../../../supabase/client";

interface AssetApprovalSectionProps {
  onBack: () => void;
}

interface Asset {
  id: string;
  name: string;
  asset_type: string;
  original_value: number;
  user_id: string;
  created_at: string;
  verification_status: "pending" | "under-review" | "approved" | "rejected";
  location: string;
  description: string;
  blockchain: string;
  token_id?: number;
  contract_address?: string;
  metadata_uri?: string;
  ipfs_hash?: string;
  transaction_hash?: string;
  documents?: string[];
  riskScore?: number;
  collateralRatio?: number;
}

export default function AssetApprovalSection({
  onBack,
}: AssetApprovalSectionProps) {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [reviewComment, setReviewComment] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const supabase = createClient();

  // Fetch assets from database
  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error: any) {
      console.error("Error fetching assets:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Mock data - in production, this would come from your backend
  const pendingAssets: Asset[] = [
    {
      id: "ASSET-001",
      name: "Manhattan Commercial Property",
      asset_type: "Real Estate",
      original_value: 2500000,
      user_id: "0x742d35cc6cbf4532b4661e5f5e2c2d1b5a8f1234",
      created_at: "2025-01-15",
      verification_status: "pending",
      location: "New York, NY",
      description:
        "Prime commercial real estate in Manhattan's financial district",
      blockchain: "ethereum",
      documents: ["property_deed.pdf", "valuation_report.pdf", "insurance.pdf"],
      riskScore: 3.2,
      collateralRatio: 75,
    },
    {
      id: "ASSET-002",
      name: "Vintage Wine Collection",
      asset_type: "Collectibles",
      original_value: 150000,
      user_id: "0x1234567890abcdef1234567890abcdef12345678",
      created_at: "2025-01-14",
      verification_status: "under-review",
      location: "Bordeaux, France",
      description: "Rare vintage wine collection from prestigious vineyards",
      blockchain: "polygon",
      documents: [
        "wine_inventory.pdf",
        "authentication.pdf",
        "storage_proof.pdf",
      ],
      riskScore: 4.1,
      collateralRatio: 60,
    },
    {
      id: "ASSET-003",
      name: "Tesla Model S Collection",
      asset_type: "Vehicles",
      original_value: 320000,
      user_id: "0xabcdef1234567890abcdef1234567890abcdef12",
      created_at: "2025-01-13",
      verification_status: "pending",
      location: "California, USA",
      description: "Collection of Tesla Model S vehicles in mint condition",
      blockchain: "arbitrum",
      documents: [
        "vehicle_titles.pdf",
        "inspection_report.pdf",
        "insurance.pdf",
      ],
      riskScore: 2.8,
      collateralRatio: 70,
    },
  ];

  const filteredAssets =
    filterStatus === "all"
      ? assets
      : assets.filter((asset) => asset.verification_status === filterStatus);

  const handleApproval = async (assetId: string, approved: boolean) => {
    try {
      setApproving(assetId);
      setError(null);

      const asset = assets.find((a) => a.id === assetId);
      if (!asset) {
        throw new Error("Asset not found");
      }

      if (approved) {
        // If approving and no NFT exists yet, mint it
        if (!asset.token_id && asset.metadata_uri) {
          try {
            // Connect wallet first
            const adminAddress = await web3Service.connect();

            // Mint NFT for the asset owner
            const mintResult = await web3Service.mintAssetNFT(
              asset.user_id, // Assuming user_id is the wallet address
              asset.metadata_uri,
              asset.original_value.toString(),
              asset.blockchain
            );

            // Update asset with NFT details
            const { error: updateError } = await supabase
              .from("assets")
              .update({
                verification_status: "approved",
                token_id: mintResult.tokenId,
                contract_address: web3Service.getContractAddress(
                  asset.blockchain
                ),
                transaction_hash: mintResult.txHash,
              })
              .eq("id", assetId);

            if (updateError) throw updateError;

            // Update metadata to reflect approval
            if (asset.ipfs_hash) {
              await ipfsService.updateAssetMetadata(asset.ipfs_hash, {
                properties: {
                  verification_status: "approved",
                  token_id: mintResult.tokenId.toString(),
                  contract_address: web3Service.getContractAddress(
                    asset.blockchain
                  ),
                } as any,
              });
            }
          } catch (web3Error: any) {
            console.error("Web3 error:", web3Error);
            // Still update database even if NFT minting fails
            const { error: updateError } = await supabase
              .from("assets")
              .update({
                verification_status: "approved",
              })
              .eq("id", assetId);

            if (updateError) throw updateError;
          }
        } else {
          // Just update status if NFT already exists
          const { error: updateError } = await supabase
            .from("assets")
            .update({
              verification_status: "approved",
            })
            .eq("id", assetId);

          if (updateError) throw updateError;
        }
      } else {
        // Rejection - just update status
        const { error: updateError } = await supabase
          .from("assets")
          .update({
            verification_status: "rejected",
          })
          .eq("id", assetId);

        if (updateError) throw updateError;

        // Update metadata to reflect rejection
        if (asset.ipfs_hash) {
          await ipfsService.updateAssetMetadata(asset.ipfs_hash, {
            properties: {
              verification_status: "rejected",
              rejection_reason:
                reviewComment || "Asset did not meet verification requirements",
            } as any,
          });
        }
      }

      // Refresh assets list
      await fetchAssets();
      setSelectedAsset(null);
      setReviewComment("");
    } catch (error: any) {
      console.error("Approval error:", error);
      setError(error.message || "Failed to process approval");
    } finally {
      setApproving(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-0";
      case "under-review":
        return "bg-blue-100 text-blue-700 border-0";
      case "approved":
        return "bg-green-100 text-green-700 border-0";
      case "rejected":
        return "bg-red-100 text-red-700 border-0";
      default:
        return "bg-gray-100 text-gray-700 border-0";
    }
  };

  const getAssetCounts = () => {
    return {
      total: assets.length,
      pending: assets.filter((a) => a.verification_status === "pending").length,
      underReview: assets.filter(
        (a) => a.verification_status === "under-review"
      ).length,
      approved: assets.filter((a) => a.verification_status === "approved")
        .length,
      rejected: assets.filter((a) => a.verification_status === "rejected")
        .length,
    };
  };

  const getRiskColor = (score: number) => {
    if (score <= 2) return "text-green-600";
    if (score <= 3) return "text-yellow-600";
    if (score <= 4) return "text-orange-600";
    return "text-red-600";
  };

  const counts = getAssetCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading assets...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Asset Approval Management
          </h1>
          <p className="text-gray-600 mt-1">
            Review and approve RWA tokenization requests
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assets</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="under-review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">
                  Total Pending
                </p>
                <p className="text-3xl font-bold text-yellow-900">
                  {counts.pending}
                </p>
                <p className="text-sm text-yellow-600 mt-1">Awaiting review</p>
              </div>
              <div className="w-12 h-12 bg-yellow-200 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">
                  Total Value
                </p>
                <p className="text-3xl font-bold text-green-900">
                  $
                  {(
                    assets.reduce(
                      (sum, asset) => sum + asset.original_value,
                      0
                    ) / 1000000
                  ).toFixed(2)}
                  M
                </p>
                <p className="text-sm text-green-600 mt-1">Combined assets</p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">
                  Avg Risk Score
                </p>
                <p className="text-3xl font-bold text-orange-900">3.4</p>
                <p className="text-sm text-orange-600 mt-1">Out of 5.0</p>
              </div>
              <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Approved</p>
                <p className="text-3xl font-bold text-blue-900">
                  {counts.approved}
                </p>
                <p className="text-sm text-blue-600 mt-1">Ready for lending</p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Assets List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-600" />
              Pending Assets
            </CardTitle>
            <CardDescription>
              Click on an asset to review details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredAssets.map((asset) => (
              <Card
                key={asset.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-md ${
                  selectedAsset?.id === asset.id
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setSelectedAsset(asset)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {asset.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {asset.asset_type}
                      </p>
                    </div>
                    <Badge
                      className={getStatusColor(asset.verification_status)}
                    >
                      {asset.verification_status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">
                        ${asset.original_value?.toLocaleString() || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-700">{asset.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle
                        className={`w-4 w-4 ${getRiskColor(asset.riskScore || 0)}`}
                      />
                      <span
                        className={`text-sm font-medium ${getRiskColor(asset.riskScore || 0)}`}
                      >
                        Risk: {asset.riskScore || 0}/5
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {asset.created_at}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Asset Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Asset Review
            </CardTitle>
            <CardDescription>
              {selectedAsset
                ? "Review asset details and make approval decision"
                : "Select an asset to review"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedAsset ? (
              <div className="space-y-6">
                {/* Asset Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {selectedAsset.name}
                    </h3>
                    <p className="text-gray-600">{selectedAsset.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Asset Type
                      </label>
                      <p className="text-gray-900 font-medium">
                        {selectedAsset.asset_type}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Estimated Value
                      </label>
                      <p className="text-gray-900 font-medium">
                        $
                        {selectedAsset.original_value?.toLocaleString() ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Location
                      </label>
                      <p className="text-gray-900 font-medium">
                        {selectedAsset.location}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Collateral Ratio
                      </label>
                      <p className="text-gray-900 font-medium">
                        {selectedAsset.collateralRatio}%
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Submitted By
                    </label>
                    <p className="text-gray-900 font-medium font-mono text-sm">
                      {selectedAsset.user_id.slice(0, 6)}...
                      {selectedAsset.user_id.slice(-4)}
                    </p>
                  </div>
                </div>

                {/* Verification Status */}
                <Alert className="bg-blue-50 border-blue-200">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Verification Status:</strong>{" "}
                    {selectedAsset.verification_status}
                  </AlertDescription>
                </Alert>

                {/* Risk Assessment */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-gray-900 font-semibold mb-2">
                    Risk Assessment
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Risk Score</span>
                    <span
                      className={`font-bold ${getRiskColor(selectedAsset.riskScore || 0)}`}
                    >
                      {selectedAsset.riskScore || 0}/5.0
                    </span>
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h4 className="text-gray-900 font-semibold mb-3">
                    Supporting Documents
                  </h4>
                  <div className="space-y-2">
                    {selectedAsset.documents?.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-900 text-sm">{doc}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review Comments */}
                <div>
                  <label className="text-gray-900 font-semibold mb-2 block">
                    Review Comments
                  </label>
                  <Textarea
                    placeholder="Add your review comments here..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    onClick={() => handleApproval(selectedAsset.id, true)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Asset
                  </Button>
                  <Button
                    onClick={() => handleApproval(selectedAsset.id, false)}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Asset
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Select an asset from the list to begin review
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
