"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../../supabase/client";
import { User } from "@supabase/supabase-js";
import { usePortfolioData } from "../../../hooks/use-portfolio-data";
import { MetricsCards } from "../../../components/portfolio/MetricsCards";
import { PerformanceChart } from "../../../components/portfolio/PerformanceChart";
import { AssetAllocation } from "../../../components/portfolio/AssetAllocation";
import { RecentActivity } from "../../../components/portfolio/RecentActivity";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  RefreshCw,
  Download,
  TrendingUp,
  AlertCircle,
  Zap,
  Clock,
} from "lucide-react";

export default function PortfolioPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const supabase = createClient();

  // Get user on component mount
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase.auth]);

  // Use the portfolio data hook
  const portfolioData = usePortfolioData(user);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    portfolioData.refreshData();
    // Add a small delay for better UX
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleExport = () => {
    // Create CSV data
    const csvData = [
      ["Asset Type", "Name", "Value", "Blockchain", "Status"],
      ...portfolioData.assets.map((asset) => [
        asset.asset_type,
        asset.name,
        asset.current_value.toString(),
        asset.blockchain,
        asset.verification_status,
      ]),
      ["", "", "", "", ""],
      ["Loan ID", "Amount", "Outstanding", "Status", "Asset"],
      ...portfolioData.loans.map((loan) => [
        loan.id,
        loan.loan_amount.toString(),
        loan.outstanding_balance.toString(),
        loan.loan_status,
        loan.assets?.name || "N/A",
      ]),
      ["", "", "", "", ""],
      ["Position", "Symbol", "Balance", "USD Value", "Blockchain"],
      ...portfolioData.positions.map((pos) => [
        pos.position_type,
        pos.asset_symbol,
        pos.balance.toString(),
        pos.usd_value.toString(),
        pos.blockchain,
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `portfolio-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (!user) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">
              Please log in to view your portfolio
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Portfolio Overview
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time portfolio tracking with live data updates
          </p>
          {portfolioData.lastUpdated && (
            <div className="flex items-center gap-2 mt-1">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                Last updated: {portfolioData.lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleRefresh}
            disabled={isRefreshing || portfolioData.loading}
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button
            className="flex items-center gap-2"
            onClick={handleExport}
            disabled={portfolioData.loading}
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Error State */}
      {portfolioData.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Error loading portfolio data</span>
            </div>
            <p className="text-red-600 text-sm mt-1">{portfolioData.error}</p>
          </CardContent>
        </Card>
      )}

      {/* Real-time Status Indicator */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-gray-900">
                  Live Portfolio Tracking
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Auto-refreshes every 30 seconds • Real-time database sync
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-green-600 font-medium">
                  {portfolioData.metrics.performanceChange24h >= 0 ? "+" : ""}
                  {portfolioData.metrics.performanceChange24h.toFixed(2)}% (24h)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Metrics Cards */}
      <MetricsCards
        metrics={portfolioData.metrics}
        loading={portfolioData.loading}
      />

      {/* Charts and Analysis Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <PerformanceChart
          data={portfolioData.performance}
          loading={portfolioData.loading}
          className="lg:col-span-1"
        />

        {/* Asset Allocation */}
        <AssetAllocation
          assets={portfolioData.assets}
          positions={portfolioData.positions}
          loading={portfolioData.loading}
          className="lg:col-span-1"
        />
      </div>

      {/* Recent Activity */}
      <RecentActivity
        assets={portfolioData.assets}
        loans={portfolioData.loans}
        positions={portfolioData.positions}
        loading={portfolioData.loading}
      />

      {/* Portfolio Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Portfolio Health Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  portfolioData.metrics.healthRatio >= 2.0
                    ? "text-green-600"
                    : portfolioData.metrics.healthRatio >= 1.5
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {portfolioData.metrics.healthRatio.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">Health Ratio</div>
              <div className="text-xs text-gray-400 mt-1">
                {portfolioData.metrics.healthRatio >= 2.0
                  ? "Excellent"
                  : portfolioData.metrics.healthRatio >= 1.5
                    ? "Good"
                    : "Needs Attention"}
              </div>
            </div>

            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  portfolioData.metrics.diversificationScore >= 80
                    ? "text-green-600"
                    : portfolioData.metrics.diversificationScore >= 60
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {portfolioData.metrics.diversificationScore.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-500">Diversification</div>
              <div className="text-xs text-gray-400 mt-1">
                {portfolioData.metrics.diversificationScore >= 80
                  ? "Well Diversified"
                  : portfolioData.metrics.diversificationScore >= 60
                    ? "Moderate"
                    : "Needs Improvement"}
              </div>
            </div>

            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  portfolioData.metrics.collateralUtilization <= 60
                    ? "text-green-600"
                    : portfolioData.metrics.collateralUtilization <= 80
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {portfolioData.metrics.collateralUtilization.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Collateral Usage</div>
              <div className="text-xs text-gray-400 mt-1">
                {portfolioData.metrics.collateralUtilization <= 60
                  ? "Conservative"
                  : portfolioData.metrics.collateralUtilization <= 80
                    ? "Moderate"
                    : "High Risk"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
