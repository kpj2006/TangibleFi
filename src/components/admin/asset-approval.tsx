"use client";

import { useState } from "react";
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

  const handleApproveClick = (asset: AdminAsset) => {
    setCurrentItemId(asset.id);
    onApprove(asset);
  };

  const handleRejectClick = (asset: AdminAsset) => {
    setCurrentItemId(asset.id);
    onReject(asset.id, reviewComment);
  }

  // Filter the assets received from props
  const filteredAssets =
    filterStatus === "all"
      ? assets
      : assets.filter((asset) => asset.verificationStatus === filterStatus);

  // Helper functions for styling
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-700 border-0";
      case "under-review": return "bg-blue-100 text-blue-700 border-0";
      case "minted":
      case "verified":
        return "bg-green-100 text-green-700 border-0";
      case "rejected": return "bg-red-100 text-red-700 border-0";
      default: return "bg-gray-100 text-gray-700 border-0";
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
      approved: assets.filter((a) => a.verificationStatus === "minted" || a.verificationStatus === "verified").length,
      rejected: assets.filter((a) => a.verificationStatus === "rejected").length,
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
          <h1 className="text-3xl font-bold text-gray-900">Asset Approval Management</h1>
          <p className="text-gray-600 mt-1">Review and approve RWA tokenization requests</p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assets</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="minted">Minted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* ... your summary cards are correct, no changes needed ... */}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Assets List */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Queue</CardTitle>
            <CardDescription>Click an asset to review its details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto p-4">
            {filteredAssets.length > 0 ? filteredAssets.map((asset) => (
              <Card
                key={asset.id}
                className={`cursor-pointer transition-all ${selectedAsset?.id === asset.id ? "ring-2 ring-blue-500" : "hover:bg-gray-50"}`}
                onClick={() => setSelectedAsset(asset)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{asset.name}</h3>
                    <Badge className={getStatusColor(asset.verificationStatus)}>{asset.verificationStatus}</Badge>
                  </div>
                  <div className="text-sm text-gray-500">Value: ${asset.original_value.toLocaleString()}</div>
                </CardContent>
              </Card>
            )) : <p className="text-center text-gray-500 py-8">No assets match the current filter.</p>}
          </CardContent>
        </Card>

        {/* Asset Details View */}
        <Card>
          <CardHeader>
            <CardTitle>Review Details</CardTitle>
            <CardDescription>{selectedAsset ? "Approve or reject this asset." : "Select an asset to view details."}</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedAsset ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold">{selectedAsset.name}</h3>
                  <p className="text-gray-600 mt-1">{selectedAsset.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-500">Asset Type</Label>
                    <p className="font-medium">{selectedAsset.type}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Est. Value</Label>
                    <p className="font-medium">${selectedAsset.original_value.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Collateral Ratio</Label>
                    <p className="font-medium">{selectedAsset.collateralRatio || 'N/A'}%</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Risk Score</Label>
                    <p className={`font-medium ${getRiskColor(selectedAsset.riskScore)}`}>{selectedAsset.riskScore || 'N/A'}/5.0</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Documents</h4>
                  <a href={selectedAsset.documents.metadata_uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                    <FileText className="h-4 w-4" /> View Full Metadata
                  </a>
                </div>

                <div>
                  <Label htmlFor="review-comments" className="font-semibold text-sm mb-2 block">Review Comments</Label>
                  <Textarea
                    id="review-comments"
                    placeholder="Add rejection reason (if applicable)..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                </div>

                {selectedAsset.verificationStatus === 'pending' && (
                  <div className="flex gap-4 pt-4 border-t">
                    <Button
                      onClick={() => handleApproveClick(selectedAsset)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={isProcessing && currentItemId === selectedAsset.id}
                    >
                      {isProcessing && currentItemId === selectedAsset.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                      Approve & Mint
                    </Button>
                    <Button
                      onClick={() => handleRejectClick(selectedAsset)}
                      variant="destructive"
                      className="flex-1"
                      disabled={isProcessing && currentItemId === selectedAsset.id}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
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