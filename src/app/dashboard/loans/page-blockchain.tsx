"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import LoanRequestModal from "@/components/loan-request-modal";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  Landmark,
  Activity,
  Plus,
  Building,
  CreditCard,
  Percent,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ethers } from "ethers";
import { SUPPORTED_NETWORKS } from "@/lib/web3/blockchain-config";

// Import ABIs
import ViewFacetABI from "@/contracts/abis/ViewFacet.json";
import AuthUserABI from "@/contracts/abis/AuthUser.json";

interface BlockchainLoan {
  loanId: string;
  loanAmount: number;
  startTime: number;
  duration: number;
  interestRate: number;
  totalDebt: number;
  isActive: boolean;
  borrower: string;
  userAccountTokenId: string;
  bufferAmount: number;
  remainingBuffer: number;
  lastPaymentTime: number;
  monthlyPayments: boolean[];
  tokenAddress: string;
  sourceChainSelector: string;
  sourceAddress: string;
  // Calculated fields
  outstandingBalance: number;
  monthlyPayment: number;
  nextPaymentDate: Date;
  paymentProgress: number;
  assetName?: string;
  assetType?: string;
}

function getStatusBadge(status: string) {
  const colors = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    completed: "bg-blue-50 text-blue-700 border-blue-200",
    defaulted: "bg-red-50 text-red-700 border-red-200",
    inactive: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <Badge
      variant="outline"
      className={`${colors[status as keyof typeof colors] || "bg-gray-50 text-gray-700 border-gray-200"} font-medium`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function getDaysUntilPayment(nextPaymentDate: Date): number {
  const today = new Date();
  const diffTime = nextPaymentDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function formatCompactNumber(num: number) {
  if (num >= 1000000000) {
    return `$${(num / 1000000000).toFixed(1)}B`;
  } else if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `$${(num / 1000).toFixed(1)}K`;
  } else {
    return `$${num.toLocaleString()}`;
  }
}

export default function BlockchainLoansPage() {
  const [loans, setLoans] = useState<BlockchainLoan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>("");
  const [networkConfig, setNetworkConfig] = useState(SUPPORTED_NETWORKS.sepolia);

  // Check wallet connection and fetch loans
  useEffect(() => {
    checkWalletAndFetchLoans();
  }, []);

  const checkWalletAndFetchLoans = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          setIsConnected(true);
          const userAddress = accounts[0].address;
          setAddress(userAddress);
          
          // Get current network
          const network = await provider.getNetwork();
          const currentNetwork = Object.values(SUPPORTED_NETWORKS).find(
            net => net.chainId === Number(network.chainId)
          );
          if (currentNetwork) {
            setNetworkConfig(currentNetwork);
          }
          
          // Fetch user loans from blockchain
          await fetchUserLoans(userAddress, provider, currentNetwork || SUPPORTED_NETWORKS.sepolia);
        } else {
          // No wallet connected, show empty state
          setLoans([]);
          setIsLoading(false);
        }
      } catch (error) {
        console.log("No wallet connected, showing empty state");
        setLoans([]);
        setIsLoading(false);
      }
    } else {
      // No MetaMask, show empty state
      setLoans([]);
      setIsLoading(false);
    }
  };

  const fetchUserLoans = async (userAddress: string, provider: ethers.BrowserProvider, network: any) => {
    setIsLoading(true);
    
    try {
      if (!network.contracts?.diamond) {
        console.log("🔧 DEBUG: No diamond contract configured for this network");
        toast.error("No contract deployed on this network. Please switch to a supported network.");
        setLoans([]);
        setIsLoading(false);
        return;
      }

      // Create ViewFacet contract instance
      const viewFacetContract = new ethers.Contract(
        network.contracts.diamond,
        ViewFacetABI,
        provider
      );

      // Create AuthUser contract instance for metadata access
      const authUserContract = new ethers.Contract(
        network.contracts.diamond,
        AuthUserABI,
        provider
      );

      console.log("🔧 DEBUG: Fetching user loans...", {
        userAddress,
        contract: network.contracts.diamond,
        network: network.name,
      });

      // Get user loan IDs
      const loanIds = await viewFacetContract.getUserLoans(userAddress);
      console.log("🔧 DEBUG: User loan IDs:", loanIds);

      if (loanIds.length === 0) {
        console.log("🔧 DEBUG: No loans found for user, using empty state");
        setLoans([]);
        setIsLoading(false);
        return;
      }

      // Fetch details for each loan
      const loanPromises = loanIds.map(async (loanId: bigint) => {
        try {
          // Get loan details from ViewFacet
          const loanData = await viewFacetContract.getLoanById(loanId);
          
          console.log("🔧 DEBUG: Loan data for ID", loanId.toString(), loanData);

          // Calculate derived values
          const loanAmount = Number(ethers.formatEther(loanData.loanAmount));
          const totalDebt = Number(ethers.formatEther(loanData.totalDebt));
          const currentTime = Math.floor(Date.now() / 1000);
          const loanStartTime = Number(loanData.startTime);
          const loanDuration = Number(loanData.duration);
          const interestRate = Number(loanData.interestRate) / 100; // Convert from basis points to percentage
          
          // Calculate current outstanding balance
          const timeElapsed = currentTime - loanStartTime;
          const timeElapsedInYears = timeElapsed / (365 * 24 * 60 * 60);
          const currentInterest = loanAmount * (interestRate / 100) * timeElapsedInYears;
          const outstandingBalance = Math.min(loanAmount + currentInterest, totalDebt);
          
          // Calculate monthly payment (simple calculation - can be improved)
          const loanTermMonths = loanDuration / (30 * 24 * 60 * 60); // Convert seconds to months
          const monthlyPayment = totalDebt / loanTermMonths;
          
          // Calculate payment progress
          const paymentProgress = ((totalDebt - outstandingBalance) / totalDebt) * 100;
          
          // Calculate next payment date
          const monthsElapsed = Math.floor(timeElapsed / (30 * 24 * 60 * 60));
          const nextPaymentTime = loanStartTime + ((monthsElapsed + 1) * 30 * 24 * 60 * 60);
          const nextPaymentDate = new Date(nextPaymentTime * 1000);
          
          // Try to get asset details if we have the userAccountTokenId
          let assetName = "Unknown Asset";
          let assetType = "Unknown";
          
          try {
            if (loanData.userAccountTokenId) {
              const tokenURI = await authUserContract.tokenURI(loanData.userAccountTokenId);
              if (tokenURI) {
                let metadata = null;
                if (tokenURI.startsWith('data:application/json;base64,')) {
                  const base64Data = tokenURI.split(',')[1];
                  metadata = JSON.parse(atob(base64Data));
                } else if (tokenURI.startsWith('http')) {
                  try {
                    const response = await fetch(tokenURI);
                    metadata = await response.json();
                  } catch (fetchError) {
                    console.log("Could not fetch metadata from URL");
                  }
                }
                
                if (metadata) {
                  assetName = metadata.name || `Asset #${loanData.userAccountTokenId}`;
                  const assetTypeFromMetadata = metadata.attributes?.find((attr: any) => 
                    attr.trait_type === "Asset Type" || attr.trait_type === "Type"
                  )?.value;
                  assetType = assetTypeFromMetadata || "Unknown";
                }
              }
            }
          } catch (error) {
            console.log("Could not fetch asset metadata:", error);
          }

          const loan: BlockchainLoan = {
            loanId: loanId.toString(),
            loanAmount,
            startTime: loanStartTime,
            duration: loanDuration,
            interestRate,
            totalDebt,
            isActive: loanData.isActive,
            borrower: loanData.borrower,
            userAccountTokenId: loanData.userAccountTokenId.toString(),
            bufferAmount: Number(ethers.formatEther(loanData.bufferAmount)),
            remainingBuffer: Number(ethers.formatEther(loanData.remainingBuffer)),
            lastPaymentTime: Number(loanData.lastPaymentTime),
            monthlyPayments: loanData.monthlyPayments,
            tokenAddress: loanData.tokenAddress,
            sourceChainSelector: loanData.sourceChainSelector.toString(),
            sourceAddress: loanData.sourceAddress,
            // Calculated fields
            outstandingBalance,
            monthlyPayment,
            nextPaymentDate,
            paymentProgress,
            assetName,
            assetType,
          };

          return loan;
        } catch (error) {
          console.error("Error fetching loan details for ID", loanId.toString(), error);
          return null;
        }
      });

      const fetchedLoans = (await Promise.all(loanPromises)).filter(Boolean) as BlockchainLoan[];
      
      console.log("🔧 DEBUG: Final fetched loans:", fetchedLoans);
      setLoans(fetchedLoans);

    } catch (error) {
      console.error("Error fetching user loans:", error);
      toast.error("Failed to fetch loans from blockchain");
      setLoans([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate summary statistics
  const totalLoanAmount = loans.reduce((sum, loan) => sum + loan.loanAmount, 0);
  const totalOutstanding = loans.reduce((sum, loan) => sum + loan.outstandingBalance, 0);
  const totalMonthlyPayments = loans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);
  const activeLoans = loans.filter((loan) => loan.isActive).length;

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 animate-fadeIn">
        <div className="space-y-8">
          {/* Header */}
          <div className="px-6 py-8">
            <div className="w-full">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                      Loan Management
                    </h1>
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Track your on-chain loans and payment schedules
                  </p>
                  <div className="flex items-center gap-4 pt-2">
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {activeLoans} Active
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-blue-700 border-blue-200"
                    >
                      <DollarSign className="h-3 w-3 mr-1" />
                      {formatCompactNumber(totalOutstanding)} Outstanding
                    </Badge>
                    {!isConnected && (
                      <Badge
                        variant="outline"
                        className="text-yellow-700 border-yellow-200"
                      >
                        <Wallet className="h-3 w-3 mr-1" />
                        Wallet Disconnected
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <LoanRequestModal>
                    <Button
                      variant="outline"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                      disabled={!isConnected}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Request Loan
                    </Button>
                  </LoanRequestModal>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 space-y-8">
            <div className="w-full space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-blue-600 flex items-center gap-2 uppercase tracking-wide">
                      <Landmark className="h-4 w-4" />
                      Active Loans
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                      {activeLoans}
                    </p>
                    <div className="flex items-center gap-1 text-blue-600 mt-2">
                      <Activity className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Currently Active
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-emerald-600 flex items-center gap-2 uppercase tracking-wide">
                      <DollarSign className="h-4 w-4" />
                      Total Borrowed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                      {formatCompactNumber(totalLoanAmount)}
                    </p>
                    <div className="flex items-center gap-1 text-emerald-600 mt-2">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">Total Amount</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-purple-600 flex items-center gap-2 uppercase tracking-wide">
                      <CreditCard className="h-4 w-4" />
                      Outstanding
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                      {formatCompactNumber(totalOutstanding)}
                    </p>
                    <div className="flex items-center gap-1 text-purple-600 mt-2">
                      <Building className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Remaining Balance
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-orange-600 flex items-center gap-2 uppercase tracking-wide">
                      <Calendar className="h-4 w-4" />
                      Monthly Payments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                      {formatCompactNumber(totalMonthlyPayments)}
                    </p>
                    <div className="flex items-center gap-1 text-orange-600 mt-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">Per Month</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Loans List */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-xl">Your On-Chain Loans</CardTitle>
                  <CardDescription className="text-base">
                    All your blockchain-based loans with real-time data
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  {isLoading ? (
                    <div className="space-y-8">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="border-0 shadow-md bg-white/80 backdrop-blur-sm animate-pulse">
                          <CardHeader className="pb-4 border-b border-gray-100">
                            <div className="flex items-start justify-between">
                              <div className="space-y-3">
                                <div className="h-8 bg-gray-200 rounded w-48"></div>
                                <div className="h-5 bg-gray-200 rounded w-64"></div>
                              </div>
                              <div className="flex gap-2">
                                <div className="h-6 bg-gray-200 rounded w-16"></div>
                                <div className="h-6 bg-gray-200 rounded w-16"></div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-8 p-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                              {[1, 2, 3, 4].map((j) => (
                                <div key={j} className="border border-gray-200 bg-gray-50 rounded-lg p-4">
                                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                                </div>
                              ))}
                            </div>
                            <div className="h-20 bg-gray-200 rounded"></div>
                            <div className="h-20 bg-gray-200 rounded"></div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : loans && loans.length > 0 ? (
                    <div className="space-y-8">
                      {loans.map((loan) => {
                        const daysUntilPayment = getDaysUntilPayment(loan.nextPaymentDate);
                        const isPaymentDue = daysUntilPayment <= 7;

                        return (
                          <Card
                            key={loan.loanId}
                            className={`border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200 ${
                              isPaymentDue
                                ? "ring-2 ring-yellow-200 bg-yellow-50/30"
                                : ""
                            }`}
                          >
                            <CardHeader className="pb-4 border-b border-gray-100">
                              <div className="flex items-start justify-between">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-3">
                                    <CardTitle className="text-2xl bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                                      {formatCompactNumber(loan.loanAmount)} Loan
                                    </CardTitle>
                                    {getStatusBadge(loan.isActive ? "active" : "inactive")}
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-gray-50/80 text-gray-700 border-gray-200"
                                    >
                                      {networkConfig.name}
                                    </Badge>
                                  </div>
                                  <CardDescription className="flex items-center gap-2 text-base">
                                    <Landmark className="h-5 w-5" />
                                    Collateral: {loan.assetName} ({loan.assetType})
                                  </CardDescription>
                                </div>
                                {isPaymentDue && (
                                  <Badge
                                    variant="outline"
                                    className="bg-yellow-50 text-yellow-700 border-yellow-200"
                                  >
                                    <Clock className="h-4 w-4 mr-2" />
                                    Payment Due
                                  </Badge>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-8 p-8">
                              {/* Loan Details Grid */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="border border-purple-200 bg-purple-50/30 rounded-lg p-4">
                                  <p className="text-sm font-semibold text-purple-600 mb-2 uppercase tracking-wide">
                                    Outstanding Balance
                                  </p>
                                  <p className="font-bold text-xl text-gray-900">
                                    {formatCompactNumber(loan.outstandingBalance)}
                                  </p>
                                </div>
                                <div className="border border-blue-200 bg-blue-50/30 rounded-lg p-4">
                                  <p className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide">
                                    Interest Rate
                                  </p>
                                  <p className="font-bold text-xl text-gray-900 flex items-center gap-1">
                                    <Percent className="h-4 w-4" />
                                    {loan.interestRate.toFixed(2)}%
                                  </p>
                                </div>
                                <div className="border border-emerald-200 bg-emerald-50/30 rounded-lg p-4">
                                  <p className="text-sm font-semibold text-emerald-600 mb-2 uppercase tracking-wide">
                                    Monthly Payment
                                  </p>
                                  <p className="font-bold text-xl text-gray-900">
                                    {formatCompactNumber(loan.monthlyPayment)}
                                  </p>
                                </div>
                                <div className="border border-orange-200 bg-orange-50/30 rounded-lg p-4">
                                  <p className="text-sm font-semibold text-orange-600 mb-2 uppercase tracking-wide">
                                    Term
                                  </p>
                                  <p className="font-bold text-xl text-gray-900">
                                    {Math.round(loan.duration / (30 * 24 * 60 * 60))} months
                                  </p>
                                </div>
                              </div>

                              {/* Payment Progress */}
                              <div className="space-y-4 border border-gray-200 bg-gray-50/30 rounded-lg p-6">
                                <div className="flex justify-between items-center">
                                  <span className="text-base font-semibold text-gray-700">
                                    Loan Progress
                                  </span>
                                  <span className="text-base font-bold text-emerald-600">
                                    {loan.paymentProgress.toFixed(1)}% paid
                                  </span>
                                </div>
                                <Progress
                                  value={loan.paymentProgress}
                                  className="h-4"
                                />
                                <div className="flex justify-between text-sm text-muted-foreground">
                                  <span>
                                    Paid: {formatCompactNumber(loan.totalDebt - loan.outstandingBalance)}
                                  </span>
                                  <span>
                                    Remaining: {formatCompactNumber(loan.outstandingBalance)}
                                  </span>
                                </div>
                              </div>

                              {/* Next Payment Info */}
                              <div
                                className={`p-6 rounded-xl border transition-all duration-200 ${
                                  isPaymentDue
                                    ? "bg-yellow-50/50 border-yellow-200 shadow-md"
                                    : "bg-blue-50/30 border-blue-200"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="space-y-2">
                                    <p className="font-semibold text-lg flex items-center gap-2">
                                      <Calendar className="h-5 w-5" />
                                      Next Payment Due
                                    </p>
                                    <p className="text-base text-muted-foreground">
                                      {loan.nextPaymentDate.toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })}{" "}
                                      (
                                      {daysUntilPayment > 0
                                        ? `${daysUntilPayment} days`
                                        : "Today"}
                                      )
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-2xl text-gray-900 mb-3">
                                      {formatCompactNumber(loan.monthlyPayment)}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="text-sm text-muted-foreground pt-2 border-t border-gray-200">
                                Loan originated{" "}
                                {new Date(loan.startTime * 1000).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                                {" • "}
                                Loan ID: {loan.loanId}
                                {" • "}
                                Token ID: {loan.userAccountTokenId}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Landmark className="h-20 w-20 mx-auto mb-6 text-muted-foreground opacity-40" />
                      <h3 className="text-2xl font-bold mb-3 text-gray-900">
                        {!isConnected ? "Connect Your Wallet" : "No loans found"}
                      </h3>
                      <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
                        {!isConnected 
                          ? "Connect your wallet to view your on-chain loans and manage payments"
                          : "Use your tokenized assets as collateral to secure your first loan and unlock liquidity"
                        }
                      </p>
                      {!isConnected ? (
                        <Button
                          size="lg"
                          variant="outline"
                          className="border-blue-200 text-blue-700 hover:bg-blue-50 shadow-sm hover:shadow-md transition-all duration-200"
                          onClick={() => {
                            if (window.ethereum) {
                              window.ethereum.request({ method: 'eth_requestAccounts' })
                                .then(() => checkWalletAndFetchLoans());
                            }
                          }}
                        >
                          <Wallet className="h-5 w-5 mr-2" />
                          Connect Wallet
                        </Button>
                      ) : (
                        <LoanRequestModal>
                          <Button
                            size="lg"
                            variant="outline"
                            className="border-blue-200 text-blue-700 hover:bg-blue-50 shadow-sm hover:shadow-md transition-all duration-200"
                          >
                            <Plus className="h-5 w-5 mr-2" />
                            Request Your First Loan
                          </Button>
                        </LoanRequestModal>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
