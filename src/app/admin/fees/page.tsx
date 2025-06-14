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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  TrendingUp,
  Settings,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Percent,
} from "lucide-react";

interface FeeStructure {
  id: string;
  name: string;
  type: "percentage" | "fixed";
  value: number;
  minAmount?: number;
  maxAmount?: number;
  blockchain: string;
  isActive: boolean;
  lastUpdated: string;
  description: string;
}

interface FeeStats {
  totalCollected: number;
  monthlyRevenue: number;
  averageFee: number;
  transactionCount: number;
  topFeeType: string;
}

export default function FeeManagement() {
  const [fees, setFees] = useState<FeeStructure[]>([]);
  const [feeStats, setFeeStats] = useState<FeeStats | null>(null);
  const [selectedFee, setSelectedFee] = useState<FeeStructure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    type: "percentage" as "percentage" | "fixed",
    value: 0,
    minAmount: 0,
    maxAmount: 0,
    blockchain: "ethereum",
    description: "",
  });

  useEffect(() => {
    fetchFeeData();
    fetchFeeStats();
    // Set up real-time updates
    const interval = setInterval(() => {
      fetchFeeData();
      fetchFeeStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchFeeData = async () => {
    try {
      const response = await fetch("/api/admin/fees");
      if (response.ok) {
        const data = await response.json();
        setFees(data);
      } else {
        // Mock data for development
        setFees([
          {
            id: "1",
            name: "Platform Fee",
            type: "percentage",
            value: 2.5,
            blockchain: "ethereum",
            isActive: true,
            lastUpdated: "2025-01-15T10:30:00Z",
            description: "Standard platform fee for asset tokenization",
          },
          {
            id: "2",
            name: "Transaction Fee",
            type: "fixed",
            value: 0.001,
            blockchain: "ethereum",
            isActive: true,
            lastUpdated: "2025-01-14T14:20:00Z",
            description: "Fixed fee per transaction",
          },
          {
            id: "3",
            name: "Polygon Platform Fee",
            type: "percentage",
            value: 1.5,
            blockchain: "polygon",
            isActive: true,
            lastUpdated: "2025-01-13T09:15:00Z",
            description: "Reduced platform fee for Polygon network",
          },
          {
            id: "4",
            name: "Premium Service Fee",
            type: "percentage",
            value: 5.0,
            minAmount: 1000,
            maxAmount: 50000,
            blockchain: "ethereum",
            isActive: false,
            lastUpdated: "2025-01-12T16:45:00Z",
            description: "Premium service fee with limits",
          },
          {
            id: "5",
            name: "Arbitrum Gas Fee",
            type: "fixed",
            value: 0.0005,
            blockchain: "arbitrum",
            isActive: true,
            lastUpdated: "2025-01-11T11:20:00Z",
            description: "Gas fee for Arbitrum transactions",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching fees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeeStats = async () => {
    try {
      const response = await fetch("/api/admin/fees/stats");
      if (response.ok) {
        const data = await response.json();
        setFeeStats(data);
      } else {
        // Mock data
        setFeeStats({
          totalCollected: 1250000,
          monthlyRevenue: 185000,
          averageFee: 125.5,
          transactionCount: 8947,
          topFeeType: "Platform Fee",
        });
      }
    } catch (error) {
      console.error("Error fetching fee stats:", error);
    }
  };

  const handleFeeUpdate = async (
    feeId: string,
    updates: Partial<FeeStructure>
  ) => {
    try {
      const response = await fetch(`/api/admin/fees/${feeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        // Update local state
        setFees(
          fees.map((fee) =>
            fee.id === feeId
              ? { ...fee, ...updates, lastUpdated: new Date().toISOString() }
              : fee
          )
        );
        setIsEditing(false);
        alert("Fee updated successfully");
      } else {
        alert("Error updating fee");
      }
    } catch (error) {
      console.error("Error updating fee:", error);
      alert("Error updating fee");
    }
  };

  const handleToggleFee = async (feeId: string) => {
    const fee = fees.find((f) => f.id === feeId);
    if (fee) {
      await handleFeeUpdate(feeId, { isActive: !fee.isActive });
    }
  };

  const handleSaveEdit = () => {
    if (selectedFee) {
      handleFeeUpdate(selectedFee.id, editForm);
    }
  };

  const startEdit = (fee: FeeStructure) => {
    setSelectedFee(fee);
    setEditForm({
      name: fee.name,
      type: fee.type,
      value: fee.value,
      minAmount: fee.minAmount || 0,
      maxAmount: fee.maxAmount || 0,
      blockchain: fee.blockchain,
      description: fee.description,
    });
    setIsEditing(true);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getBlockchainColor = (blockchain: string) => {
    switch (blockchain) {
      case "ethereum":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "polygon":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "arbitrum":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <div className="space-y-8 p-6">
          <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-white/60 rounded-lg shadow-sm"></div>
            <div className="h-64 bg-white/60 rounded-lg shadow-sm"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 animate-fadeIn">
      <div className="space-y-8 p-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
            <p className="text-gray-600 mt-1">
              Configure and monitor platform fee structures across all networks
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              {fees.filter((f) => f.isActive).length} Active Fees
            </Badge>
            <Badge
              variant="outline"
              className="bg-emerald-50 text-emerald-700 border-emerald-200"
            >
              Multi-Chain Ready
            </Badge>
          </div>
        </div>

        {/* Fee Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {feeStats && (
            <>
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Collected
                      </p>
                      <p className="text-3xl font-bold text-emerald-600">
                        ${(feeStats.totalCollected / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50">
                      <DollarSign className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Monthly Revenue
                      </p>
                      <p className="text-3xl font-bold text-blue-600">
                        ${(feeStats.monthlyRevenue / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Average Fee
                      </p>
                      <p className="text-3xl font-bold text-purple-600">
                        ${feeStats.averageFee.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-50">
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Transactions
                      </p>
                      <p className="text-3xl font-bold text-orange-600">
                        {feeStats.transactionCount.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-orange-50">
                      <RefreshCw className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Top Fee Type
                      </p>
                      <p className="text-lg font-bold text-indigo-600">
                        {feeStats.topFeeType}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-indigo-50">
                      <Percent className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Fee Management Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Fee List */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-xl">
                <DollarSign className="h-6 w-6 text-blue-600" />
                Fee Structures
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200 ml-2"
                >
                  LIVE
                </Badge>
              </CardTitle>
              <CardDescription>
                Click on a fee to edit configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {fees.map((fee) => (
                <Card
                  key={fee.id}
                  className={`cursor-pointer transition-all hover:shadow-lg border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 ${
                    selectedFee?.id === fee.id
                      ? "ring-2 ring-blue-500 shadow-lg"
                      : ""
                  }`}
                  onClick={() => setSelectedFee(fee)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {fee.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {fee.description}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Badge
                          className={`${getStatusColor(fee.isActive)} border`}
                        >
                          {fee.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge
                          className={`${getBlockchainColor(fee.blockchain)} border`}
                        >
                          {fee.blockchain}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <span className="ml-1 font-medium text-gray-900 capitalize">
                          {fee.type}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Value:</span>
                        <span className="ml-1 font-medium text-gray-900">
                          {fee.type === "percentage"
                            ? `${fee.value}%`
                            : `${fee.value} ETH`}
                        </span>
                      </div>
                      {fee.minAmount && (
                        <div>
                          <span className="text-gray-500">Min:</span>
                          <span className="ml-1 font-medium text-gray-900">
                            ${fee.minAmount}
                          </span>
                        </div>
                      )}
                      {fee.maxAmount && (
                        <div>
                          <span className="text-gray-500">Max:</span>
                          <span className="ml-1 font-medium text-gray-900">
                            ${fee.maxAmount}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-500">
                        Updated:{" "}
                        {new Date(fee.lastUpdated).toLocaleDateString()}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFee(fee.id);
                        }}
                        className="border-gray-200 hover:bg-gray-50"
                      >
                        {fee.isActive ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Fee Editor */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Settings className="w-6 h-6 text-emerald-600" />
                Fee Configuration
              </CardTitle>
              <CardDescription>
                {selectedFee
                  ? "Edit selected fee structure"
                  : "Select a fee to configure"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {selectedFee ? (
                <div className="space-y-6">
                  {!isEditing ? (
                    // View Mode
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {selectedFee.name}
                        </h3>
                        <p className="text-gray-600">
                          {selectedFee.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Fee Type
                          </label>
                          <p className="text-gray-900 font-medium capitalize">
                            {selectedFee.type}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Fee Value
                          </label>
                          <p className="text-gray-900 font-medium">
                            {selectedFee.type === "percentage"
                              ? `${selectedFee.value}%`
                              : `${selectedFee.value} ETH`}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Blockchain
                          </label>
                          <p className="text-gray-900 font-medium capitalize">
                            {selectedFee.blockchain}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Status
                          </label>
                          <div className="mt-1">
                            <Badge
                              className={`${getStatusColor(selectedFee.isActive)} border`}
                            >
                              {selectedFee.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                        {selectedFee.minAmount && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Minimum Amount
                            </label>
                            <p className="text-gray-900 font-medium">
                              ${selectedFee.minAmount}
                            </p>
                          </div>
                        )}
                        {selectedFee.maxAmount && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Maximum Amount
                            </label>
                            <p className="text-gray-900 font-medium">
                              ${selectedFee.maxAmount}
                            </p>
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={() => startEdit(selectedFee)}
                        className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md transition-all"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Fee Structure
                      </Button>
                    </div>
                  ) : (
                    // Edit Mode
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Fee Name</Label>
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              description: e.target.value,
                            })
                          }
                          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="type">Fee Type</Label>
                          <Select
                            value={editForm.type}
                            onValueChange={(value: "percentage" | "fixed") =>
                              setEditForm({ ...editForm, type: value })
                            }
                          >
                            <SelectTrigger className="border-gray-200 focus:border-blue-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">
                                Percentage
                              </SelectItem>
                              <SelectItem value="fixed">
                                Fixed Amount
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="value">
                            Fee Value{" "}
                            {editForm.type === "percentage" ? "(%)" : "(ETH)"}
                          </Label>
                          <Input
                            id="value"
                            type="number"
                            step="0.001"
                            value={editForm.value}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                value: parseFloat(e.target.value),
                              })
                            }
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="blockchain">Blockchain</Label>
                        <Select
                          value={editForm.blockchain}
                          onValueChange={(value) =>
                            setEditForm({ ...editForm, blockchain: value })
                          }
                        >
                          <SelectTrigger className="border-gray-200 focus:border-blue-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ethereum">Ethereum</SelectItem>
                            <SelectItem value="polygon">Polygon</SelectItem>
                            <SelectItem value="arbitrum">Arbitrum</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="minAmount">Minimum Amount ($)</Label>
                          <Input
                            id="minAmount"
                            type="number"
                            value={editForm.minAmount}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                minAmount: parseFloat(e.target.value),
                              })
                            }
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          />
                        </div>
                        <div>
                          <Label htmlFor="maxAmount">Maximum Amount ($)</Label>
                          <Input
                            id="maxAmount"
                            type="number"
                            value={editForm.maxAmount}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                maxAmount: parseFloat(e.target.value),
                              })
                            }
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button
                          onClick={handleSaveEdit}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-sm hover:shadow-md transition-all"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button
                          onClick={() => setIsEditing(false)}
                          variant="outline"
                          className="flex-1 border-gray-200 hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Select a fee structure from the list to configure
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
