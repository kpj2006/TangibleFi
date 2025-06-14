"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  PortfolioAsset,
  CrossChainPosition,
} from "../../hooks/use-portfolio-data";
import { PieChart, Building, Coins, MapPin, Zap } from "lucide-react";

interface AssetAllocationProps {
  assets: PortfolioAsset[];
  positions: CrossChainPosition[];
  loading?: boolean;
  className?: string;
}

interface AllocationData {
  category: string;
  value: number;
  percentage: number;
  color: string;
  icon: React.ComponentType<any>;
  items: Array<{
    name: string;
    value: number;
    type: string;
    blockchain?: string;
  }>;
}

export function AssetAllocation({
  assets,
  positions,
  loading = false,
  className = "",
}: AssetAllocationProps) {
  const allocationData = useMemo(() => {
    const totalValue =
      assets.reduce((sum, asset) => sum + asset.current_value, 0) +
      positions.reduce((sum, pos) => sum + pos.usd_value, 0);

    if (totalValue === 0) return [];

    // Group assets by type
    const assetsByType = assets.reduce(
      (acc, asset) => {
        const type = asset.asset_type || "Other";
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push({
          name: asset.name,
          value: asset.current_value,
          type: asset.asset_type,
          blockchain: asset.blockchain,
        });
        return acc;
      },
      {} as Record<
        string,
        Array<{
          name: string;
          value: number;
          type: string;
          blockchain?: string;
        }>
      >
    );

    // Group crypto positions by blockchain
    const cryptoPositions = positions.map((pos) => ({
      name: `${pos.asset_symbol} (${pos.blockchain})`,
      value: pos.usd_value,
      type: "Cryptocurrency",
      blockchain: pos.blockchain,
    }));

    const categories: AllocationData[] = [];

    // Add asset categories
    Object.entries(assetsByType).forEach(([type, items]) => {
      const categoryValue = items.reduce((sum, item) => sum + item.value, 0);
      const percentage = (categoryValue / totalValue) * 100;

      let color = "#6b7280"; // Default gray
      let icon = Building;

      switch (type.toLowerCase()) {
        case "real estate":
          color = "#10b981"; // Green
          icon = Building;
          break;
        case "vehicle":
          color = "#3b82f6"; // Blue
          icon = MapPin;
          break;
        case "art":
          color = "#8b5cf6"; // Purple
          icon = PieChart;
          break;
        case "jewelry":
          color = "#f59e0b"; // Amber
          icon = Zap;
          break;
        case "collectible":
          color = "#ef4444"; // Red
          icon = PieChart;
          break;
        default:
          color = "#6b7280"; // Gray
          icon = Building;
      }

      categories.push({
        category: type,
        value: categoryValue,
        percentage,
        color,
        icon,
        items,
      });
    });

    // Add crypto category if positions exist
    if (cryptoPositions.length > 0) {
      const cryptoValue = cryptoPositions.reduce(
        (sum, pos) => sum + pos.value,
        0
      );
      const percentage = (cryptoValue / totalValue) * 100;

      categories.push({
        category: "Cryptocurrency",
        value: cryptoValue,
        percentage,
        color: "#f97316", // Orange
        icon: Coins,
        items: cryptoPositions,
      });
    }

    return categories.sort((a, b) => b.value - a.value);
  }, [assets, positions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Asset Allocation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (allocationData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Asset Allocation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-gray-500">
            No assets to display
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate angles for pie chart
  let currentAngle = 0;
  const pieSlices = allocationData.map((item) => {
    const angle = (item.percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;

    // Calculate path for pie slice
    const centerX = 50;
    const centerY = 50;
    const radius = 40;

    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      "Z",
    ].join(" ");

    return {
      ...item,
      pathData,
      startAngle,
      endAngle,
    };
  });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Asset Allocation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Pie Chart */}
          <div className="flex justify-center">
            <div className="relative w-64 h-64">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                className="transform -rotate-90"
              >
                {pieSlices.map((slice, index) => (
                  <path
                    key={index}
                    d={slice.pathData}
                    fill={slice.color}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                    stroke="white"
                    strokeWidth="0.5"
                  >
                    <title>
                      {slice.category}: {formatCurrency(slice.value)} (
                      {slice.percentage.toFixed(1)}%)
                    </title>
                  </path>
                ))}
              </svg>

              {/* Center label */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs text-gray-500">Total Value</div>
                  <div className="text-sm font-semibold">
                    {formatCurrency(
                      allocationData.reduce((sum, item) => sum + item.value, 0)
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-3">
            {allocationData.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">{item.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(item.value)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed breakdown */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Asset Details</h4>
            {allocationData.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.category}
                </div>
                <div className="ml-5 space-y-1">
                  {category.items.slice(0, 3).map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{item.name}</span>
                        {item.blockchain && (
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                            {item.blockchain}
                          </span>
                        )}
                      </div>
                      <span className="font-medium">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  ))}
                  {category.items.length > 3 && (
                    <div className="text-xs text-gray-500 ml-2">
                      +{category.items.length - 3} more items
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
