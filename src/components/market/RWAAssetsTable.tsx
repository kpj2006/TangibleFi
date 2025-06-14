"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { RWAAssetData } from "../../hooks/use-market-data";
import {
  Building,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Shield,
  Eye,
  MoreHorizontal,
  Filter,
} from "lucide-react";

interface RWAAssetsTableProps {
  data: RWAAssetData[];
  loading?: boolean;
  className?: string;
}

export function RWAAssetsTable({
  data,
  loading = false,
  className = "",
}: RWAAssetsTableProps) {
  const [sortBy, setSortBy] = useState<"value" | "change" | "volume">("value");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterType, setFilterType] = useState<string>("all");

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(2)}B`;
    } else if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(2)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const formatPercentage = (percentage: number) => {
    const isPositive = percentage >= 0;
    return {
      value: `${isPositive ? "+" : ""}${percentage.toFixed(2)}%`,
      isPositive,
      color: isPositive ? "text-green-600" : "text-red-600",
      bgColor: isPositive ? "bg-green-50" : "bg-red-50",
      icon: isPositive ? ArrowUpRight : ArrowDownRight,
    };
  };

  const getAssetIcon = (assetType: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      "Real Estate": Building,
      Vehicle: MapPin,
      Art: Eye,
      Jewelry: Shield,
      Collectible: Eye,
      Equipment: Shield,
      Commodity: Shield,
    };
    return iconMap[assetType] || Building;
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSort = (column: "value" | "change" | "volume") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const filteredData =
    filterType === "all"
      ? data
      : data.filter((asset) => asset.asset_type === filterType);

  const sortedData = [...filteredData].sort((a, b) => {
    let aValue: number, bValue: number;

    switch (sortBy) {
      case "value":
        aValue = a.current_value;
        bValue = b.current_value;
        break;
      case "change":
        aValue = a.price_change_24h;
        bValue = b.price_change_24h;
        break;
      case "volume":
        aValue = a.volume_24h;
        bValue = b.volume_24h;
        break;
      default:
        return 0;
    }

    return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
  });

  const assetTypes = [
    "all",
    ...Array.from(new Set(data.map((asset) => asset.asset_type))),
  ];

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Real World Assets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border rounded-lg animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Real World Assets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Building className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No RWA assets available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Real World Assets
            <Badge variant="secondary" className="ml-2">
              {data.length} Assets
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              {assetTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "all" ? "All Types" : type}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort("value")}
              className={sortBy === "value" ? "bg-blue-50" : ""}
            >
              Value
              {sortBy === "value" &&
                (sortOrder === "desc" ? (
                  <TrendingDown className="h-3 w-3 ml-1" />
                ) : (
                  <TrendingUp className="h-3 w-3 ml-1" />
                ))}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort("change")}
              className={sortBy === "change" ? "bg-blue-50" : ""}
            >
              24h Change
              {sortBy === "change" &&
                (sortOrder === "desc" ? (
                  <TrendingDown className="h-3 w-3 ml-1" />
                ) : (
                  <TrendingUp className="h-3 w-3 ml-1" />
                ))}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedData.map((asset, index) => {
            const changeData = formatPercentage(asset.price_change_24h);
            const ChangeIcon = changeData.icon;
            const AssetIcon = getAssetIcon(asset.asset_type);

            return (
              <div
                key={asset.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <AssetIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {asset.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getVerificationColor(asset.verification_status)}`}
                        >
                          {asset.verification_status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{asset.asset_type}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {asset.location}
                        </div>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">
                          {asset.blockchain}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(asset.current_value)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Vol: {formatCurrency(asset.volume_24h)}
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full ${changeData.bgColor}`}
                  >
                    <ChangeIcon className={`h-3 w-3 ${changeData.color}`} />
                    <span className={`text-sm font-medium ${changeData.color}`}>
                      {changeData.value}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RWA Market Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-gray-500">Total Value</div>
              <div className="font-semibold">
                {formatCurrency(
                  data.reduce((sum, asset) => sum + asset.current_value, 0)
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">24h Volume</div>
              <div className="font-semibold">
                {formatCurrency(
                  data.reduce((sum, asset) => sum + asset.volume_24h, 0)
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">Verified Assets</div>
              <div className="font-semibold text-green-600">
                {
                  data.filter(
                    (asset) => asset.verification_status === "verified"
                  ).length
                }
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">Average Change</div>
              <div
                className={`font-semibold ${
                  data.reduce((sum, asset) => sum + asset.price_change_24h, 0) /
                    data.length >=
                  0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {
                  formatPercentage(
                    data.reduce(
                      (sum, asset) => sum + asset.price_change_24h,
                      0
                    ) / data.length
                  ).value
                }
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
