"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { CryptoMarketData } from "../../hooks/use-market-data";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  ExternalLink,
  Star,
  MoreHorizontal,
} from "lucide-react";

interface CryptoMarketTableProps {
  data: CryptoMarketData[];
  loading?: boolean;
  className?: string;
}

export function CryptoMarketTable({
  data,
  loading = false,
  className = "",
}: CryptoMarketTableProps) {
  const [sortBy, setSortBy] = useState<"market_cap" | "price" | "change">(
    "market_cap"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

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
    return `$${amount.toFixed(2)}`;
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

  const handleSort = (column: "market_cap" | "price" | "change") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const toggleFavorite = (coinId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(coinId)) {
      newFavorites.delete(coinId);
    } else {
      newFavorites.add(coinId);
    }
    setFavorites(newFavorites);
  };

  const sortedData = [...data].sort((a, b) => {
    let aValue: number, bValue: number;

    switch (sortBy) {
      case "market_cap":
        aValue = a.market_cap || 0;
        bValue = b.market_cap || 0;
        break;
      case "price":
        aValue = a.current_price;
        bValue = b.current_price;
        break;
      case "change":
        aValue = a.price_change_percentage_24h || 0;
        bValue = b.price_change_percentage_24h || 0;
        break;
      default:
        return 0;
    }

    return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
  });

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Cryptocurrency Markets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border rounded-lg animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
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
            <Coins className="h-5 w-5" />
            Cryptocurrency Markets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Coins className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No cryptocurrency data available</p>
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
            <Coins className="h-5 w-5" />
            Cryptocurrency Markets
            <Badge variant="secondary" className="ml-2">
              Live Data
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort("market_cap")}
              className={sortBy === "market_cap" ? "bg-blue-50" : ""}
            >
              Market Cap
              {sortBy === "market_cap" &&
                (sortOrder === "desc" ? (
                  <TrendingDown className="h-3 w-3 ml-1" />
                ) : (
                  <TrendingUp className="h-3 w-3 ml-1" />
                ))}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort("price")}
              className={sortBy === "price" ? "bg-blue-50" : ""}
            >
              Price
              {sortBy === "price" &&
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
          {sortedData.map((coin, index) => {
            const changeData = formatPercentage(
              coin.price_change_percentage_24h || 0
            );
            const ChangeIcon = changeData.icon;
            const isFavorite = favorites.has(coin.id);

            return (
              <div
                key={coin.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 w-6">
                      #{index + 1}
                    </span>
                    <button
                      onClick={() => toggleFavorite(coin.id)}
                      className={`p-1 rounded-full transition-colors ${
                        isFavorite
                          ? "text-yellow-500 hover:text-yellow-600"
                          : "text-gray-400 hover:text-yellow-500"
                      }`}
                    >
                      <Star
                        className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/placeholder-coin.png";
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {coin.name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {coin.symbol}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        Market Cap: {formatCurrency(coin.market_cap || 0)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(coin.current_price)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Vol: {formatCurrency(coin.total_volume || 0)}
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() =>
                        window.open(
                          `https://coingecko.com/en/coins/${coin.id}`,
                          "_blank"
                        )
                      }
                    >
                      <ExternalLink className="h-4 w-4" />
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

        {/* Market Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-gray-500">Total Market Cap</div>
              <div className="font-semibold">
                {formatCurrency(
                  data.reduce((sum, coin) => sum + (coin.market_cap || 0), 0)
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">24h Volume</div>
              <div className="font-semibold">
                {formatCurrency(
                  data.reduce((sum, coin) => sum + (coin.total_volume || 0), 0)
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">Average Change</div>
              <div
                className={`font-semibold ${
                  data.reduce(
                    (sum, coin) =>
                      sum + (coin.price_change_percentage_24h || 0),
                    0
                  ) /
                    data.length >=
                  0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {
                  formatPercentage(
                    data.reduce(
                      (sum, coin) =>
                        sum + (coin.price_change_percentage_24h || 0),
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
