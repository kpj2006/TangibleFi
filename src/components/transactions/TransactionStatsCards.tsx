"use client";

import React from "react";
import { Card, CardContent } from "../ui/card";
import { TransactionStats } from "../../hooks/use-transaction-data";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface TransactionStatsCardsProps {
  stats: TransactionStats;
  loading?: boolean;
  className?: string;
}

export function TransactionStatsCards({
  stats,
  loading = false,
  className = "",
}: TransactionStatsCardsProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(2)}B`;
    } else if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(2)}K`;
    }
    return `$${amount.toFixed(2)}`;
  };

  const formatPercentage = (percentage: number) => {
    const isPositive = percentage >= 0;
    return {
      value: `${isPositive ? "+" : ""}${percentage.toFixed(1)}%`,
      isPositive,
      icon: isPositive ? ArrowUpRight : ArrowDownRight,
      color: isPositive ? "text-green-600" : "text-red-600",
    };
  };

  if (loading) {
    return (
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="mt-4">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const volumeChange = formatPercentage(stats.volume_change_24h);
  const VolumeChangeIcon = volumeChange.icon;

  const transactionCountChange = stats.transaction_count_change_24h;
  const feeChange = formatPercentage(stats.fee_change_24h);
  const FeeChangeIcon = feeChange.icon;

  const cards = [
    {
      title: "Total Volume",
      value: formatCurrency(stats.total_volume),
      icon: TrendingUp,
      color: "blue",
      bgGradient: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
      iconBg: "bg-blue-600",
      textColor: "text-blue-700",
      valueColor: "text-blue-900",
      change: volumeChange,
      subtitle: "All-time transaction volume",
    },
    {
      title: "Total Transactions",
      value: stats.total_transactions.toLocaleString(),
      icon: Activity,
      color: "purple",
      bgGradient: "from-purple-50 to-purple-100",
      borderColor: "border-purple-200",
      iconBg: "bg-purple-600",
      textColor: "text-purple-700",
      valueColor: "text-purple-900",
      change: {
        value: `${transactionCountChange >= 0 ? "+" : ""}${transactionCountChange}`,
        isPositive: transactionCountChange >= 0,
        icon: transactionCountChange >= 0 ? ArrowUpRight : ArrowDownRight,
        color: transactionCountChange >= 0 ? "text-green-600" : "text-red-600",
      },
      subtitle: "Total completed transactions",
    },
    {
      title: "Success Rate",
      value: `${stats.success_rate.toFixed(1)}%`,
      icon: CheckCircle,
      color: "green",
      bgGradient: "from-green-50 to-green-100",
      borderColor: "border-green-200",
      iconBg: "bg-green-600",
      textColor: "text-green-700",
      valueColor: "text-green-900",
      change: formatPercentage(2.3), // Simulated improvement
      subtitle: "Transaction success rate",
    },
    {
      title: "Average Fee",
      value: formatCurrency(stats.average_fee),
      icon: DollarSign,
      color: "orange",
      bgGradient: "from-orange-50 to-orange-100",
      borderColor: "border-orange-200",
      iconBg: "bg-orange-600",
      textColor: "text-orange-700",
      valueColor: "text-orange-900",
      change: feeChange,
      subtitle: "Average transaction fee",
    },
  ];

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}
    >
      {cards.map((card, index) => {
        const Icon = card.icon;
        const ChangeIcon = card.change.icon;

        return (
          <Card
            key={index}
            className={`${card.borderColor} bg-gradient-to-br ${card.bgGradient} hover:shadow-lg transition-all duration-200 hover:scale-105`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${card.textColor}`}>
                    {card.title}
                  </p>
                  <p className={`text-2xl font-bold ${card.valueColor} mt-1`}>
                    {card.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center shadow-lg`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className={`text-xs ${card.textColor} opacity-80`}>
                  {card.subtitle}
                </span>
                <div className={`flex items-center gap-1 ${card.change.color}`}>
                  <ChangeIcon className="h-3 w-3" />
                  <span className="text-xs font-medium">
                    {card.change.value}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
