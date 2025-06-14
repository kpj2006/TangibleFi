"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  PortfolioAsset,
  PortfolioLoan,
  CrossChainPosition,
} from "../../hooks/use-portfolio-data";
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  DollarSign,
  Building,
  Coins,
  Calendar,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RecentActivityProps {
  assets: PortfolioAsset[];
  loans: PortfolioLoan[];
  positions: CrossChainPosition[];
  loading?: boolean;
  className?: string;
}

interface ActivityItem {
  id: string;
  type:
    | "asset_added"
    | "loan_created"
    | "payment_made"
    | "position_updated"
    | "asset_updated";
  title: string;
  description: string;
  amount?: number;
  timestamp: Date;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

// Safe date formatting to prevent hydration errors
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
};

export function RecentActivity({
  assets,
  loans,
  positions,
  loading = false,
  className = "",
}: RecentActivityProps) {
  const activityItems = useMemo(() => {
    const activities: ActivityItem[] = [];

    // Add asset activities
    assets.forEach((asset) => {
      activities.push({
        id: `asset-${asset.id}`,
        type: "asset_added",
        title: "Asset Added",
        description: `${asset.name} (${asset.asset_type})`,
        amount: asset.current_value,
        timestamp: new Date(asset.created_at),
        icon: Building,
        color: "text-green-600",
        bgColor: "bg-green-50",
      });

      // If asset was updated recently (within 7 days), add update activity
      const updatedAt = new Date(asset.updated_at);
      const createdAt = new Date(asset.created_at);
      if (updatedAt.getTime() > createdAt.getTime() + 60000) {
        // More than 1 minute difference
        activities.push({
          id: `asset-update-${asset.id}`,
          type: "asset_updated",
          title: "Asset Valuation Updated",
          description: `${asset.name} value updated`,
          amount: asset.current_value,
          timestamp: updatedAt,
          icon: ArrowUpRight,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
        });
      }
    });

    // Add loan activities
    loans.forEach((loan) => {
      activities.push({
        id: `loan-${loan.id}`,
        type: "loan_created",
        title: "Loan Created",
        description: `Loan against ${loan.assets?.name || "asset"}`,
        amount: loan.loan_amount,
        timestamp: new Date(loan.created_at),
        icon: DollarSign,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      });

      // Add simulated payment activities for active loans
      if (
        loan.loan_status === "active" &&
        loan.outstanding_balance < loan.loan_amount
      ) {
        const paymentAmount = loan.loan_amount - loan.outstanding_balance;
        const paymentDate = new Date();
        paymentDate.setDate(
          paymentDate.getDate() - Math.floor(Math.random() * 30)
        ); // Random date within last 30 days

        activities.push({
          id: `payment-${loan.id}`,
          type: "payment_made",
          title: "Payment Made",
          description: `Payment for ${loan.assets?.name || "loan"}`,
          amount: paymentAmount,
          timestamp: paymentDate,
          icon: Minus,
          color: "text-red-600",
          bgColor: "bg-red-50",
        });
      }
    });

    // Add crypto position activities
    positions.forEach((position) => {
      activities.push({
        id: `position-${position.id}`,
        type: "position_updated",
        title: "Crypto Position Updated",
        description: `${position.asset_symbol} on ${position.blockchain}`,
        amount: position.usd_value,
        timestamp: new Date(position.updated_at),
        icon: Coins,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      });
    });

    // Sort by timestamp (most recent first) and limit to 10 items
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
  }, [assets, loans, positions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      return formatDate(date.toISOString());
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activityItems.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No recent activity</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activityItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={`p-2 rounded-full ${item.bgColor}`}>
                  <Icon className={`h-4 w-4 ${item.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {item.title}
                    </h4>
                    <span className="text-xs text-gray-500 ml-2">
                      {formatTimeAgo(item.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {item.description}
                  </p>
                  {item.amount && (
                    <p className={`text-sm font-medium ${item.color}`}>
                      {item.type === "payment_made" ? "-" : "+"}
                      {formatCurrency(item.amount)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* View all activity link */}
        <div className="mt-6 pt-4 border-t">
          <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
            View All Activity
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
