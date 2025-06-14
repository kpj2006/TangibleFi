"use client";

import { useState } from "react";
import { useMarketData } from "../../../hooks/use-market-data";
import { MarketOverviewCards } from "../../../components/market/MarketOverviewCards";
import { CryptoMarketTable } from "../../../components/market/CryptoMarketTable";
import { RWAAssetsTable } from "../../../components/market/RWAAssetsTable";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import {
  RefreshCw,
  Download,
  TrendingUp,
  AlertCircle,
  Zap,
  Clock,
  BarChart3,
  Activity,
  Globe,
  Coins,
  Building,
  PieChart,
} from "lucide-react";

export default function MarketPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const marketData = useMarketData();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    marketData.refreshData();
    // Add a small delay for better UX
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const handleExport = () => {
    // Create comprehensive market data CSV
    const csvData = [
      ["Market Overview"],
      ["Total Market Cap", marketData.overview.total_market_cap.toString()],
      ["24h Volume", marketData.overview.total_volume_24h.toString()],
      ["Total Assets", marketData.overview.total_assets.toString()],
      ["Market Change 24h", marketData.overview.market_change_24h.toString()],
      ["Active Traders", marketData.overview.active_traders.toString()],
      [""],
      ["Cryptocurrency Markets"],
      [
        "Rank",
        "Name",
        "Symbol",
        "Price",
        "Market Cap",
        "24h Change",
        "24h Volume",
      ],
      ...marketData.crypto_markets.map((coin, index) => [
        (index + 1).toString(),
        coin.name,
        coin.symbol,
        coin.current_price.toString(),
        (coin.market_cap || 0).toString(),
        (coin.price_change_percentage_24h || 0).toString(),
        (coin.total_volume || 0).toString(),
      ]),
      [""],
      ["Real World Assets"],
      [
        "Name",
        "Type",
        "Value",
        "Location",
        "Blockchain",
        "Status",
        "24h Change",
        "24h Volume",
      ],
      ...marketData.rwa_assets.map((asset) => [
        asset.name,
        asset.asset_type,
        asset.current_value.toString(),
        asset.location,
        asset.blockchain,
        asset.verification_status,
        asset.price_change_24h.toString(),
        asset.volume_24h.toString(),
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `market-data-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000000) {
      return `$${(value / 1000000000000).toFixed(2)}T`;
    } else if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header without Background */}
      <div className="border-b border-gray-200/50">
        <div className="w-full px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Global Market Overview
                </h1>
                <p className="text-gray-600 mt-2">
                  Real-time cryptocurrency and RWA market intelligence
                </p>
                {marketData.last_updated && (
                  <div className="flex items-center gap-2 mt-3">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">
                      Last updated:{" "}
                      {marketData.last_updated.toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex items-center gap-2 border-gray-300 hover:bg-white/80 bg-white/60 backdrop-blur-sm"
                onClick={handleRefresh}
                disabled={isRefreshing || marketData.loading}
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
              <Button
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg"
                onClick={handleExport}
                disabled={marketData.loading}
              >
                <Download className="w-4 h-4" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-6 py-6 space-y-6">
        {/* Error State */}
        {marketData.error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium text-lg">
                  Error loading market data
                </span>
              </div>
              <p className="text-red-600 mt-2">{marketData.error}</p>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Real-time Status */}
        <Card className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-green-200 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                  </div>
                  <Zap className="h-6 w-6 text-green-600" />
                  <span className="font-semibold text-gray-900 text-xl">
                    Live Market Data
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-700 border-green-300 px-4 py-2"
                >
                  CoinGecko API • Real-time • Auto-refresh 60s
                </Badge>
              </div>
              <div className="flex items-center gap-8 text-base">
                <div className="flex items-center gap-3 bg-white/80 px-6 py-3 rounded-xl shadow-sm">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  <span className="text-blue-600 font-semibold">
                    {formatCurrency(marketData.overview.total_market_cap)} Total
                    Cap
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-white/80 px-6 py-3 rounded-xl shadow-sm">
                  <Activity className="h-5 w-5 text-purple-500" />
                  <span className="text-purple-600 font-semibold">
                    {formatCurrency(marketData.overview.total_volume_24h)} 24h
                    Vol
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Market Overview Cards with More Space */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Market Overview
          </h2>
          <MarketOverviewCards
            overview={marketData.overview}
            loading={marketData.loading}
          />
        </div>

        {/* Enhanced Market Categories with Better Layout */}
        {marketData.categories.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <PieChart className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-xl font-bold">
                  Asset Categories Overview
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {marketData.categories.map((category, index) => (
                  <div
                    key={index}
                    className="p-6 border rounded-xl hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 transition-all duration-300 hover:shadow-md hover:scale-105"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                        <span className="text-3xl">{category.icon}</span>
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-lg">
                          {category.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {category.asset_count} assets
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="font-bold text-xl">
                        {formatCurrency(category.total_value)}
                      </div>
                      <div
                        className={`text-sm flex items-center gap-2 font-medium ${
                          category.change_24h >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        <TrendingUp className="h-4 w-4" />
                        {category.change_24h >= 0 ? "+" : ""}
                        {category.change_24h.toFixed(2)}% (24h)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Full-width Market Tables with Enhanced Layout */}
        <div className="space-y-8">
          {/* Cryptocurrency Markets - Full Width */}
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Coins className="h-6 w-6 text-orange-500" />
                <CardTitle className="text-xl font-bold">
                  Cryptocurrency Markets
                </CardTitle>
                <Badge variant="secondary" className="ml-auto">
                  Top {marketData.crypto_markets.length} by Market Cap
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <CryptoMarketTable
                data={marketData.crypto_markets}
                loading={marketData.loading}
              />
            </CardContent>
          </Card>

          {/* RWA Assets - Full Width */}
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Building className="h-6 w-6 text-green-500" />
                <CardTitle className="text-xl font-bold">
                  Real World Assets (RWA)
                </CardTitle>
                <Badge variant="secondary" className="ml-auto">
                  {
                    marketData.rwa_assets.filter(
                      (asset) => asset.verification_status === "verified"
                    ).length
                  }{" "}
                  Verified Assets
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <RWAAssetsTable
                data={marketData.rwa_assets}
                loading={marketData.loading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Market Statistics */}
        <Card className="shadow-lg bg-gradient-to-r from-slate-50 to-gray-50">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-indigo-600" />
              Market Statistics & Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center p-6 bg-white rounded-xl shadow-sm border">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {marketData.crypto_markets.length}
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Cryptocurrencies
                </div>
                <div className="text-xs text-gray-500">
                  Top {marketData.crypto_markets.length} by market cap
                </div>
              </div>

              <div className="text-center p-6 bg-white rounded-xl shadow-sm border">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {marketData.rwa_assets.length}
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  RWA Assets
                </div>
                <div className="text-xs text-gray-500">
                  Verified tokenized assets
                </div>
              </div>

              <div className="text-center p-6 bg-white rounded-xl shadow-sm border">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {
                    marketData.rwa_assets.filter(
                      (asset) => asset.verification_status === "verified"
                    ).length
                  }
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Verified Assets
                </div>
                <div className="text-xs text-gray-500">Ready for trading</div>
              </div>

              <div className="text-center p-6 bg-white rounded-xl shadow-sm border">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {marketData.categories.length}
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Asset Categories
                </div>
                <div className="text-xs text-gray-500">
                  Diversified portfolio
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
