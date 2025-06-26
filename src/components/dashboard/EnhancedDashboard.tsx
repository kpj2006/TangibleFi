"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  usePortfolioDashboard,
  useRealTimePortfolioValue,
  useMarketInsights,
  usePortfolioAnalytics,
  useDeFiStrategies,
} from "@/hooks/usePortfolioDashboard";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  AlertTriangle,
  Zap,
  Target,
  Globe,
  RefreshCw,
  Settings,
  Eye,
  PieChart,
  LineChart,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Portfolio Overview Card
function PortfolioOverviewCard() {
  const { value, change24h, changePercent, isLoading } =
    useRealTimePortfolioValue();

  return (
    <Card className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Total Portfolio Value
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-3xl font-bold">
            {isLoading ? "..." : `$${value.toLocaleString()}`}
          </div>
          <div className="flex items-center gap-2">
            {changePercent >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-300" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-300" />
            )}
            <span
              className={cn(
                "text-sm font-medium",
                changePercent >= 0 ? "text-green-300" : "text-red-300"
              )}
            >
              {changePercent >= 0 ? "+" : ""}
              {changePercent.toFixed(2)}% (${change24h.toLocaleString()})
            </span>
          </div>
          <div className="text-sm opacity-80">24h Change</div>
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Stats Cards
function QuickStatsCards() {
  const { stats, isConnected } = usePortfolioDashboard();

  if (!isConnected) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center py-8">
          <CardContent>
            <div className="text-gray-500">
              Connect wallet to view portfolio
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quickStats = [
    {
      title: "Best Performer",
      value: stats.bestPerformer?.symbol || "N/A",
      change: stats.bestPerformer
        ? `+${stats.bestPerformer.pnlPercentage.toFixed(1)}%`
        : "0%",
      positive: true,
      icon: TrendingUp,
    },
    {
      title: "Risk Score",
      value: stats.riskScore.toFixed(0),
      change:
        stats.riskScore > 50 ? "High" : stats.riskScore > 25 ? "Medium" : "Low",
      positive: stats.riskScore < 50,
      icon: AlertTriangle,
    },
    {
      title: "Diversification",
      value: `${stats.diversificationScore.toFixed(0)}%`,
      change:
        stats.diversificationScore > 70
          ? "Excellent"
          : stats.diversificationScore > 50
            ? "Good"
            : "Poor",
      positive: stats.diversificationScore > 50,
      icon: PieChart,
    },
    {
      title: "Top Opportunity",
      value: stats.topOpportunity?.protocol || "N/A",
      change: stats.topOpportunity
        ? `${stats.topOpportunity.apy.toFixed(1)}% APY`
        : "0%",
      positive: true,
      icon: Target,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {quickStats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      stat.positive ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {stat.change}
                  </p>
                </div>
                <Icon
                  className={cn(
                    "h-8 w-8",
                    stat.positive ? "text-green-500" : "text-red-500"
                  )}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Market Insights Card
function MarketInsightsCard() {
  const { allInsights, urgentInsights, isLoading } = useMarketInsights();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Market Insights
          {urgentInsights.length > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {urgentInsights.length} Urgent
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {allInsights.slice(0, 5).map((insight) => (
            <div
              key={insight.id}
              className="border-l-4 border-l-blue-500 pl-3 py-2"
            >
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant={
                    insight.impact === "positive"
                      ? "default"
                      : insight.impact === "negative"
                        ? "destructive"
                        : "secondary"
                  }
                  className="text-xs"
                >
                  {insight.type}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {"urgency" in insight ? insight.urgency : "Normal"}
                </Badge>
              </div>
              <h4 className="font-medium text-sm">{insight.title}</h4>
              <p className="text-xs text-gray-600 mt-1">
                {insight.description}
              </p>
              {"recommendation" in insight && insight.recommendation && (
                <p className="text-xs text-blue-600 mt-1 font-medium">
                  💡 {insight.recommendation}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Top DeFi Opportunities
function DeFiOpportunitiesCard() {
  const { strategies, isLoading } = useDeFiStrategies("medium");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>DeFi Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Top DeFi Opportunities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {strategies.slice(0, 3).map((strategy) => (
            <div
              key={strategy.id}
              className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{strategy.name}</h4>
                <Badge
                  variant={
                    strategy.category === "conservative"
                      ? "secondary"
                      : strategy.category === "moderate"
                        ? "default"
                        : "destructive"
                  }
                >
                  {strategy.expectedAPY.toFixed(1)}% APY
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                {strategy.description}
              </p>
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline">Risk: {strategy.riskScore}/100</Badge>
                <Badge variant="outline">
                  Min: ${strategy.requirements.minimumAmount}
                </Badge>
                <Badge variant="outline">
                  {strategy.requirements.experience}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Portfolio Analytics
function PortfolioAnalyticsCard() {
  const { assetTypeDistribution, performanceMetrics, isLoading } =
    usePortfolioAnalytics();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-100 rounded"></div>
              <div className="h-16 bg-gray-100 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Portfolio Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Asset Distribution */}
          <div>
            <h4 className="font-medium text-sm mb-2">
              Asset Type Distribution
            </h4>
            <div className="space-y-2">
              {assetTypeDistribution.map((item) => (
                <div key={item.type} className="flex items-center gap-2">
                  <div className="w-16 text-xs capitalize">{item.type}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs font-medium w-12">
                    {item.percentage.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {performanceMetrics.winRate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600">Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {performanceMetrics.sharpeRatio.toFixed(2)}
              </div>
              <div className="text-xs text-gray-600">Sharpe Ratio</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Enhanced Dashboard
export default function EnhancedDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const {
    refresh,
    autoRefresh,
    setAutoRefresh,
    filters,
    updateFilters,
    isConnected,
  } = usePortfolioDashboard();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Enhanced Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Advanced portfolio analytics and DeFi opportunities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={filters.riskTolerance}
            onValueChange={(value: any) =>
              updateFilters({ riskTolerance: value })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "bg-green-50 text-green-600" : ""}
          >
            <Eye className="h-4 w-4 mr-1" />
            {autoRefresh ? "Live" : "Manual"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={cn("h-4 w-4 mr-1", refreshing && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PortfolioOverviewCard />
        </div>
        <div className="lg:col-span-2">
          <QuickStatsCards />
        </div>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PortfolioAnalyticsCard />
            <MarketInsightsCard />
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <LineChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Advanced analytics charts coming soon</p>
                  <p className="text-sm">
                    Real-time performance tracking, correlation analysis, and
                    risk metrics
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DeFiOpportunitiesCard />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Cross-Chain Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Globe className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Cross-chain yield opportunities</p>
                  <p className="text-sm">
                    Bridge assets for higher yields on different networks
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <MarketInsightsCard />
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>AI-powered portfolio optimization</p>
                  <p className="text-sm">
                    Get personalized recommendations based on market analysis
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Connection Status */}
      {!isConnected && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="font-medium text-yellow-800">
                Wallet Not Connected
              </h3>
              <p className="text-sm text-yellow-600 mt-1">
                Connect your wallet to view your portfolio and access advanced
                features
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
