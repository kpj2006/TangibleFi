"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  AlertTriangle,
  DollarSign,
  MapPin,
  FileText,
} from "lucide-react";

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
  submittedBy?: string;
  submittedDate?: string;
}

export default function AssetManagement() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [reviewComment, setReviewComment] = useState("");

  useEffect(() => {
    fetchAssets();
    // Set up real-time updates
    const interval = setInterval(fetchAssets, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await fetch("/api/admin/assets");
      if (response.ok) {
        const data = await response.json();
        setAssets(data);
      } else {
        // Mock data for development
        setAssets([
          {
            id: "1",
            name: "Luxury Apartment Downtown",
            asset_type: "Real Estate",
            original_value: 850000,
            user_id: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C8b",
            created_at: "2025-01-15T10:30:00Z",
            verification_status: "pending",
            location: "New York, NY",
            description: "Modern 2-bedroom apartment in downtown Manhattan",
            blockchain: "ethereum",
            documents: ["deed.pdf", "appraisal.pdf", "insurance.pdf"],
            riskScore: 2,
            collateralRatio: 75,
            submittedBy: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C8b",
            submittedDate: "Jan 15, 2025",
          },
          {
            id: "2",
            name: "Commercial Office Building",
            asset_type: "Commercial Real Estate",
            original_value: 2500000,
            user_id: "0x8ba1f109551bD432803012645Hac136c5c8b8b8b",
            created_at: "2025-01-14T14:20:00Z",
            verification_status: "under-review",
            location: "Los Angeles, CA",
            description: "5-story office building with retail ground floor",
            blockchain: "polygon",
            documents: [
              "title.pdf",
              "lease_agreements.pdf",
              "financial_statements.pdf",
            ],
            riskScore: 3,
            collateralRatio: 70,
            submittedBy: "0x8ba1f109551bD432803012645Hac136c5c8b8b8b",
            submittedDate: "Jan 14, 2025",
          },
          {
            id: "3",
            name: "Vintage Wine Collection",
            asset_type: "Collectibles",
            original_value: 125000,
            user_id: "0xa39643CF2F0B78107Ed786c8156C6de492Eec3c",
            created_at: "2025-01-13T09:15:00Z",
            verification_status: "approved",
            location: "Napa Valley, CA",
            description: "Rare vintage wine collection from 1990-2010",
            blockchain: "arbitrum",
            token_id: 1001,
            contract_address: "0x1234567890123456789012345678901234567890",
            documents: ["authentication.pdf", "storage_certificate.pdf"],
            riskScore: 4,
            collateralRatio: 60,
            submittedBy: "0xa39643CF2F0B78107Ed786c8156C6de492Eec3c",
            submittedDate: "Jan 13, 2025",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (assetId: string, approved: boolean) => {
    try {
      const response = await fetch(`/api/admin/assets/${assetId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          approved,
          comment: reviewComment,
        }),
      });

      if (response.ok) {
        // Update local state
        setAssets(
          assets.map((asset) =>
            asset.id === assetId
              ? {
                  ...asset,
                  verification_status: approved ? "approved" : "rejected",
                }
              : asset
          )
        );
        setReviewComment("");
        alert(`Asset ${approved ? "approved" : "rejected"} successfully`);
      } else {
        alert("Error processing approval");
      }
    } catch (error) {
      console.error("Error processing approval:", error);
      alert("Error processing approval");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "under-review":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 2) return "text-green-600";
    if (score <= 3) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.asset_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || asset.verification_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const counts = getAssetCounts();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Asset Management</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Asset Management</h1>
          <p className="text-gray-600 mt-1">
            Review and manage tokenized asset submissions
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {counts.total} Total Assets
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {counts.pending}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-blue-600">
                  {counts.underReview}
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {counts.approved}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {counts.rejected}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-purple-600">
                  $
                  {(
                    assets.reduce(
                      (sum, asset) => sum + asset.original_value,
                      0
                    ) / 1000000
                  ).toFixed(1)}
                  M
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under-review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-blue-600" />
              Assets ({filteredAssets.length})
            </CardTitle>
            <CardDescription>
              Click on an asset to review details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {filteredAssets.map((asset) => (
              <Card
                key={asset.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedAsset?.id === asset.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setSelectedAsset(asset)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {asset.name}
                    </h3>
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
                        className={`w-4 h-4 ${getRiskColor(asset.riskScore || 0)}`}
                      />
                      <span
                        className={`text-sm font-medium ${getRiskColor(asset.riskScore || 0)}`}
                      >
                        Risk: {asset.riskScore || 0}/5
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {asset.submittedDate}
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
                      {selectedAsset.submittedBy?.slice(0, 6)}...
                      {selectedAsset.submittedBy?.slice(-4)}
                    </p>
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
                {selectedAsset.verification_status === "pending" ||
                selectedAsset.verification_status === "under-review" ? (
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
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-gray-600">
                      Asset has been {selectedAsset.verification_status}
                    </p>
                  </div>
                )}
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
