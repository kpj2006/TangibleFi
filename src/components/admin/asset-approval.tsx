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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileCheck,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  MapPin,
  FileText,
  Eye,
  AlertTriangle,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { AdminAsset } from "@/hooks/useAdmin"; // Import the type from our centralized hook

// Define the props this component will receive from its parent (e.g., AdminDashboard)
interface AssetApprovalProps {
  assets: AdminAsset[];
  onApprove: (asset: AdminAsset) => void;
  onReject: (assetId: string, reason: string) => void;
  isProcessing: boolean;
  isLoading: boolean;
  error: string | null;
}

export default function AssetApprovalSection({
  assets,
  onApprove,
  onReject,
  isProcessing,
  isLoading,
  error,
}: AssetApprovalProps) {
  const [selectedAsset, setSelectedAsset] = useState<AdminAsset | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const [reviewComment, setReviewComment] = useState("");
  // Local state to track which specific button is clicked for the spinner
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);

  // Update selected asset when assets list changes (for real-time updates)
  useEffect(() => {
    if (selectedAsset) {
      const updatedAsset = assets.find(
        (asset) => asset.id === selectedAsset.id
      );
      if (
        updatedAsset &&
        updatedAsset.verificationStatus !== selectedAsset.verificationStatus
      ) {
        setSelectedAsset(updatedAsset);
      }
    }
  }, [assets, selectedAsset]);

  const handleApproveClick = async (asset: AdminAsset) => {
    setCurrentItemId(asset.id);
    try {
      await onApprove(asset);
      // Clear selection after successful action to force UI refresh
      setSelectedAsset(null);
      // Clear the current item ID
      setCurrentItemId(null);
    } catch (error) {
      console.error("Approval failed:", error);
      setCurrentItemId(null);
    }
  };

  const handleRejectClick = async (asset: AdminAsset) => {
    setCurrentItemId(asset.id);
    try {
      await onReject(asset.id, reviewComment);
      // Clear selection after successful action to force UI refresh
      setSelectedAsset(null);
      // Clear review comment
      setReviewComment("");
      // Clear the current item ID
      setCurrentItemId(null);
    } catch (error) {
      console.error("Rejection failed:", error);
      setCurrentItemId(null);
    }
  };

  // Filter the assets received from props
  const filteredAssets =
    filterStatus === "all"
      ? assets
      : assets.filter((asset) => asset.verificationStatus === filterStatus);

  // Helper functions for styling
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-0";
      case "under-review":
        return "bg-blue-100 text-blue-700 border-0";
      case "minted":
        return "bg-green-100 text-green-700 border-0";
      case "verified":
        return "bg-emerald-100 text-emerald-700 border-0";
      case "verified_pending_wallet":
        return "bg-orange-100 text-orange-700 border-0";
      case "verified_pending_admin":
        return "bg-purple-100 text-purple-700 border-0";
      case "rejected":
        return "bg-red-100 text-red-700 border-0";
      default:
        return "bg-gray-100 text-gray-700 border-0";
    }
  };

  const getRiskColor = (score: number = 0) => {
    if (score <= 2) return "text-green-600";
    if (score <= 3) return "text-yellow-600";
    if (score <= 4) return "text-orange-600";
    return "text-red-600";
  };

  const getAssetCounts = () => {
    return {
      total: assets.length,
      pending: assets.filter((a) => a.verificationStatus === "pending").length,
      approved: assets.filter(
        (a) =>
          a.verificationStatus === "minted" ||
          a.verificationStatus === "verified" ||
          a.verificationStatus === "verified_pending_wallet" ||
          a.verificationStatus === "verified_pending_admin"
      ).length,
      rejected: assets.filter((a) => a.verificationStatus === "rejected")
        .length,
      minted: assets.filter((a) => a.verificationStatus === "minted").length,
      totalValue: assets
        .filter((a) => a.verificationStatus === "minted")
        .reduce((sum, asset) => sum + asset.original_value, 0),
    };
  };

  const counts = getAssetCounts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading assets...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-white rounded-xl shadow-lg">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
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
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assets</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="minted">Minted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Assets
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {counts.total}
                </p>
                <p className="text-xs text-gray-500 mt-1">All submissions</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Review
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {counts.pending}
                </p>
                <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Successfully Minted
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {counts.minted}
                </p>
                <p className="text-xs text-gray-500 mt-1">NFTs created</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Value Minted
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  ${counts.totalValue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">USD value locked</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Approved (All)
                </p>
                <p className="text-lg font-bold text-emerald-600">
                  {counts.approved}
                </p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700">
                {counts.total > 0
                  ? Math.round((counts.approved / counts.total) * 100)
                  : 0}
                %
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-lg font-bold text-red-600">
                  {counts.rejected}
                </p>
              </div>
              <Badge className="bg-red-100 text-red-700">
                {counts.total > 0
                  ? Math.round((counts.rejected / counts.total) * 100)
                  : 0}
                %
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Success Rate
                </p>
                <p className="text-lg font-bold text-blue-600">
                  {counts.total > 0
                    ? Math.round((counts.minted / counts.total) * 100)
                    : 0}
                  %
                </p>
              </div>
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Assets List */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Queue</CardTitle>
            <CardDescription>
              Click an asset to review its details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto p-4">
            {filteredAssets.length > 0 ? (
              filteredAssets.map((asset) => (
                <Card
                  key={asset.id}
                  className={`cursor-pointer transition-all ${selectedAsset?.id === asset.id ? "ring-2 ring-blue-500" : "hover:bg-gray-50"}`}
                  onClick={() => setSelectedAsset(asset)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{asset.name}</h3>
                      <Badge
                        className={getStatusColor(asset.verificationStatus)}
                      >
                        {asset.verificationStatus}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      Value: ${asset.original_value.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                No assets match the current filter.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Asset Details View */}
        <Card>
          <CardHeader>
            <CardTitle>Review Details</CardTitle>
            <CardDescription>
              {selectedAsset
                ? "Approve or reject this asset."
                : "Select an asset to view details."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedAsset ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold">{selectedAsset.name}</h3>
                  <p className="text-gray-600 mt-1">
                    {selectedAsset.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-500">Asset Type</Label>
                    <p className="font-medium">{selectedAsset.type}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Est. Value</Label>
                    <p className="font-medium">
                      ${selectedAsset.original_value.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Collateral Ratio</Label>
                    <p className="font-medium">
                      {selectedAsset.collateralRatio || "N/A"}%
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Risk Score</Label>
                    <p
                      className={`font-medium ${getRiskColor(selectedAsset.riskScore)}`}
                    >
                      {selectedAsset.riskScore || "N/A"}/5.0
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">
                    Documents & Metadata
                  </h4>
                  <div className="space-y-2">
                    {selectedAsset.documents?.metadata_uri ? (
                      <a
                        href={selectedAsset.documents.metadata_uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        <FileText className="h-4 w-4" /> View Full Metadata
                      </a>
                    ) : selectedAsset.documents?.ipfs_hash ? (
                      <a
                        href={`https://ipfs.io/ipfs/${selectedAsset.documents.ipfs_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        <FileText className="h-4 w-4" /> View IPFS Metadata
                      </a>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No metadata available
                      </p>
                    )}
                    <div className="text-xs text-gray-400">
                      {selectedAsset.documents?.ipfs_hash && (
                        <span>
                          IPFS Hash:{" "}
                          {selectedAsset.documents.ipfs_hash.substring(0, 20)}
                          ...
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="review-comments"
                    className="font-semibold text-sm mb-2 block"
                  >
                    Review Comments
                  </Label>
                  <Textarea
                    id="review-comments"
                    placeholder="Add rejection reason (if applicable)..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                </div>

                {selectedAsset.verificationStatus === "pending" && (
                  <div className="flex gap-4 pt-4 border-t">
                    <Button
                      onClick={() => handleApproveClick(selectedAsset)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={
                        isProcessing && currentItemId === selectedAsset.id
                      }
                    >
                      {isProcessing && currentItemId === selectedAsset.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Approve & Mint
                    </Button>
                    <Button
                      onClick={() => handleRejectClick(selectedAsset)}
                      variant="destructive"
                      className="flex-1"
                      disabled={
                        isProcessing && currentItemId === selectedAsset.id
                      }
                    >
                      {isProcessing && currentItemId === selectedAsset.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      Reject
                    </Button>
                  </div>
                )}

                {selectedAsset.verificationStatus === "under-review" && (
                  <div className="pt-4 border-t">
                    <Alert className="border-blue-200 bg-blue-50">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        <div className="font-semibold">
                          🔄 Processing Asset Approval...
                        </div>
                        <div className="text-sm mt-1">
                          This asset is currently being processed for minting.
                          Please wait...
                        </div>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {selectedAsset.verificationStatus === "minted" && (
                  <div className="pt-4 border-t">
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <div className="font-semibold">
                          ✅ Asset Successfully Minted!
                        </div>
                        <div className="text-sm mt-1">
                          This asset has been approved and minted as an NFT. The
                          tokenization process is complete.
                        </div>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {selectedAsset.verificationStatus === "rejected" && (
                  <div className="pt-4 border-t">
                    <Alert className="border-red-200 bg-red-50">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        <div className="font-semibold">❌ Asset Rejected</div>
                        <div className="text-sm mt-1">
                          This asset has been rejected and will not be
                          tokenized.
                        </div>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileCheck className="w-12 h-12 mx-auto mb-2" />
                <p>Select an asset to begin review.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
