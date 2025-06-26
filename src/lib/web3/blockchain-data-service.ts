import { ethers, Signer } from "ethers";
import { PriceData, priceService } from "./price-service";
import * as diamond from './diamond'; // <-- IMPORT OUR NEW DIAMOND SERVICE
import { getFacetContract } from './diamond';
import {
  getNetworkConfig,
  POPULAR_TOKENS,
  SUPPORTED_NETWORKS,
} from "./blockchain-config";

// Define TokenBalance interface locally to avoid importing from wallet-provider
export interface TokenBalance {
  address: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  usdValue?: number;
}

// Lazy import wallet provider to avoid server-side issues
let walletProvider: any = null;
const getWalletProvider = async () => {
  if (typeof window === "undefined") {
    return null;
  }
  if (!walletProvider) {
    const { walletProvider: wp } = await import("./wallet-provider");
    walletProvider = wp;
  }
  return walletProvider;
};

export interface AssetData {
  id: string;
  name: string;
  type: "crypto" | "token" | "nft" | "rwa";
  symbol: string;
  balance: string;
  usdValue: number;
  price: number;
  priceChange24h: number;
  network: string;
  chainId: number;
  contractAddress?: string;
  tokenId?: string;
  metadata?: any;
}

export interface PortfolioData {
  totalValue: number;
  totalChange24h: number;
  totalChangePercentage24h: number;
  assets: AssetData[];
  networks: {
    [chainId: number]: {
      name: string;
      balance: number;
      assetCount: number;
    };
  };
}

export interface TransactionData {
  hash: string;
  type: "send" | "receive" | "mint" | "burn" | "swap" | "approve";
  amount: string;
  symbol: string;
  to: string;
  from: string;
  timestamp: number;
  status: "pending" | "confirmed" | "failed";
  network: string;
  chainId: number;
  gasUsed?: string;
  gasPrice?: string;
  usdValue?: number;
}

export interface LoanData {
  id: string;
  assetId: string;
  assetName: string;
  loanAmount: number;
  outstandingBalance: number;
  interestRate: number;
  monthlyPayment: number;
  nextPaymentDate: string;
  status: "active" | "paid" | "defaulted" | "pending" | "liquidated";
  collateralValue: number;
  collateralRatio: number;
  network: string;
  contractAddress?: string;
  // Enhanced fields for smart contract integration
  loanId?: number;
  tokenId?: number;
  accountTokenId?: number;
  duration?: number;
  totalDebt?: number;
  bufferAmount?: number;
  remainingBuffer?: number;
  lastPaymentTime?: number;
  monthlyPayments?: boolean[];
  crossChain?: boolean;
  sourceChain?: string;
  sourceChainSelector?: number;
  sourceAddress?: string;
  txHash?: string;
}

export interface MarketData {
  overview: {
    totalMarketCap: number;
    totalVolume24h: number;
    btcDominance: number;
    marketCapChange24h: number;
  };
  trending: Array<{
    id: string;
    name: string;
    symbol: string;
    price: number;
    change24h: number;
    rank: number;
  }>;
  topGainers: Array<{
    symbol: string;
    price: number;
    change24h: number;
  }>;
  topLosers: Array<{
    symbol: string;
    price: number;
    change24h: number;
  }>;
}

export interface BlockchainMetrics {
  gasPrice: {
    [chainId: number]: {
      standard: number;
      fast: number;
      instant: number;
    };
  };
  networkStats: {
    [chainId: number]: {
      blockNumber: number;
      blockTime: number;
      txCount24h: number;
    };
  };
}

