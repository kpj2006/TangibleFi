"use client";

import React from "react";
import { Card, CardContent } from "../ui/card";
import { MarketOverview } from "../../hooks/use-market-data";
import {
  BarChart3,
  Activity,
  Globe,
  TrendingUp,
  TrendingDown,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
} from "lucide-react";

interface MarketOverviewCardsProps {
  overview: MarketOverview;
  loading?: boolean;
  className?: string;
}

export function MarketOverviewCards({
  overview,
  loading = false,
  className = "",
}: MarketOverviewCardsProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000000) {
      return `$${(amount / 1000000000000).toFixed(2)}T`;
    } else if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(2)}B`;
    } else if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(2)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const formatPercentage = (percentage: number) => {
    const isPositive = percentage >= 0;
    return {
      value: `${isPositive ? "+" : ""}${percentage.toFixed(2)}%`,
      isPositive,
      icon: isPositive ? ArrowUpRight : ArrowDownRight,
      color: isPositive ? "text-green-600" : "text-red-600",
      bgColor: isPositive ? "text-green-500" : "text-red-500",
    };
  };

  if (loading) {
    return (
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${className}`}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-24"></div>
                  <div className="h-10 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
              </div>
              <div className="mt-6">
                <div className="h-4 bg-gray-200 rounded w-28"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const changeData = formatPercentage(overview.market_change_24h);
  const ChangeIcon = changeData.icon;

  const cards = [
    {
      title: "Total Market Cap",
      value: formatCurrency(overview.total_market_cap),
      icon: BarChart3,
      color: "blue",
      bgGradient: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
      iconBg: "bg-blue-600",
      textColor: "text-blue-700",
      valueColor: "text-blue-900",
      change: changeData,
      subtitle: "Combined crypto + RWA",
    },
    {
      title: "24h Volume",
      value: formatCurrency(overview.total_volume_24h),
      icon: Activity,
      color: "emerald",
      bgGradient: "from-emerald-50 to-emerald-100",
      borderColor: "border-emerald-200",
      iconBg: "bg-emerald-600",
      textColor: "text-emerald-700",
      valueColor: "text-emerald-900",
      change: formatPercentage(15.7), // Volume change simulation
      subtitle: "Trading volume",
    },
    {
      title: "Total Assets",
      value: overview.total_assets.toLocaleString(),
      icon: Globe,
      color: "purple",
      bgGradient: "from-purple-50 to-purple-100",
      borderColor: "border-purple-200",
      iconBg: "bg-purple-600",
      textColor: "text-purple-700",
      valueColor: "text-purple-900",
      change: formatPercentage(8.2),
      subtitle: "Listed assets",
    },
    {
      title: "Active Traders",
      value: formatNumber(overview.active_traders),
      icon: Users,
      color: "orange",
      bgGradient: "from-orange-50 to-orange-100",
      borderColor: "border-orange-200",
      iconBg: "bg-orange-600",
      textColor: "text-orange-700",
      valueColor: "text-orange-900",
      change: formatPercentage(12.4),
      subtitle: "24h active users",
    },
    {
      title: "Transactions",
      value: formatNumber(overview.total_transactions),
      icon: Zap,
      color: "pink",
      bgGradient: "from-pink-50 to-pink-100",
      borderColor: "border-pink-200",
      iconBg: "bg-pink-600",
      textColor: "text-pink-700",
      valueColor: "text-pink-900",
      change: formatPercentage(23.1),
      subtitle: "24h transactions",
    },
    {
      title: "Market Trend",
      value: changeData.value,
      icon: changeData.isPositive ? TrendingUp : TrendingDown,
      color: changeData.isPositive ? "green" : "red",
      bgGradient: changeData.isPositive
        ? "from-green-50 to-green-100"
        : "from-red-50 to-red-100",
      borderColor: changeData.isPositive
        ? "border-green-200"
        : "border-red-200",
      iconBg: changeData.isPositive ? "bg-green-600" : "bg-red-600",
      textColor: changeData.isPositive ? "text-green-700" : "text-red-700",
      valueColor: changeData.isPositive ? "text-green-900" : "text-red-900",
      change: null,
      subtitle: "24h market change",
    },
  ];

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${className}`}
    >
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card
            key={index}
            className={`${card.borderColor} bg-gradient-to-br ${card.bgGradient} hover:shadow-xl transition-all duration-300 hover:scale-105 shadow-lg`}
          >
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                  <p
                    className={`text-base font-semibold ${card.textColor} mb-2`}
                  >
                    {card.title}
                  </p>
                  <p className={`text-3xl font-bold ${card.valueColor}`}>
                    {card.value}
                  </p>
                </div>
                <div
                  className={`w-16 h-16 ${card.iconBg} rounded-xl flex items-center justify-center shadow-lg ml-4`}
                >
                  <Icon className="h-8 w-8 text-white" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`text-sm ${card.textColor} opacity-80 font-medium`}
                >
                  {card.subtitle}
                </span>
                {card.change && (
                  <div
                    className={`flex items-center gap-2 ${card.change.color} bg-white/50 px-3 py-1 rounded-full`}
                  >
                    <card.change.icon className="h-4 w-4" />
                    <span className="text-sm font-semibold">
                      {card.change.value}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
