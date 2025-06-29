"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Wallet,
  Plus,
  ArrowRight,
  Banknote,
  Target,
  Activity,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { SubmitButton } from "@/components/submit-button";
import {
  SUPPORTED_NETWORKS,
  CONTRACT_ABIS,
  POPULAR_TOKENS,
  getNetworkConfig,
} from "@/lib/web3/blockchain-config";

// On-chain loan data structures
interface LoanData {
  loanId: number;
  borrower: string;
  userAccountTokenId: number;
  loanAmount: number;
  totalDebt: number;
  tokenAddress: string;
  duration: number;
  interestRate: number;
  startTime: number;
  lastPaymentTime: number;
  remainingBuffer: number;
  isActive: boolean;
  monthlyPayments: boolean[];
  // Additional token info for proper display
  tokenSymbol?: string;
  tokenDecimals?: number;
  monthlyPayment?: number;
}

interface PaymentTransaction {
  hash: string;
  loanId: number;
  amount: string;
  token: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  gasUsed?: string;
}

interface NetworkInfo {
  chainId: number;
  name: string;
  symbol: string;
  isConnected: boolean;
}

interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance?: string;
  rate?: number; // Exchange rate to USD
}

// Blockchain data fetching functions
const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
};

const getContract = (contractAddress: string, abi: any, provider: any) => {
  return new ethers.Contract(contractAddress, abi, provider);
};

const fetchUserLoans = async (
  userAddress: string,
  provider: ethers.BrowserProvider
): Promise<LoanData[]> => {
  try {
    const signer = await provider.getSigner();
    const network = await provider.getNetwork();
    const networkConfig = getNetworkConfig(Number(network.chainId));
    
    if (!networkConfig?.contracts?.diamond) {
      console.warn('No diamond contract address for network:', network.chainId);
      return [];
    }

    const viewFacet = getContract(
      networkConfig.contracts.diamond,
      CONTRACT_ABIS.ViewFacet,
      signer
    );

    // Get user loan IDs
    const loanIds = await viewFacet.getUserLoans(userAddress);
    const loans: LoanData[] = [];

    for (const loanId of loanIds) {
      try {
        const loanData = await viewFacet.getLoanById(Number(loanId));
        
        // Get token decimals for proper formatting
        let tokenDecimals = 18; // Default to 18
        let tokenSymbol = "Unknown";
        
        try {
          if (loanData.tokenAddress && loanData.tokenAddress !== ethers.ZeroAddress) {
            const tokenContract = new ethers.Contract(
              loanData.tokenAddress,
              [
                'function decimals() view returns (uint8)',
                'function symbol() view returns (string)'
              ],
              provider
            );
            tokenDecimals = await tokenContract.decimals();
            tokenSymbol = await tokenContract.symbol();
            console.log(`Found token ${tokenSymbol} with ${tokenDecimals} decimals at ${loanData.tokenAddress}`);
          }
        } catch (tokenError) {
          console.warn(`Error fetching token info for ${loanData.tokenAddress}:`, tokenError);
          // Keep defaults
        }

        const loanAmountFormatted = Number(ethers.formatUnits(loanData.loanAmount, tokenDecimals));
        const totalDebtFormatted = Number(ethers.formatUnits(loanData.totalDebt, tokenDecimals));
        const remainingBufferFormatted = Number(ethers.formatUnits(loanData.remainingBuffer, tokenDecimals));

        console.log(`Loan ${loanId} data:`, {
          loanAmount: loanAmountFormatted,
          totalDebt: totalDebtFormatted,
          remainingBuffer: remainingBufferFormatted,
          tokenSymbol,
          tokenDecimals,
          rawLoanAmount: loanData.loanAmount.toString(),
          rawTotalDebt: loanData.totalDebt.toString()
        });

        loans.push({
          loanId: Number(loanData.loanId),
          borrower: loanData.borrower,
          userAccountTokenId: Number(loanData.userAccountTokenId),
          loanAmount: loanAmountFormatted,
          totalDebt: totalDebtFormatted,
          tokenAddress: loanData.tokenAddress,
          duration: Number(loanData.duration),
          interestRate: Number(loanData.interestRate),
          startTime: Number(loanData.startTime),
          lastPaymentTime: Number(loanData.lastPaymentTime),
          remainingBuffer: remainingBufferFormatted,
          isActive: loanData.isActive,
          monthlyPayments: loanData.monthlyPayments,
          // Add token info for display
          tokenSymbol: tokenSymbol,
          tokenDecimals: tokenDecimals,
          monthlyPayment: loanData.monthlyPayment,
        });
      } catch (error) {
        console.error(`Error fetching loan ${loanId}:`, error);
      }
    }

    return loans;
  } catch (error) {
    console.error('Error fetching user loans:', error);
    return [];
  }
};