class BlockchainDataService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache to reduce API calls
  private updateListeners: (() => void)[] = [];
  private isUpdating = false;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Only start automatic updates on client side
    if (typeof window !== "undefined") {
      this.startPeriodicUpdates();
    }
  }

  private startPeriodicUpdates() {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Update every 5 minutes to reduce API calls
    this.updateInterval = setInterval(
      () => {
        if (!this.isUpdating) {
          this.updateAllData();
        }
      },
      5 * 60 * 1000
    );
  }

  private async updateAllData() {
    // Only run on client side
    if (typeof window === "undefined") return;

    this.isUpdating = true;
    try {
      await Promise.allSettled([
        this.refreshPortfolioData(),
        this.refreshMarketData(),
        this.refreshGasPrices(),
      ]);
      this.notifyListeners();
    } catch (error) {
      console.error("Failed to update blockchain data:", error);
    } finally {
      this.isUpdating = false;
    }
  }

  async getPortfolioData(): Promise<PortfolioData> {
    // Return empty data on server side
    if (typeof window === "undefined") {
      return {
        totalValue: 0,
        totalChange24h: 0,
        totalChangePercentage24h: 0,
        assets: [],
        networks: {},
      };
    }

    const cacheKey = "portfolio";
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    const data = await this.fetchPortfolioData();
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  private async fetchPortfolioData(): Promise<PortfolioData> {
    // Return empty data on server side
    if (typeof window === "undefined") {
      return {
        totalValue: 0,
        totalChange24h: 0,
        totalChangePercentage24h: 0,
        assets: [],
        networks: {},
      };
    }

    const wp = await getWalletProvider();
    if (!wp) {
      return {
        totalValue: 0,
        totalChange24h: 0,
        totalChangePercentage24h: 0,
        assets: [],
        networks: {},
      };
    }

    const wallet = wp.getState();
    if (!wallet.isConnected || !wallet.address || !wallet.provider) {
      return {
        totalValue: 0,
        totalChange24h: 0,
        totalChangePercentage24h: 0,
        assets: [],
        networks: {},
      };
    }

    try {
      const assets: AssetData[] = [];
      const networks: PortfolioData["networks"] = {};

      // ===== REAL ASSET FETCHING =====
      if (wallet.chainId === 11155111) { // We are on Sepolia
        console.log("Fetching RWA assets from Sepolia contract...");
        const rwaAssets = await diamond.fetchUserAssetsFromContract(wallet.provider, wallet.address);
        assets.push(...rwaAssets);

        // Add to network summary
        const totalRwaValue = rwaAssets.reduce((sum, asset) => sum + asset.usdValue, 0);
        networks[11155111] = {
          name: 'Sepolia',
          balance: totalRwaValue,
          assetCount: rwaAssets.length,
        };
      }

      // Get data from all supported networks
      for (const [networkName, networkConfig] of Object.entries(
        SUPPORTED_NETWORKS
      )) {
        if (networkConfig.isTestnet) continue;

        try {
          // Skip RPC calls that are causing errors - use mock data instead
          // In production, you would implement proper error handling and retries
          console.log(
            `Skipping RPC calls for ${networkName} - using mock data`
          );

          // Generate mock balance data
          const mockBalance = (Math.random() * 5).toFixed(4); // Random balance 0-5 tokens
          const formattedBalance = mockBalance;

          if (parseFloat(formattedBalance) > 0) {
            const priceData = await priceService.getPrice(networkConfig.symbol);
            const usdValue = priceData
              ? parseFloat(formattedBalance) * priceData.price
              : 0;

            assets.push({
              id: `${networkConfig.chainId}-native`,
              name: networkConfig.nativeCurrency.name,
              type: "crypto",
              symbol: networkConfig.symbol,
              balance: formattedBalance,
              usdValue,
              price: priceData?.price || 0,
              priceChange24h: priceData?.priceChangePercentage24h || 0,
              network: networkConfig.name,
              chainId: networkConfig.chainId,
            });

            networks[networkConfig.chainId] = {
              name: networkConfig.name,
              balance: usdValue,
              assetCount: 1,
            };
          }

          // Generate mock token balances instead of making RPC calls
          const tokenAddresses = POPULAR_TOKENS[networkName] || [];
          const tokenBalances = await Promise.allSettled(
            tokenAddresses.slice(0, 2).map(async (token) => {
              try {
                // Generate mock token balance
                const mockTokenBalance = (Math.random() * 1000).toFixed(2);
                const formattedBalance = mockTokenBalance;

                if (parseFloat(formattedBalance) > 0) {
                  const priceData = await priceService.getPrice(token.symbol);
                  const usdValue = priceData
                    ? parseFloat(formattedBalance) * priceData.price
                    : parseFloat(formattedBalance) * (Math.random() * 10); // Mock price

                  return {
                    id: `${networkConfig.chainId}-${token.address}`,
                    name: token.name,
                    type: "token" as const,
                    symbol: token.symbol,
                    balance: formattedBalance,
                    usdValue,
                    price: priceData?.price || Math.random() * 10,
                    priceChange24h:
                      priceData?.priceChangePercentage24h ||
                      (Math.random() - 0.5) * 20,
                    network: networkConfig.name,
                    chainId: networkConfig.chainId,
                    contractAddress: token.address,
                  };
                }
                return null;
              } catch (error) {
                console.error(
                  `Failed to generate mock balance for ${token.symbol}:`,
                  error
                );
                return null;
              }
            })
          );

          // Add successful token balances
          tokenBalances.forEach((result) => {
            if (result.status === "fulfilled" && result.value) {
              assets.push(result.value);
              if (networks[networkConfig.chainId]) {
                networks[networkConfig.chainId].balance +=
                  result.value.usdValue;
                networks[networkConfig.chainId].assetCount += 1;
              }
            }
          });
        } catch (error) {
          console.error(`Failed to fetch data for ${networkName}:`, error);
        }
      }

      // Calculate totals
      const totalValue = assets.reduce((sum, asset) => sum + asset.usdValue, 0);
      const totalChange24h = assets.reduce((sum, asset) => {
        const change24h = (asset.usdValue * asset.priceChange24h) / 100;
        return sum + change24h;
      }, 0);
      const totalChangePercentage24h =
        totalValue > 0 ? (totalChange24h / totalValue) * 100 : 0;

      return {
        totalValue,
        totalChange24h,
        totalChangePercentage24h,
        assets,
        networks,
      };
    } catch (error) {
      console.error("Failed to fetch portfolio data:", error);
      return {
        totalValue: 0,
        totalChange24h: 0,
        totalChangePercentage24h: 0,
        assets: [],
        networks: {},
      };
    }
  }

  async getTransactionHistory(limit: number = 50): Promise<TransactionData[]> {
    // Return empty array on server side
    if (typeof window === "undefined") {
      return [];
    }

    const wp = await getWalletProvider();
    if (!wp) {
      return [];
    }

    const wallet = wp.getState();
    if (!wallet.isConnected || !wallet.address) {
      return [];
    }

    try {
      const allTransactions: TransactionData[] = [];

      // Get transactions from all supported networks
      for (const [networkName, networkConfig] of Object.entries(
        SUPPORTED_NETWORKS
      )) {
        if (networkConfig.isTestnet) continue;

        try {
          // Generate mock transaction data since provider.getHistory() doesn't exist
          // In a real implementation, you'd use Etherscan API or similar service
          const mockTransactions = this.generateMockTransactions(
            wallet.address,
            networkConfig,
            Math.min(limit, 10)
          );

          allTransactions.push(...mockTransactions);
        } catch (error) {
          console.error(
            `Failed to fetch transactions for ${networkName}:`,
            error
          );
        }
      }

      // Sort by timestamp (newest first) and limit
      return allTransactions
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
    } catch (error) {
      console.error("Failed to fetch transaction history:", error);
      return [];
    }
  }

  async getMarketData(): Promise<MarketData> {
    const cacheKey = "market";
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    const data = await this.fetchMarketData();
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  private async fetchMarketData(): Promise<MarketData> {
    try {
      const [overview, trending] = await Promise.all([
        priceService.getMarketOverview(),
        priceService.getTrendingTokens(),
      ]);

      // Get prices for major tokens to determine gainers/losers
      const majorTokens = ["BTC", "ETH", "BNB", "MATIC", "USDC", "USDT"];
      const prices = await priceService.getPrices(majorTokens);

      const pricesArray = majorTokens
        .map((symbol) => ({ symbol, ...prices[symbol] }))
        .filter(
          (item): item is { symbol: string } & PriceData =>
            item.price !== undefined
        );

      const topGainers = pricesArray
        .filter((p) => p.priceChangePercentage24h > 0)
        .sort((a, b) => b.priceChangePercentage24h - a.priceChangePercentage24h)
        .slice(0, 5)
        .map((p) => ({
          symbol: p.symbol,
          price: p.price,
          change24h: p.priceChangePercentage24h,
        }));

      const topLosers = pricesArray
        .filter((p) => p.priceChangePercentage24h < 0)
        .sort((a, b) => a.priceChangePercentage24h - b.priceChangePercentage24h)
        .slice(0, 5)
        .map((p) => ({
          symbol: p.symbol,
          price: p.price,
          change24h: p.priceChangePercentage24h,
        }));

      return {
        overview: overview || {
          totalMarketCap: 0,
          totalVolume24h: 0,
          btcDominance: 0,
          marketCapChange24h: 0,
        },
        trending: trending.map((coin) => ({
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol,
          price: coin.price,
          change24h: coin.change24h,
          rank: coin.rank,
        })),
        topGainers,
        topLosers,
      };
    } catch (error) {
      console.error("Failed to fetch market data:", error);
      return {
        overview: {
          totalMarketCap: 0,
          totalVolume24h: 0,
          btcDominance: 0,
          marketCapChange24h: 0,
        },
        trending: [],
        topGainers: [],
        topLosers: [],
      };
    }
  }

  async getBlockchainMetrics(): Promise<BlockchainMetrics> {
    const cacheKey = "metrics";
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    const data = await this.fetchBlockchainMetrics();
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  private async fetchBlockchainMetrics(): Promise<BlockchainMetrics> {
    const gasPrice: BlockchainMetrics["gasPrice"] = {};
    const networkStats: BlockchainMetrics["networkStats"] = {};

    // Mock data for fallback
    const mockGasPrices: Record<
      number,
      { standard: number; fast: number; instant: number }
    > = {
      1: { standard: 20, fast: 25, instant: 30 }, // Ethereum
      137: { standard: 30, fast: 35, instant: 40 }, // Polygon
      56: { standard: 5, fast: 6, instant: 8 }, // BSC
      42161: { standard: 0.1, fast: 0.15, instant: 0.2 }, // Arbitrum
      10: { standard: 0.001, fast: 0.002, instant: 0.003 }, // Optimism
    };

    const mockNetworkStats: Record<
      number,
      { blockNumber: number; blockTime: number; txCount24h: number }
    > = {
      1: { blockNumber: 18500000, blockTime: 12, txCount24h: 1200000 },
      137: { blockNumber: 50000000, blockTime: 2, txCount24h: 3500000 },
      56: { blockNumber: 35000000, blockTime: 3, txCount24h: 8000000 },
      42161: {
        blockNumber: 150000000,
        blockTime: 1,
        txCount24h: 1000000,
      },
      10: { blockNumber: 115000000, blockTime: 2, txCount24h: 500000 },
    };

    for (const [networkName, networkConfig] of Object.entries(
      SUPPORTED_NETWORKS
    )) {
      if (networkConfig.isTestnet) continue;

      try {
        // Skip RPC calls that are causing authentication errors
        // Use mock data instead to prevent console spam
        const chainId = networkConfig.chainId;

        gasPrice[chainId] = mockGasPrices[chainId] || {
          standard: 20,
          fast: 25,
          instant: 30,
        };

        networkStats[chainId] = mockNetworkStats[chainId] || {
          blockNumber: 1000000,
          blockTime: 12,
          txCount24h: 100000,
        };

        console.log(`Using mock data for ${networkName} metrics`);
      } catch (error) {
        console.error(`Failed to fetch metrics for ${networkName}:`, error);

        // Fallback to mock data
        const chainId = networkConfig.chainId;
        gasPrice[chainId] = mockGasPrices[chainId] || {
          standard: 20,
          fast: 25,
          instant: 30,
        };

        networkStats[chainId] = mockNetworkStats[chainId] || {
          blockNumber: 1000000,
          blockTime: 12,
          txCount24h: 100000,
        };
      }
    }

    return { gasPrice, networkStats };
  }

  // Generate mock transaction data for demonstration
  private generateMockTransactions(
    address: string,
    networkConfig: any,
    count: number
  ): TransactionData[] {
    const transactions: TransactionData[] = [];
    const now = Date.now() / 1000;

    for (let i = 0; i < count; i++) {
      const isReceive = Math.random() > 0.5;
      const amount = (Math.random() * 10).toFixed(4);
      const daysAgo = Math.random() * 30;
      const timestamp = now - daysAgo * 24 * 60 * 60;

      transactions.push({
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        type: isReceive ? "receive" : "send",
        amount,
        symbol: networkConfig.symbol,
        to: isReceive
          ? address
          : `0x${Math.random().toString(16).substr(2, 40)}`,
        from: isReceive
          ? `0x${Math.random().toString(16).substr(2, 40)}`
          : address,
        timestamp: Math.floor(timestamp),
        status: Math.random() > 0.1 ? "confirmed" : "pending",
        network: networkConfig.name,
        chainId: networkConfig.chainId,
        gasUsed: Math.floor(Math.random() * 100000).toString(),
        gasPrice: Math.floor(Math.random() * 50).toString(),
        usdValue: parseFloat(amount) * (Math.random() * 3000 + 100),
      });
    }

    return transactions.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Cache management methods
  private async refreshPortfolioData() {
    await this.getPortfolioData();
  }

  private async refreshMarketData() {
    await this.getMarketData();
  }

  private async refreshGasPrices() {
    await this.getBlockchainMetrics();
  }

  // Subscription methods
  subscribe(callback: () => void): () => void {
    this.updateListeners.push(callback);
    return () => {
      const index = this.updateListeners.indexOf(callback);
      if (index > -1) {
        this.updateListeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    this.updateListeners.forEach((callback) => callback());
  }

  async refreshAll(): Promise<void> {
    await this.updateAllData();
  }

  // Utility methods
  getCachedData(): Record<string, any> {
    const result: Record<string, any> = {};
    this.cache.forEach((value, key) => {
      result[key] = value.data;
    });
    return result;
  }

  // Helper methods for formatting
  formatBalance(balance: string, decimals: number = 4): string {
    const num = parseFloat(balance);
    if (num === 0) return "0";
    if (num < 0.0001) return "< 0.0001";
    return num.toFixed(decimals);
  }

  formatUSDValue(value: number): string {
    if (value === 0) return "$0.00";
    if (value < 0.01) return "< $0.01";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  }

  formatPercentageChange(change: number): string {
    return `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;
  }

  getChangeColor(change: number): string {
    return change >= 0 ? "text-green-600" : "text-red-600";
  }

  // =========================================================
  // ===== LOAN MANAGEMENT METHODS (CORRECTED VERSION) =====
  // =========================================================

  /**
   * Public method to get user loans, with caching.
   * This is what your UI components should call.
   */
  async getUserLoans(userAddress: string): Promise<LoanData[]> {
    if (typeof window === "undefined") {
      return []; // No loans on the server side
    }

    const cacheKey = `loans-${userAddress}`;
    const cached = this.cache.get(cacheKey);

    // Use cache if it's recent
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // This calls our private fetcher method
      const loans = await this.fetchUserLoans(userAddress);
      // Store the result in the cache
      this.cache.set(cacheKey, { data: loans, timestamp: Date.now() });
      return loans;
    } catch (error) {
      console.error("Failed to get user loans:", error);
      return [];
    }
  }

  /**
   * Private method that performs the actual fetching logic.
   * It decides whether to call the real contract or use mock data.
   */
  private async fetchUserLoans(userAddress: string): Promise<LoanData[]> {
    const wp = await getWalletProvider();
    if (!wp) {
      console.warn("Wallet provider not available, falling back to mock loans.");
      return this.generateMockLoans(userAddress);
    }

    const wallet = wp.getState();
    if (!wallet.isConnected || !wallet.provider || wallet.address !== userAddress) {
      console.warn("Wallet not connected or address mismatch, falling back to mock loans.");
      return this.generateMockLoans(userAddress);
    }

    // --- REAL LOAN FETCHING LOGIC ---
    if (wallet.chainId === 11155111) { // Check if we are on Sepolia
      console.log("Fetching loans from Sepolia smart contract...");
      // This correctly calls your new `diamond.ts` service
      return diamond.fetchUserLoansFromContract(wallet.provider, userAddress);
    }

    // Fallback for any other network (mainnet, polygon, etc.)
    console.warn(`No loan contracts configured for chainId ${wallet.chainId}. Returning mock loans.`);
    return this.generateMockLoans(userAddress);
  }

  /**
   * Private method to create a single mock loan from an ID.
   * (This part is correct and can be kept)
   */
  private createMockLoanFromId(
    loanId: number,
    network: string,
    userAddress: string
  ): LoanData {
    // ... (Your existing code for this method is fine)
    const loanAmount = Math.random() * 50000 + 10000;
    const interestRate = 5 + Math.random() * 10;
    const monthlyPayment = loanAmount * (interestRate / 100 / 12);
    const outstandingBalance = loanAmount * (0.5 + Math.random() * 0.5);

    return {
      id: `${network}-${loanId}`,
      assetId: `asset-${loanId}`,
      assetName: `Real Estate Asset #${loanId}`,
      loanAmount,
      outstandingBalance,
      interestRate,
      monthlyPayment,
      nextPaymentDate: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      status: Math.random() > 0.8 ? "pending" : "active",
      collateralValue: loanAmount * 1.5,
      collateralRatio: 150,
      network,
      contractAddress: "0x0000000000000000000000000000000000000000",
      loanId,
      tokenId: Math.floor(Math.random() * 1000),
      accountTokenId: Math.floor(Math.random() * 1000),
      duration: 365 * 24 * 60 * 60, // 1 year in seconds
      totalDebt: loanAmount * 1.1,
      bufferAmount: loanAmount * 0.1,
      remainingBuffer: loanAmount * 0.05,
      lastPaymentTime: Date.now() - 30 * 24 * 60 * 60 * 1000,
      monthlyPayments: Array(12)
        .fill(false)
        .map(() => Math.random() > 0.5),
      crossChain: Math.random() > 0.7,
      sourceChain: network,
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    };
  }

  /**
   * Private method to generate an array of mock loans.
   * (This part is correct and can be kept)
   */
  private generateMockLoans(userAddress: string): LoanData[] {
    // ... (Your existing code for this method is fine)
    const loans: LoanData[] = [];
    const loanCount = Math.floor(Math.random() * 5) + 1;

    for (let i = 0; i < loanCount; i++) {
      const loanAmount = Math.random() * 100000 + 10000;
      const interestRate = 5 + Math.random() * 10;
      const monthlyPayment = loanAmount * (interestRate / 100 / 12);
      const outstandingBalance = loanAmount * (0.3 + Math.random() * 0.7);
      const networks = ["ethereum", "polygon", "arbitrum"];
      const network = networks[Math.floor(Math.random() * networks.length)];

      loans.push({
        id: `mock-loan-${i}`,
        assetId: `asset-${i}`,
        assetName: `Property Asset #${i + 1}`,
        loanAmount,
        outstandingBalance,
        interestRate,
        monthlyPayment,
        nextPaymentDate: new Date(
          Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        status: i === 0 ? "active" : Math.random() > 0.5 ? "active" : "pending",
        collateralValue: loanAmount * (1.2 + Math.random() * 0.8),
        collateralRatio: 120 + Math.random() * 80,
        network,
        contractAddress: "0x0000000000000000000000000000000000000000",
        loanId: i + 1,
        tokenId: Math.floor(Math.random() * 1000),
        accountTokenId: Math.floor(Math.random() * 1000),
        duration: (6 + Math.random() * 24) * 30 * 24 * 60 * 60, // 6-30 months in seconds
        totalDebt: loanAmount * (1.05 + Math.random() * 0.15),
        bufferAmount: loanAmount * (0.05 + Math.random() * 0.1),
        remainingBuffer: loanAmount * (0.02 + Math.random() * 0.08),
        lastPaymentTime: Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000,
        monthlyPayments: Array(12)
          .fill(false)
          .map(() => Math.random() > 0.3),
        crossChain: Math.random() > 0.6,
        sourceChain: network,
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      });
    }

    return loans;
  }

  async calculateLoanTerms(
    amount: number,
    durationMonths: number,
  ): Promise<{
    totalDebt: number;
    bufferAmount: number;
    interestRate: number;
    monthlyPayment: number;
  }> {
    const wp = await getWalletProvider();
    const wallet = wp?.getState();
    const durationInSeconds = durationMonths * 30 * 24 * 60 * 60; // Approximate seconds

    // --- REAL CALCULATION LOGIC ---
    // Check if connected to Sepolia and provider is available
    if (wallet?.isConnected && wallet.provider && wallet.chainId === 11155111) {
      try {
        console.log("Calculating loan terms via Sepolia contract...");
        const contractTerms = await diamond.calculateLoanTermsFromContract(
          wallet.provider,
          amount.toString(),
          durationInSeconds
        );

        const totalDebt = parseFloat(contractTerms.totalDebt);

        return {
          totalDebt: totalDebt,
          bufferAmount: parseFloat(contractTerms.bufferAmount),
          interestRate: parseFloat(contractTerms.interestRate),
          monthlyPayment: durationMonths > 0 ? totalDebt / durationMonths : 0,
        };

      } catch (error) {
        console.error("Contract call for loan terms failed, using fallback calculation.", error);
        // If the contract call fails for any reason, we fall through to the mock logic below
      }
    }

    // --- FALLBACK / MOCK CALCULATION ---
    // This will run if not on Sepolia, or if the contract call above failed.
    console.warn("Using fallback/mock loan term calculation.");
    const interestRate = 5 + (durationMonths / 12) * 2; // 5% base + 2% per year
    const totalInterest = amount * (interestRate / 100) * (durationMonths / 12);
    const totalDebt = amount + totalInterest;
    const bufferAmount = totalDebt * 0.1; // 10% buffer
    const monthlyPayment = durationMonths > 0 ? totalDebt / durationMonths : 0;

    return {
      totalDebt,
      bufferAmount,
      interestRate,
      monthlyPayment,
    };
  }

  async getLoanAnalytics(userAddress: string): Promise<{
    totalLoaned: number;
    totalOutstanding: number;
    totalPaid: number;
    averageInterestRate: number;
    activeLoansCount: number;
    overdueLoansCount: number;
    collateralizationRatio: number;
  }> {
    const loans = await this.getUserLoans(userAddress);

    const activeLoans = loans.filter((loan) => loan.status === "active");
    const totalLoaned = loans.reduce((sum, loan) => sum + loan.loanAmount, 0);
    const totalOutstanding = loans.reduce(
      (sum, loan) => sum + loan.outstandingBalance,
      0
    );
    const totalPaid = totalLoaned - totalOutstanding;
    const averageInterestRate =
      loans.length > 0
        ? loans.reduce((sum, loan) => sum + loan.interestRate, 0) / loans.length
        : 0;
    const overdueLoansCount = loans.filter(
      (loan) =>
        new Date(loan.nextPaymentDate) < new Date() && loan.status === "active"
    ).length;
    const totalCollateralValue = loans.reduce(
      (sum, loan) => sum + loan.collateralValue,
      0
    );
    const collateralizationRatio =
      totalOutstanding > 0
        ? (totalCollateralValue / totalOutstanding) * 100
        : 0;

    return {
      totalLoaned,
      totalOutstanding,
      totalPaid,
      averageInterestRate,
      activeLoansCount: activeLoans.length,
      overdueLoansCount,
      collateralizationRatio,
    };
  }

  // Cleanup method
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.updateListeners = [];
    this.cache.clear();
  }
}

// ... (keep all your existing functions)

// ===========================================
// --- WRITE/TRANSACTION FUNCTIONS (use Signer) ---
// ===========================================

/**
 * Mints the authentication NFT for the connected user.
 * @param signer - The user's wallet signer, required to send a transaction.
 * @param tokenURI - The IPFS CID or metadata URL for the NFT.
 * @param valuation - The initial appraised value of the asset (as a string, e.g., "1000").
 * @returns The transaction hash.
 */
export const mintAuthNFT = async (
  signer: Signer,
  tokenURI: string,
  valuation: string
): Promise<string> => {
  try {
    const authUserFacet = await getFacetContract('AuthUser', signer);
    const userAddress = await signer.getAddress();
    
    // Your AuthUser.sol has: function mintAuthNFT(address to, string memory tokenURI, uint256 valuation)
    // Let's assume the contract mints the NFT *to* the message sender (the signer).
    // So the 'to' parameter is handled by the contract. If it's explicit, you'd pass userAddress.
    
    const valuationWei = ethers.parseEther(valuation);

    console.log(`Minting Auth NFT for ${userAddress} with URI: ${tokenURI}`);
    const tx = await authUserFacet.mintAuthNFT(userAddress, tokenURI, valuationWei);

    // Wait for the transaction to be mined (1 confirmation)
    await tx.wait();

    console.log("Minting transaction successful, hash:", tx.hash);
    return tx.hash;

  } catch (error: any) {
    console.error("Error minting Auth NFT:", error);
    // You can parse for common errors here, e.g., user rejected transaction
    if (error.code === 'ACTION_REJECTED') {
      throw new Error("Transaction was rejected by the user.");
    }
    throw new Error("An error occurred during the minting process.");
  }
};

// Create and export singleton instance
export const blockchainDataService = new BlockchainDataService();
