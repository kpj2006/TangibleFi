"use client";

import { useState } from "react";
import { useTransactionData } from "../../../hooks/use-transaction-data";
import { TransactionStatsCards } from "../../../components/transactions/TransactionStatsCards";
import { TransactionTable } from "../../../components/transactions/TransactionTable";
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
  Calendar,
  AlertCircle,
  Zap,
  Clock,
  Activity,
  TrendingUp,
  Filter,
} from "lucide-react";

export default function TransactionsPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const transactionData = useTransactionData();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    transactionData.refreshData();
    // Add a small delay for better UX
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const handleExport = () => {
    // Create comprehensive transaction data CSV
    const csvData = [
      ["Transaction History Export"],
      ["Export Date", new Date().toISOString()],
      [
        "Total Transactions",
        transactionData.stats.total_transactions.toString(),
      ],
      ["Total Volume", transactionData.stats.total_volume.toString()],
      ["Success Rate", transactionData.stats.success_rate.toString()],
      ["Average Fee", transactionData.stats.average_fee.toString()],
      [""],
      ["Transaction Details"],
      [
        "ID",
        "Type",
        "Status",
        "Amount",
        "Currency",
        "Fee",
        "Asset Name",
        "Description",
        "Blockchain",
        "Transaction Hash",
        "Block Number",
        "Gas Used",
        "Gas Price",
        "Created At",
        "Updated At",
      ],
      ...transactionData.filteredTransactions.map((tx) => [
        tx.id,
        tx.type,
        tx.status,
        tx.amount.toString(),
        tx.currency,
        tx.fee.toString(),
        tx.asset_name || "",
        tx.description,
        tx.blockchain || "",
        tx.transaction_hash || "",
        tx.block_number?.toString() || "",
        tx.gas_used?.toString() || "",
        tx.gas_price?.toString() || "",
        tx.created_at,
        tx.updated_at,
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transaction-history-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Transaction History
          </h1>
          <p className="text-gray-600 mt-2">
            Track all your asset transactions and blockchain activities
          </p>
          {transactionData.last_updated && (
            <div className="flex items-center gap-2 mt-1">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                Last updated:{" "}
                {transactionData.last_updated.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleRefresh}
            disabled={isRefreshing || transactionData.loading}
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleExport}
            disabled={transactionData.loading}
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date Range
          </Button>
        </div>
      </div>

      {/* Error State */}
      {transactionData.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">
                Error loading transaction data
              </span>
            </div>
            <p className="text-red-600 text-sm mt-1">{transactionData.error}</p>
          </CardContent>
        </Card>
      )}

      {/* Real-time Status Indicator */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <Zap className="h-4 w-4 text-green-600" />
                <span className="font-medium text-gray-900">
                  Live Transaction Tracking
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Real-time blockchain monitoring • Auto-sync with database
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Activity className="h-4 w-4 text-blue-500" />
                <span className="text-blue-600 font-medium">
                  {transactionData.stats.total_transactions} Transactions
                </span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="text-purple-600 font-medium">
                  {formatCurrency(transactionData.stats.total_volume)} Volume
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Statistics Cards */}
      <TransactionStatsCards
        stats={transactionData.stats}
        loading={transactionData.loading}
      />

      {/* Active Filters Display */}
      {(transactionData.filters.type !== "all" ||
        transactionData.filters.status !== "all" ||
        transactionData.filters.date_range !== "all" ||
        transactionData.filters.search_term) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Active Filters:
                </span>
                <div className="flex items-center gap-2">
                  {transactionData.filters.type !== "all" && (
                    <Badge variant="secondary">
                      Type: {transactionData.filters.type}
                    </Badge>
                  )}
                  {transactionData.filters.status !== "all" && (
                    <Badge variant="secondary">
                      Status: {transactionData.filters.status}
                    </Badge>
                  )}
                  {transactionData.filters.date_range !== "all" && (
                    <Badge variant="secondary">
                      Range: {transactionData.filters.date_range}
                    </Badge>
                  )}
                  {transactionData.filters.search_term && (
                    <Badge variant="secondary">
                      Search: "{transactionData.filters.search_term}"
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  transactionData.updateFilters({
                    type: "all",
                    status: "all",
                    date_range: "all",
                    search_term: "",
                    min_amount: 0,
                    max_amount: 0,
                  })
                }
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction Table */}
      <TransactionTable
        transactions={transactionData.filteredTransactions}
        filters={transactionData.filters}
        loading={transactionData.loading}
        onFiltersChange={transactionData.updateFilters}
        onExport={handleExport}
      />

      {/* Transaction Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Types Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Transaction Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(
                transactionData.transactions.reduce(
                  (acc, tx) => {
                    acc[tx.type] = (acc[tx.type] || 0) + 1;
                    return acc;
                  },
                  {} as Record<string, number>
                )
              ).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium capitalize">
                      {type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{count}</span>
                    <span className="text-xs text-gray-400">
                      (
                      {(
                        (count / transactionData.transactions.length) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last 24 Hours</span>
                <span className="font-semibold">
                  {
                    transactionData.transactions.filter((tx) => {
                      const txDate = new Date(tx.created_at);
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      return txDate >= yesterday;
                    }).length
                  }{" "}
                  transactions
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last 7 Days</span>
                <span className="font-semibold">
                  {
                    transactionData.transactions.filter((tx) => {
                      const txDate = new Date(tx.created_at);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return txDate >= weekAgo;
                    }).length
                  }{" "}
                  transactions
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="font-semibold text-green-600">
                  {transactionData.stats.success_rate.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Fee</span>
                <span className="font-semibold">
                  {formatCurrency(transactionData.stats.average_fee)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