const fetchPaymentHistory = async (
  userAddress: string,
  provider: ethers.BrowserProvider,
  loans: LoanData[]
): Promise<PaymentTransaction[]> => {
  try {
    const network = await provider.getNetwork();
    const networkConfig = getNetworkConfig(Number(network.chainId));
    
    if (!networkConfig?.contracts?.diamond) {
      return [];
    }

    // Get recent payment events from the blockchain
    const contract = getContract(
      networkConfig.contracts.diamond,
      CONTRACT_ABIS.AutomationLoan,
      provider
    );

    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 10000); // Last ~10k blocks

    try {
      const filter = contract.filters.EMIPaid();
      const events = await contract.queryFilter(filter, fromBlock, currentBlock);
      
      const payments: PaymentTransaction[] = [];
      
      for (const event of events) {
        // Type guard to check if event is EventLog
        if ('args' in event && event.args) {
          const block = await provider.getBlock(event.blockNumber);
          const loanId = Number(event.args.loanId);
          // Find the loan to get token info
          const loan = loans.find(l => l.loanId === loanId);
          let tokenSymbol = 'Unknown';
          let tokenDecimals = 18;
          if (loan) {
            tokenSymbol = loan.tokenSymbol || 'Unknown';
            tokenDecimals = loan.tokenDecimals || 18;
          }
          payments.push({
            hash: event.transactionHash,
            loanId: loanId,
            amount: ethers.formatUnits(event.args.amount, tokenDecimals),
            token: tokenSymbol,
            timestamp: block ? block.timestamp : 0,
            status: 'confirmed',
            blockNumber: event.blockNumber,
            gasUsed: '0',
          });
        }
      }

      return payments.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error fetching payment events:', error);
      return [];
    }
  } catch (error) {
    console.error('Error in fetchPaymentHistory:', error);
    return [];
  }
};

const getAvailableTokens = (chainId: number): TokenInfo[] => {
  const networkName = Object.keys(SUPPORTED_NETWORKS).find(
    name => SUPPORTED_NETWORKS[name].chainId === chainId
  );
  
  if (!networkName || !POPULAR_TOKENS[networkName]) {
    return [];
  }
  
  return POPULAR_TOKENS[networkName];
};

const fetchTokenPrices = async (tokens: TokenInfo[]): Promise<Record<string, number>> => {
  // For demo purposes, using mock exchange rates
  // In production, this would fetch from a price oracle or API
  const mockRates: Record<string, number> = {
    'USDC': 1.0,
    'USDT': 1.0,
    'DAI': 1.0,
    'ETH': 0.0004, // 1 USD = 0.0004 ETH (approximate)
    'BTC': 0.000023, // 1 USD = 0.000023 BTC (approximate)
    'MATIC': 1.25, // 1 USD = 1.25 MATIC (approximate)
  };
  
  const rates: Record<string, number> = {};
  tokens.forEach(token => {
    rates[token.symbol] = mockRates[token.symbol] || 1.0;
  });
  
  return rates;
};

