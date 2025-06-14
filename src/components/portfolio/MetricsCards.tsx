"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PortfolioMetrics } from "../../hooks/use-portfolio-data";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Shield,
  PieChart,
  Calendar,
  AlertTriangle,
  Target,
  Activity,
  Zap,
} from "lucide-react";

interface MetricsCardsProps {
  metrics: PortfolioMetrics;
  loading?: boolean;
  className?: string;
}

export function MetricsCards({ metrics, loading = false, className = "" }: MetricsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getHealthColor = (ratio: number) => {
    if (ratio >= 2.0) return "text-green-600";
    if (ratio >= 1.5) return "text-yellow-600";
    return "text-red-600";
  };

  const getHealthStatus = (ratio: number) => {
    if (ratio >= 2.0) return "Excellent";
    if (ratio >= 1.5) return "Good";
    if (ratio >= 1.2) return "Fair";
    return "At Risk";
  };

  const getDiversificationColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getDiversificationStatus = (score: number) => {
    if (score >= 80) return "Well Diversified";
    if (score >= 60) return "Moderately Diversified";
    return "Needs Diversification";
  };

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metricsData = [
    {
      title: "Net Worth",
      value: formatCurrency(metrics.netWorth),
      icon: DollarSign,
      description: "Total portfolio value",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: metrics.performanceChange24h,
      showChange: true,
    },
    {
      title: "Total Assets",
      value: formatCurrency(metrics.totalAssetValue),
      icon: Target,
      description: "Real estate & physical assets",
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: metrics.performanceChange7d,
      showChange: true,
    },
    {
      title: "Crypto Holdings",
      value: formatCurrency(metrics.totalCryptoValue),
      icon: Zap,
      description: "Cross-chain positions",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: metrics.performanceChange24h * 1.5, // Crypto is more volatile
      showChange: true,
    },
    {
      title: "Outstanding Loans",
      value: formatCurrency(metrics.totalLoanBalance),
      icon: AlertTriangle,
      description: "Total debt obligations",
      color: "text-red-600",
      bgColor: "bg-red-50",
      change: null,
      showChange: false,
    },
    {
      title: "Health Ratio",
      value: metrics.healthRatio.toFixed(2),
      icon: Shield,
      description: getHealthStatus(metrics.healthRatio),
      color: getHealthColor(metrics.healthRatio),
      bgColor: metrics.healthRatio >= 2.0 ? "bg-green-50" : 
                metrics.healthRatio >= 1.5 ? "bg-yellow-50" : "bg-red-50",
      change: null,
      showChange: false,
    },
    {
      title: "Monthly Payments",
      value: formatCurrency(metrics.monthlyPayments),
      icon: Calendar,
      description: "Active loan payments",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      change: null,
      showChange: false,
    },
    {
      title: "Collateral Usage",
      value: `${metrics.collateralUtilization.toFixed(1)}%`,
      icon: PieChart,
      description: "Asset utilization ratio",
      color: metrics.collateralUtilization > 80 ? "text-red-600" : 
             metrics.collateralUtilization > 60 ? "text-yellow-600" : "text-green-600",
      bgColor: metrics.collateralUtilization > 80 ? "bg-red-50" : 
               metrics.collateralUtilization > 60 ? "bg-yellow-50" : "bg-green-50",
      change: null,
      showChange: false,
    },
    {
      title: "Diversification",
      value: `${metrics.diversificationScore.toFixed(0)}/100`,
      icon: Activity,
      description: getDiversificationStatus(metrics.diversificationScore),
      color: getDiversificationColor(metrics.diversificationScore),
      bgColor: metrics.diversificationScore >= 80 ? "bg-green-50" : 
               metrics.diversificationScore >= 60 ? "bg-yellow-50" : "bg-red-50",
      change: null,
      showChange: false,
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {metricsData.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${metric.bgColor}`}>
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                  {metric.title}
                </span>
                {metric.showChange && metric.change !== null && (
                  <div className="flex items-center gap-1">
                    {metric.change >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-xs ${
                      metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercent(metric.change)}
                    </span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className={`text-2xl font-bold ${metric.color}`}>
                  {metric.value}
                </div>
                <div className="text-xs text-gray-500">
                  {metric.description}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 