"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Settings,
  Users,
  Building2,
  BarChart3,
  Calendar,
  Wallet,
} from "lucide-react";

interface FeeManagementSectionProps {
  onBack: () => void;
}

export default function FeeManagementSection({
  onBack,
}: FeeManagementSectionProps) {
  const [selectedFeeType, setSelectedFeeType] = useState("management");

  const feeStructures = [
    {
      id: "management",
      name: "Management Fee",
      rate: "0.5%",
      type: "Annual",
      revenue: "$14.8K",
      description: "Annual fee for vault management services",
      appliesTo: "All vaults",
      lastUpdated: "2025-01-15",
      status: "active",
    },
    {
      id: "performance",
      name: "Performance Fee",
      rate: "10%",
      type: "On profits",
      revenue: "$85.2K",
      description: "Fee on vault performance above benchmark",
      appliesTo: "Premium vaults",
      lastUpdated: "2025-01-12",
      status: "active",
    },
    {
      id: "withdrawal",
      name: "Withdrawal Fee",
      rate: "0.25%",
      type: "Per transaction",
      revenue: "$12.4K",
      description: "Fee for early withdrawal from vaults",
      appliesTo: "Early withdrawals",
      lastUpdated: "2025-01-10",
      status: "active",
    },
    {
      id: "tokenization",
      name: "Tokenization Fee",
      rate: "2%",
      type: "One-time",
      revenue: "$156.8K",
      description: "Fee for asset tokenization process",
      appliesTo: "New assets",
      lastUpdated: "2025-01-08",
      status: "active",
    },
  ];

  const revenueMetrics = {
    totalRevenue: "$269.2K",
    monthlyGrowth: "+15.2%",
    averageFee: "$1,847",
    totalTransactions: 146,
  };

  const feeBreakdown = [
    {
      type: "Tokenization",
      amount: 156800,
      percentage: 58.2,
      color: "bg-blue-500",
    },
    {
      type: "Performance",
      amount: 85200,
      percentage: 31.6,
      color: "bg-green-500",
    },
    {
      type: "Management",
      amount: 14800,
      percentage: 5.5,
      color: "bg-purple-500",
    },
    {
      type: "Withdrawal",
      amount: 12400,
      percentage: 4.6,
      color: "bg-orange-500",
    },
  ];

  const vaultManagers = [
    {
      id: 1,
      name: "Premium Real Estate Vault",
      manager: "0x742d35cc6cbf4532b4661e5f5e2c2d1b5a8f1234",
      tvl: "$1.2M",
      managementFee: "0.5%",
      performanceFee: "10%",
      revenue: "$18.4K",
      status: "active",
    },
    {
      id: 2,
      name: "Commodities Index Vault",
      manager: "0x1234567890abcdef1234567890abcdef12345678",
      tvl: "$850K",
      managementFee: "0.75%",
      performanceFee: "12%",
      revenue: "$22.1K",
      status: "active",
    },
    {
      id: 3,
      name: "Art & Collectibles Vault",
      manager: "0xabcdef1234567890abcdef1234567890abcdef12",
      tvl: "$425K",
      managementFee: "1%",
      performanceFee: "15%",
      revenue: "$8.7K",
      status: "pending",
    },
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-600 mt-1">
            Manage fee structures, vault manager fees, and revenue analytics
          </p>
        </div>
        <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
          <Settings className="w-4 h-4 mr-2" />
          Update Fee Structure
        </Button>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold text-green-900">
                  {revenueMetrics.totalRevenue}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">
                    {revenueMetrics.monthlyGrowth}
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Average Fee</p>
                <p className="text-3xl font-bold text-blue-900">
                  {revenueMetrics.averageFee}
                </p>
                <p className="text-sm text-blue-600 mt-2">Per transaction</p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">
                  Transactions
                </p>
                <p className="text-3xl font-bold text-purple-900">
                  {revenueMetrics.totalTransactions}
                </p>
                <p className="text-sm text-purple-600 mt-2">This month</p>
              </div>
              <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">
                  Active Vaults
                </p>
                <p className="text-3xl font-bold text-orange-900">89</p>
                <p className="text-sm text-orange-600 mt-2">Generating fees</p>
              </div>
              <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Structures and Revenue Breakdown */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Fee Structures */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Fee Structures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feeStructures.map((fee) => (
                <div
                  key={fee.id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedFeeType === fee.id
                      ? "border-green-300 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedFeeType(fee.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {fee.name}
                      </h4>
                      <p className="text-sm text-gray-600">{fee.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {fee.rate}
                      </p>
                      <p className="text-sm text-gray-500">{fee.type}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Revenue:</span>
                      <p className="font-medium text-green-600">
                        {fee.revenue}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Applies to:</span>
                      <p className="font-medium">{fee.appliesTo}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <Badge className="bg-green-100 text-green-700 border-0 ml-2">
                        {fee.status}
                      </Badge>
                    </div>
                  </div>

                  {selectedFeeType === fee.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Input
                            value={fee.rate}
                            onChange={(e) => {
                              // TODO: Implement fee rate update logic
                              console.log("Fee rate updated:", e.target.value);
                            }}
                            className="text-right"
                            placeholder="Fee rate"
                          />
                        </div>
                        <Switch
                          checked={fee.status === "active"}
                          onCheckedChange={(checked) => {
                            // TODO: Implement status toggle logic
                            console.log("Status changed:", checked);
                          }}
                        />
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feeBreakdown.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {item.type}
                    </span>
                    <span className="text-sm text-gray-500">
                      ${(item.amount / 1000).toFixed(1)}K ({item.percentage}%)
                    </span>
                  </div>
                  <Progress value={item.percentage} className="h-2">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </Progress>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vault Manager Fees */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Vault Manager Fee Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vaultManagers.map((vault) => (
              <div
                key={vault.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {vault.name}
                    </h4>
                    <p className="text-sm text-gray-500 font-mono">
                      {vault.manager.slice(0, 6)}...{vault.manager.slice(-4)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">
                      {vault.tvl}
                    </p>
                    <p className="text-xs text-gray-500">TVL</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">
                      {vault.managementFee}
                    </p>
                    <p className="text-xs text-gray-500">Management</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">
                      {vault.performanceFee}
                    </p>
                    <p className="text-xs text-gray-500">Performance</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-green-600">
                      {vault.revenue}
                    </p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                  <Badge
                    className={
                      vault.status === "active"
                        ? "bg-green-100 text-green-700 border-0"
                        : "bg-yellow-100 text-yellow-700 border-0"
                    }
                  >
                    {vault.status}
                  </Badge>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Edit Fees
                    </Button>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