function getStatusBadge(status: string) {
  const colors = {
    confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    failed: "bg-red-50 text-red-700 border-red-200",
  };

  const icons = {
    confirmed: CheckCircle,
    pending: Clock,
    failed: AlertTriangle,
  };

  const Icon = icons[status as keyof typeof icons] || Clock;

  return (
    <Badge
      variant="outline"
      className={`${colors[status as keyof typeof colors] || "bg-gray-50 text-gray-700 border-gray-200"} font-medium flex items-center gap-1`}
    >
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loans, setLoans] = useState<LoanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userAddress, setUserAddress] = useState<string>("");
  const [selectedLoanId, setSelectedLoanId] = useState<string>("");
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [availableTokens, setAvailableTokens] = useState<TokenInfo[]>([]);
  const [tokenRates, setTokenRates] = useState<Record<string, number>>({});
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // Payment summary calculations
  const totalPaid = useMemo(() => {
    return payments
      .filter((p) => p.status === "confirmed")
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
  }, [payments]);

  const completedPayments = useMemo(() => {
    return payments.filter((p) => p.status === "confirmed").length;
  }, [payments]);

  const pendingPayments = useMemo(() => {
    return payments.filter((p) => p.status === "pending").length;
  }, [payments]);

  const thisMonthPaid = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    return payments
      .filter(
        (p) =>
          p.status === "confirmed" &&
          new Date(p.timestamp * 1000).getMonth() === thisMonth &&
          new Date(p.timestamp * 1000).getFullYear() === thisYear
      )
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
  }, [payments]);

  useEffect(() => {
    const loadBlockchainData = async () => {
      setLoading(true);

      try {
        const provider = getProvider();
        if (!provider) {
          toast({
            title: "Wallet Not Connected",
            description: "Please connect your MetaMask wallet to view payments.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Get user address
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setUserAddress(address);
        setIsWalletConnected(true);

        // Get network info
        const network = await provider.getNetwork();
        const networkConfig = getNetworkConfig(Number(network.chainId));
        
        if (networkConfig) {
          setNetworkInfo({
            chainId: Number(network.chainId),
            name: networkConfig.name,
            symbol: networkConfig.symbol,
            isConnected: true,
          });

          // Get available tokens for this network
          const tokens = getAvailableTokens(Number(network.chainId));
          setAvailableTokens(tokens);

          // Fetch token rates
          const rates = await fetchTokenPrices(tokens);
          setTokenRates(rates);

          // Set default selections
          if (tokens.length > 0) {
            setSelectedToken(tokens[0].symbol);
          }
          setSelectedNetwork(networkConfig.name);
        }

        // Load user loans from blockchain
        const userLoans = await fetchUserLoans(address, provider);
        setLoans(userLoans);

        // Load payment history from blockchain (pass loans for token info)
        const userPayments = await fetchPaymentHistory(address, provider, userLoans);
        setPayments(userPayments);

        // Check if there's a specific loan ID in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const loanParam = urlParams.get("loan");
        if (loanParam && userLoans?.find((loan) => loan.loanId.toString() === loanParam)) {
          setSelectedLoanId(loanParam);
        }

      } catch (error) {
        console.error("Error loading blockchain data:", error);
        toast({
          title: "Error Loading Data",
          description: "Failed to load blockchain data. Please check your wallet connection.",
          variant: "destructive",
        });
      }

      setLoading(false);
    };

    loadBlockchainData();
  }, [router]);

  const handlePayment = async (formData: FormData) => {
    if (!userAddress || !isWalletConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to make a payment.",
        variant: "destructive",
      });
      return;
    }

    const loanId = formData.get("loan_id") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const paymentType = formData.get("payment_type") as string;
    const cryptoCurrency = formData.get("crypto_currency") as string;

    if (!loanId || !amount || !cryptoCurrency) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const provider = getProvider();
      if (!provider) {
        throw new Error("No wallet provider found");
      }

      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const networkConfig = getNetworkConfig(Number(network.chainId));
      
      if (!networkConfig?.contracts?.diamond) {
        throw new Error("No contract address found for this network");
      }

      const automationLoanContract = getContract(
        networkConfig.contracts.diamond,
        CONTRACT_ABIS.AutomationLoan,
        signer
      );

      // Get the selected token details
      const selectedTokenInfo = availableTokens.find(t => t.symbol === cryptoCurrency);
      if (!selectedTokenInfo) {
        throw new Error("Selected token not found");
      }

      // Calculate payment amount in token units
      const tokenAmount = ethers.parseUnits(
        (amount * (tokenRates[cryptoCurrency] || 1)).toString(),
        selectedTokenInfo.decimals
      );

      // Pre-check: Find the selected loan and validate
      const selectedLoan = loans.find(l => l.loanId.toString() === loanId);
      if (!selectedLoan) {
        toast({
          title: "Invalid Loan",
          description: "Selected loan not found or not active.",
          variant: "destructive",
        });
        return;
      }
      if (!selectedLoan.isActive) {
        toast({
          title: "Inactive Loan",
          description: "This loan is not active.",
          variant: "destructive",
        });
        return;
      }
      if (amount <= 0 || isNaN(amount)) {
        toast({
          title: "Invalid Amount",
          description: "Payment amount must be greater than zero.",
          variant: "destructive",
        });
        return;
      }

      // 1. Check allowance
      const tokenContract = new ethers.Contract(
        selectedTokenInfo.address,
        [
          'function allowance(address owner, address spender) view returns (uint256)',
          'function approve(address spender, uint256 amount) returns (bool)'
        ],
        signer
      );
      const allowance = await tokenContract.allowance(userAddress, networkConfig.contracts.diamond);
      if (allowance < tokenAmount) {
        toast({
          title: "Approval Required",
          description: `Approving ${cryptoCurrency} for payment...`,
        });
        const approveTx = await tokenContract.approve(networkConfig.contracts.diamond, tokenAmount);
        await approveTx.wait();
        toast({
          title: "Token Approved",
          description: `${cryptoCurrency} approved for payment. Proceeding...`,
        });
      }

      // Debug log all parameters
      console.log('Submitting payment:', {
        loanId,
        amount,
        paymentType,
        cryptoCurrency,
        selectedLoan,
        selectedTokenInfo,
        tokenAmount: tokenAmount.toString(),
        userAddress
      });

      toast({
        title: "Processing Payment",
        description: "Please confirm the transaction in your wallet...",
      });

      let tx;
      if (paymentType === "full") {
        // Full loan repayment
        tx = await automationLoanContract.repayLoanFull(parseInt(loanId));
      } else {
        // Monthly payment
        tx = await automationLoanContract.makeMonthlyPayment(parseInt(loanId));
      }

      toast({
        title: "Transaction Submitted",
        description: "Waiting for blockchain confirmation...",
      });

      const receipt = await tx.wait();

      toast({
        title: "Payment Successful!",
        description: `Payment of $${amount.toLocaleString()} has been processed successfully.`,
      });

      // Refresh data after successful payment
      const userLoans = await fetchUserLoans(userAddress, provider);
      setLoans(userLoans);

      const userPayments = await fetchPaymentHistory(userAddress, provider, userLoans);
      setPayments(userPayments);

    } catch (error: any) {
      console.error("Payment processing error:", error);
      
      let errorMessage = "There was an error processing your payment.";
      if (error.message?.includes("user rejected")) {
        errorMessage = "Transaction was cancelled by user.";
      } else if (error.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for this transaction.";
      } else if (error.message?.includes("PaymentNotDue")) {
        errorMessage = "Payment is not due yet for this loan.";
      } else if (error.message?.includes("LoanNotActive")) {
        errorMessage = "This loan is not active.";
      } else if (error.message?.includes("Unauthorized")) {
        errorMessage = "You are not authorized to make payments for this loan.";
      }

      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Connect wallet function
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = getProvider();
        if (provider) {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setUserAddress(address);
          setIsWalletConnected(true);
          
          // Reload data after connecting
          const userLoans = await fetchUserLoans(address, provider);
          setLoans(userLoans);
          const userPayments = await fetchPaymentHistory(address, provider, userLoans);
          setPayments(userPayments);
          
          toast({
            title: "Wallet Connected",
            description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
          });
        }
      } else {
        toast({
          title: "MetaMask Not Found",
          description: "Please install MetaMask to connect your wallet.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Refresh data function
  const refreshData = async () => {
    if (!userAddress || !isWalletConnected) return;
    
    setLoading(true);
    try {
      const provider = getProvider();
      if (provider) {
        const userLoans = await fetchUserLoans(userAddress, provider);
        setLoans(userLoans);
        const userPayments = await fetchPaymentHistory(userAddress, provider, userLoans);
        setPayments(userPayments);
        
        toast({
          title: "Data Refreshed",
          description: "Blockchain data has been updated.",
        });
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 animate-fadeIn">
        <div className="space-y-8">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading blockchain data...</p>
          </div>
        </div>
      </main>
    );
  }

  // Calculate payment summary for the form
  const calculatePaymentSummary = () => {
    if (!paymentAmount || !selectedToken || !tokenRates[selectedToken]) {
      return {
        amountUSD: 0,
        exchangeRate: 1,
        networkFee: 0,
        totalRequired: 0,
      };
    }

    const amountUSD = parseFloat(paymentAmount);
    const exchangeRate = tokenRates[selectedToken];
    const networkFee = 2.50; // Approximate network fee in USD
    const tokenAmount = amountUSD * exchangeRate;
    const totalRequired = tokenAmount + (networkFee * exchangeRate);

    return {
      amountUSD,
      exchangeRate,
      networkFee,
      totalRequired,
    };
  };

  const paymentSummary = calculatePaymentSummary();

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
                      Payment Center
                    </h1>
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Process loan payments using cryptocurrency on the blockchain
                  </p>
                  <div className="flex items-center gap-4 pt-2">
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {completedPayments} Completed
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-blue-700 border-blue-200"
                    >
                      <DollarSign className="h-3 w-3 mr-1" />$
                      {totalPaid.toLocaleString()} Total Paid
                    </Badge>
                    {pendingPayments > 0 && (
                      <Badge
                        variant="outline"
                        className="text-yellow-700 border-yellow-200"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {pendingPayments} Pending
                      </Badge>
                    )}
                  </div>
                  {/* Wallet connection status */}
                  <div className="flex items-center gap-4 pt-2">
                    {isWalletConnected ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                        <Wallet className="h-3 w-3 mr-1" />
                        {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-700 border-red-200">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Wallet Not Connected
                      </Badge>
                    )}
                    {networkInfo && (
                      <Badge variant="outline" className="text-purple-700 border-purple-200">
                        {networkInfo.name}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={refreshData}
                    variant="outline"
                    size="lg"
                    disabled={loading || !isWalletConnected}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  
                  {!isWalletConnected && (
                    <Button
                      onClick={connectWallet}
                      size="lg"
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Wallet className="h-4 w-4" />
                      Connect Wallet
                    </Button>
                  )}
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
                      <DollarSign className="h-4 w-4" />
                      Total Paid
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                      ${totalPaid.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 text-blue-600 mt-2">
                      <Activity className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Lifetime Total
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-emerald-600 flex items-center gap-2 uppercase tracking-wide">
                      <CheckCircle className="h-4 w-4" />
                      Completed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                      {completedPayments}
                    </p>
                    <div className="flex items-center gap-1 text-emerald-600 mt-2">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Successful Payments
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-yellow-600 flex items-center gap-2 uppercase tracking-wide">
                      <Clock className="h-4 w-4" />
                      Pending
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                      {pendingPayments}
                    </p>
                    <div className="flex items-center gap-1 text-yellow-600 mt-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Processing</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-purple-600 flex items-center gap-2 uppercase tracking-wide">
                      <CreditCard className="h-4 w-4" />
                      This Month
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                      ${thisMonthPaid.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 text-purple-600 mt-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm font-medium">Current Month</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Make Payment Form */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Wallet className="h-6 w-6 text-blue-600" />
                      Make Payment
                    </CardTitle>
                    <CardDescription className="text-base">
                      Process a loan payment using cryptocurrency
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    {!isWalletConnected ? (
                      <div className="text-center py-12">
                        <Wallet className="h-16 w-16 mx-auto mb-4 opacity-40 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mb-2 text-gray-900">
                          Connect Your Wallet
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          Connect your MetaMask wallet to view and make loan payments
                        </p>
                        <Button 
                          onClick={connectWallet}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          <Wallet className="h-4 w-4 mr-2" />
                          Connect Wallet
                        </Button>
                      </div>
                    ) : loans.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="h-16 w-16 mx-auto mb-4 opacity-40 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mb-2 text-gray-900">
                          No Active Loans
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          You don't have any active loans to make payments for
                        </p>
                        <Button variant="outline" asChild>
                          <a href="/dashboard/loans">
                            <Plus className="h-4 w-4 mr-2" />
                            Create New Loan
                          </a>
                        </Button>
                      </div>
                    ) : (
                    <form
                      className="space-y-6"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const formData = new FormData(form);
                        await handlePayment(formData);
                      }}
                    >
                      <div className="space-y-3">
                        <Label
                          htmlFor="loan_id"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Select Loan *
                        </Label>
                        <Select
                          name="loan_id"
                          required
                          value={selectedLoanId}
                          onValueChange={setSelectedLoanId}
                        >
                          <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                            <SelectValue placeholder="Choose a loan to pay" />
                          </SelectTrigger>
                          <SelectContent>
                            {loans.map((loan) => {
                              // Calculate proper monthly payment based on loan terms
                              const loanTermMonths = loan.duration / (30 * 24 * 60 * 60); // Convert seconds to months
                              const monthlyAmount = loan.monthlyPayment
                                ? loan.monthlyPayment
                                : (loanTermMonths > 0 ? loan.totalDebt / loanTermMonths : 0);
                              return (
                                <SelectItem key={loan.loanId} value={loan.loanId.toString()}>
                                  <div className="flex items-center justify-between w-full">
                                    <span className="font-medium">
                                      Loan #{loan.loanId}
                                    </span>
                                    <span className="text-sm text-muted-foreground ml-4">
                                      ${monthlyAmount.toLocaleString()} monthly
                                    </span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <Label
                            htmlFor="amount"
                            className="text-sm font-semibold text-gray-700"
                          >
                            Payment Amount *
                          </Label>
                          <Input
                            id="amount"
                            name="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="2500.00"
                            required
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-gray-700">
                            Payment Type *
                          </Label>
                          <Select name="payment_type" required defaultValue="monthly">
                            <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly Payment</SelectItem>
                              <SelectItem value="full">Full Repayment</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label
                          htmlFor="crypto_currency"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Pay with Cryptocurrency *
                        </Label>
                        <Select 
                          name="crypto_currency" 
                          required
                          value={selectedToken}
                          onValueChange={setSelectedToken}
                        >
                          <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                            <SelectValue placeholder="Select cryptocurrency" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTokens.map((token) => (
                              <SelectItem
                                key={token.symbol}
                                value={token.symbol}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className="font-medium">
                                    {token.symbol} - {token.name}
                                  </span>
                                  <span className="text-sm text-muted-foreground ml-4">
                                    Rate: {tokenRates[token.symbol] || 1.0}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label
                          htmlFor="blockchain"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Blockchain Network *
                        </Label>
                        <Select name="blockchain" required value={selectedNetwork} disabled>
                          <SelectTrigger className="h-12 border-gray-200 bg-gray-50">
                            <SelectValue placeholder="Select network" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(SUPPORTED_NETWORKS).map(([key, network]) => (
                              <SelectItem key={key} value={network.name}>
                                {network.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {networkInfo && (
                          <p className="text-xs text-muted-foreground">
                            Connected to: {networkInfo.name} (Chain ID: {networkInfo.chainId})
                          </p>
                        )}
                      </div>

                      <div className="border border-gray-200 bg-gray-50/30 rounded-lg p-6 space-y-3">
                        <h3 className="font-semibold text-gray-900 mb-4">
                          Payment Summary
                        </h3>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Payment Amount:
                          </span>
                          <span className="font-medium">
                            ${paymentSummary.amountUSD.toLocaleString() || '0.00'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Exchange Rate:
                          </span>
                          <span className="font-medium">
                            1 {selectedToken || 'USDC'} = ${(1 / (tokenRates[selectedToken] || 1)).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Network Fee:
                          </span>
                          <span className="font-medium">~${paymentSummary.networkFee.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold text-base">
                          <span>Total Required:</span>
                          <span className="text-blue-600">
                            {paymentSummary.totalRequired.toFixed(2)} {selectedToken || 'USDC'}
                          </span>
                        </div>
                      </div>

                      <SubmitButton
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                        size="lg"
                        pendingText="Processing Payment..."
                      >
                        <ArrowUpRight className="h-4 w-4 mr-2" />
                        Process Payment
                      </SubmitButton>
                    </form>
                    )}
                  </CardContent>
                </Card>

                {/* Upcoming Payments */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Calendar className="h-6 w-6 text-emerald-600" />
                      Upcoming Payments
                    </CardTitle>
                    <CardDescription className="text-base">
                      Your scheduled loan payments
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    {loans && loans.length > 0 ? (
                      <div className="space-y-6">
                        {loans.slice(0, 5).map((loan) => {
                          // Calculate next payment due date: always 30 days after loan start
                          let actualStartTime = loan.startTime;
                          if (!actualStartTime || isNaN(actualStartTime) || actualStartTime < 1000000000) {
                            // If start time is 0 or invalid, use current time
                            actualStartTime = Math.floor(Date.now() / 1000);
                          }
                          const nextPaymentTime = actualStartTime + (30 * 24 * 60 * 60); // 1 month after start
                          const nextPaymentDate = new Date(nextPaymentTime * 1000);

                          const daysUntil = Math.ceil(
                            (nextPaymentDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                          );
                          const isOverdue = daysUntil < 0;
                          const isDueSoon = daysUntil <= 7 && daysUntil >= 0;

                          // Calculate proper monthly payment based on loan terms
                          const loanTermMonths = loan.duration / (30 * 24 * 60 * 60); // Convert seconds to months
                          const monthlyAmount = loan.monthlyPayment
                            ? loan.monthlyPayment
                            : (loanTermMonths > 0 ? loan.totalDebt / loanTermMonths : 0);

                          return (
                            <div
                              key={loan.loanId}
                              className={`p-6 rounded-xl border transition-all duration-200 ${
                                isOverdue
                                  ? "border-red-200 bg-red-50/30 shadow-md"
                                  : isDueSoon
                                    ? "border-yellow-200 bg-yellow-50/30 shadow-md"
                                    : "border-gray-200 bg-gray-50/30"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <p className="font-semibold text-lg text-gray-900">
                                    Loan #{loan.loanId}
                                  </p>
                                  <p className="text-base text-muted-foreground">
                                    Due: {nextPaymentDate.toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-2xl text-gray-900">
                                    ${monthlyAmount.toLocaleString()}
                                  </p>
                                  <p
                                    className={`text-sm font-medium ${
                                      isOverdue
                                        ? "text-red-600"
                                        : isDueSoon
                                          ? "text-yellow-600"
                                          : "text-muted-foreground"
                                    }`}
                                  >
                                    {isOverdue
                                      ? `${Math.abs(daysUntil)} days overdue`
                                      : isDueSoon
                                        ? `Due in ${daysUntil} days`
                                        : `Due in ${daysUntil} days`}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="lg"
                                className="w-full"
                                variant="outline"
                                asChild
                              >
                                <a href={`/dashboard/payments?loan=${loan.loanId}`}>
                                  {isOverdue ? "Pay Now (Overdue)" : "Pay Now"}
                                </a>
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Calendar className="h-16 w-16 mx-auto mb-4 opacity-40" />
                        <h3 className="text-xl font-semibold mb-2 text-gray-900">
                          No upcoming payments
                        </h3>
                        <p className="text-lg">
                          All your loans are up to date!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Payment History */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-xl">Payment History</CardTitle>
                  <CardDescription className="text-base">
                    Your recent payment transactions
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  {payments && payments.length > 0 ? (
                    <div className="space-y-6">
                      {payments.map((payment) => (
                        <div
                          key={payment.hash}
                          className="flex items-center justify-between p-6 border border-gray-200 rounded-xl bg-gray-50/30 hover:shadow-md transition-all duration-200"
                        >
                          <div className="space-y-2">
                            <p className="font-semibold text-lg text-gray-900">
                              Loan #{payment.loanId} Payment
                            </p>
                            <p className="text-base text-muted-foreground">
                              {new Date(payment.timestamp * 1000).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}{" "}
                              • {payment.token}
                            </p>
                          </div>
                          <div className="text-right space-y-2">
                            <p className="font-bold text-2xl text-gray-900">
                              ${parseFloat(payment.amount).toLocaleString()}
                            </p>
                            <div className="flex items-center gap-3">
                              {getStatusBadge(payment.status)}
                              {payment.hash && (
                                <Badge variant="outline" className="text-xs">
                                  <a 
                                    href={`${networkInfo?.chainId === 11155111 
                                      ? 'https://sepolia.etherscan.io' 
                                      : 'https://etherscan.io'}/tx/${payment.hash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline"
                                  >
                                    View Tx
                                  </a>
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <DollarSign className="h-20 w-20 mx-auto mb-6 text-muted-foreground opacity-40" />
                      <h3 className="text-2xl font-bold mb-3 text-gray-900">
                        No payment history
                      </h3>
                      <p className="text-muted-foreground text-lg">
                        Your payment transactions will appear here once you make payments
                      </p>
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
