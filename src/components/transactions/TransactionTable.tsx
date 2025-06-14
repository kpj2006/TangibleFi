"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Transaction,
  TransactionFilters,
} from "../../hooks/use-transaction-data";
import {
  Search,
  Filter,
  Download,
  ExternalLink,
  Copy,
  Eye,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Activity,
  Zap,
  ShoppingCart,
  Wallet,
  Building,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface TransactionTableProps {
  transactions: Transaction[];
  filters: TransactionFilters;
  loading?: boolean;
  onFiltersChange: (filters: Partial<TransactionFilters>) => void;
  onExport?: () => void;
  className?: string;
}

export function TransactionTable({
  transactions,
  filters,
  loading = false,
  onFiltersChange,
  onExport,
  className = "",
}: TransactionTableProps) {
  const [sortBy, setSortBy] = useState<"date" | "amount" | "fee">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const formatCurrency = (amount: number, currency: string = "USD") => {
    if (currency === "ETH") {
      return `${amount.toFixed(4)} ETH`;
    }
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(2)}K`;
    }
    return `$${amount.toFixed(2)}`;
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      tokenization: Building,
      loan: DollarSign,
      repayment: ArrowDown,
      transfer: ArrowUpDown,
      withdrawal: ArrowUp,
      deposit: ArrowDown,
      trade: ShoppingCart,
    };
    return iconMap[type] || Activity;
  };

  const getTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      tokenization: "text-blue-600 bg-blue-100",
      loan: "text-purple-600 bg-purple-100",
      repayment: "text-green-600 bg-green-100",
      transfer: "text-orange-600 bg-orange-100",
      withdrawal: "text-red-600 bg-red-100",
      deposit: "text-emerald-600 bg-emerald-100",
      trade: "text-pink-600 bg-pink-100",
    };
    return colorMap[type] || "text-gray-600 bg-gray-100";
  };

  const handleSort = (column: "date" | "amount" | "fee") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openBlockchainExplorer = (
    hash: string,
    blockchain: string = "ethereum"
  ) => {
    const explorerUrls: Record<string, string> = {
      ethereum: "https://etherscan.io/tx/",
      polygon: "https://polygonscan.com/tx/",
      bsc: "https://bscscan.com/tx/",
    };
    const baseUrl = explorerUrls[blockchain] || explorerUrls.ethereum;
    window.open(`${baseUrl}${hash}`, "_blank");
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    let aValue: number | string, bValue: number | string;

    switch (sortBy) {
      case "amount":
        aValue = a.amount;
        bValue = b.amount;
        break;
      case "fee":
        aValue = a.fee;
        bValue = b.fee;
        break;
      case "date":
      default:
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Transaction History
            <Badge variant="secondary" className="ml-2">
              {transactions.length} Total
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort("date")}
              className={sortBy === "date" ? "bg-blue-50" : ""}
            >
              Date
              {sortBy === "date" &&
                (sortOrder === "desc" ? (
                  <TrendingDown className="h-3 w-3 ml-1" />
                ) : (
                  <TrendingUp className="h-3 w-3 ml-1" />
                ))}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort("amount")}
              className={sortBy === "amount" ? "bg-blue-50" : ""}
            >
              Amount
              {sortBy === "amount" &&
                (sortOrder === "desc" ? (
                  <TrendingDown className="h-3 w-3 ml-1" />
                ) : (
                  <TrendingUp className="h-3 w-3 ml-1" />
                ))}
            </Button>
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search transactions, assets, or hash..."
                value={filters.search_term}
                onChange={(e) =>
                  onFiltersChange({ search_term: e.target.value })
                }
                className="pl-10"
              />
            </div>
          </div>
          <Select
            value={filters.type}
            onValueChange={(value) => onFiltersChange({ type: value })}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Transaction Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="tokenization">Tokenization</SelectItem>
              <SelectItem value="loan">Loan</SelectItem>
              <SelectItem value="repayment">Repayment</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="withdrawal">Withdrawal</SelectItem>
              <SelectItem value="deposit">Deposit</SelectItem>
              <SelectItem value="trade">Trade</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.status}
            onValueChange={(value) => onFiltersChange({ status: value })}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.date_range}
            onValueChange={(value) => onFiltersChange({ date_range: value })}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transaction List */}
        <div className="space-y-2">
          {sortedTransactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Activity className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">
                No Transactions Found
              </h3>
              <p className="text-sm">
                {filters.search_term ||
                filters.type !== "all" ||
                filters.status !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "Your transaction history will appear here once you start using the platform."}
              </p>
            </div>
          ) : (
            sortedTransactions.map((transaction) => {
              const TypeIcon = getTypeIcon(transaction.type);
              const typeColor = getTypeColor(transaction.type);

              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColor}`}
                    >
                      <TypeIcon className="h-5 w-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {transaction.description}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getStatusColor(transaction.status)}`}
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{formatDate(transaction.created_at)}</span>
                        {transaction.asset_name && (
                          <>
                            <span>•</span>
                            <span>{transaction.asset_name}</span>
                          </>
                        )}
                        {transaction.blockchain && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              {transaction.blockchain}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(
                          transaction.amount,
                          transaction.currency
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Fee: {formatCurrency(transaction.fee)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {transaction.transaction_hash && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              copyToClipboard(transaction.transaction_hash!)
                            }
                            title="Copy transaction hash"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              openBlockchainExplorer(
                                transaction.transaction_hash!,
                                transaction.blockchain
                              )
                            }
                            title="View on blockchain explorer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Transaction Summary */}
        {sortedTransactions.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-gray-500">Filtered Results</div>
                <div className="font-semibold">{sortedTransactions.length}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">Total Volume</div>
                <div className="font-semibold">
                  {formatCurrency(
                    sortedTransactions.reduce((sum, t) => sum + t.amount, 0)
                  )}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">Total Fees</div>
                <div className="font-semibold">
                  {formatCurrency(
                    sortedTransactions.reduce((sum, t) => sum + t.fee, 0)
                  )}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">Success Rate</div>
                <div className="font-semibold text-green-600">
                  {(
                    (sortedTransactions.filter((t) => t.status === "completed")
                      .length /
                      sortedTransactions.length) *
                    100
                  ).toFixed(1)}
                  %
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
