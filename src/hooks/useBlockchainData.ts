import { useCallback, useEffect, useState } from "react";
import {
    blockchainDataService,
    MarketData,
    PortfolioData,
    TransactionData,
} from "@/lib/web3/blockchain-data-service";
// Define WalletState interface locally to avoid importing from wallet-provider
export interface WalletState {
    isConnected: boolean;
    address: string | null;
    chainId: number | null;
    balance: string;
    network: string | null;
    provider: any | null;
    signer: any | null;
}
import { PriceData, priceService } from "@/lib/web3/price-service";

// Default wallet state for server-side rendering
const defaultWalletState: WalletState = {
    isConnected: false,
    address: null,
    chainId: null,
    balance: "0",
    network: null,
    provider: null,
    signer: null,
};

export interface UseBlockchainDataReturn {
    // Portfolio data
    portfolio: PortfolioData | null;
    portfolioLoading: boolean;
    portfolioError: string | null;

    // Market data
    market: MarketData | null;
    marketLoading: boolean;
    marketError: string | null;

    // Transaction data
    transactions: TransactionData[];
    transactionsLoading: boolean;
    transactionsError: string | null;

    // Wallet data
    wallet: WalletState;
    walletLoading: boolean;
    walletError: string | null;

    // Actions
    refreshPortfolio: () => Promise<void>;
    refreshMarket: () => Promise<void>;
    refreshTransactions: () => Promise<void>;
    refreshAll: () => Promise<void>;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => Promise<void>;

    // Utilities
    isConnected: boolean;
    isLoading: boolean;
    hasError: boolean;
}

export function useBlockchainData(): UseBlockchainDataReturn {
    // Portfolio state
    const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
    const [portfolioLoading, setPortfolioLoading] = useState(false);
    const [portfolioError, setPortfolioError] = useState<string | null>(null);

    // Market state
    const [market, setMarket] = useState<MarketData | null>(null);
    const [marketLoading, setMarketLoading] = useState(false);
    const [marketError, setMarketError] = useState<string | null>(null);

    // Transaction state
    const [transactions, setTransactions] = useState<TransactionData[]>([]);
    const [transactionsLoading, setTransactionsLoading] = useState(false);
    const [transactionsError, setTransactionsError] = useState<string | null>(
        null,
    );

    // Wallet state
    const [wallet, setWallet] = useState<WalletState>(defaultWalletState);
    const [walletLoading, setWalletLoading] = useState(false);
    const [walletError, setWalletError] = useState<string | null>(null);
    const [walletProvider, setWalletProvider] = useState<any>(null);

    // Initialize wallet provider on client side
    useEffect(() => {
        if (typeof window !== "undefined" && !walletProvider) {
            import("@/lib/web3/wallet-provider").then(
                ({ walletProvider: wp }) => {
                    setWalletProvider(wp);
                    setWallet(wp.getState());
                },
            );
        }
    }, [walletProvider]);

    // Fetch portfolio data
    const fetchPortfolio = useCallback(async () => {
        if (!wallet.isConnected) {
            setPortfolio(null);
            return;
        }

        setPortfolioLoading(true);
        setPortfolioError(null);

        try {
            const portfolioData = await blockchainDataService
                .getPortfolioData();
            setPortfolio(portfolioData);
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : "Failed to load portfolio";
            setPortfolioError(errorMessage);
            console.error("Portfolio fetch error:", error);
        } finally {
            setPortfolioLoading(false);
        }
    }, [wallet.isConnected]);

    // Fetch market data
    const fetchMarket = useCallback(async () => {
        setMarketLoading(true);
        setMarketError(null);

        try {
            const marketData = await blockchainDataService.getMarketData();
            setMarket(marketData);
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : "Failed to load market data";
            setMarketError(errorMessage);
            console.error("Market fetch error:", error);
        } finally {
            setMarketLoading(false);
        }
    }, []);

    // Fetch transaction data
    const fetchTransactions = useCallback(async () => {
        if (!wallet.isConnected) {
            setTransactions([]);
            return;
        }

        setTransactionsLoading(true);
        setTransactionsError(null);

        try {
            const transactionData = await blockchainDataService
                .getTransactionHistory(50);
            setTransactions(transactionData);
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : "Failed to load transactions";
            setTransactionsError(errorMessage);
            console.error("Transactions fetch error:", error);
        } finally {
            setTransactionsLoading(false);
        }
    }, [wallet.isConnected]);

    // Refresh functions
    const refreshPortfolio = useCallback(async () => {
        await fetchPortfolio();
    }, [fetchPortfolio]);

    const refreshMarket = useCallback(async () => {
        await fetchMarket();
    }, [fetchMarket]);

    const refreshTransactions = useCallback(async () => {
        await fetchTransactions();
    }, [fetchTransactions]);

    const refreshAll = useCallback(async () => {
        await Promise.allSettled([
            fetchPortfolio(),
            fetchMarket(),
            fetchTransactions(),
        ]);
    }, [fetchPortfolio, fetchMarket, fetchTransactions]);

    // Wallet functions
    const connectWallet = useCallback(async () => {
        if (!walletProvider || typeof window === "undefined") {
            setWalletError("Wallet provider not available");
            return;
        }

        setWalletLoading(true);
        setWalletError(null);

        try {
            const walletState = await walletProvider.connect();
            setWallet(walletState);
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : "Failed to connect wallet";
            setWalletError(errorMessage);
            console.error("Wallet connect error:", error);
        } finally {
            setWalletLoading(false);
        }
    }, [walletProvider]);

    const disconnectWallet = useCallback(async () => {
        if (!walletProvider) return;

        try {
            await walletProvider.disconnect();
            setWallet(walletProvider.getState());
            setPortfolio(null);
            setTransactions([]);
        } catch (error) {
            console.error("Wallet disconnect error:", error);
        }
    }, [walletProvider]);

    // Set up wallet listener
    useEffect(() => {
        if (!walletProvider || typeof window === "undefined") return;

        const unsubscribe = walletProvider.subscribe(
            (newWalletState: WalletState) => {
                setWallet(newWalletState);

                // Refresh data when wallet state changes
                if (newWalletState.isConnected && !wallet.isConnected) {
                    // Wallet just connected
                    refreshAll();
                } else if (!newWalletState.isConnected && wallet.isConnected) {
                    // Wallet disconnected
                    setPortfolio(null);
                    setTransactions([]);
                }
            },
        );

        return unsubscribe;
    }, [walletProvider, wallet.isConnected, refreshAll]);

    // Initial data fetch
    useEffect(() => {
        if (typeof window !== "undefined") {
            fetchMarket(); // Always fetch market data
            if (wallet.isConnected) {
                fetchPortfolio();
                fetchTransactions();
            }
        }
    }, [wallet.isConnected, fetchMarket, fetchPortfolio, fetchTransactions]);

    // Auto-refresh data every 30 seconds
    useEffect(() => {
        if (typeof window === "undefined") return;

        const interval = setInterval(() => {
            fetchMarket();
            if (wallet.isConnected) {
                fetchPortfolio();
                fetchTransactions();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [wallet.isConnected, fetchMarket, fetchPortfolio, fetchTransactions]);

    // Computed values
    const isConnected = wallet.isConnected;
    const isLoading = portfolioLoading || marketLoading ||
        transactionsLoading || walletLoading;
    const hasError =
        !!(portfolioError || marketError || transactionsError || walletError);

    return {
        // Portfolio data
        portfolio,
        portfolioLoading,
        portfolioError,

        // Market data
        market,
        marketLoading,
        marketError,

        // Transaction data
        transactions,
        transactionsLoading,
        transactionsError,

        // Wallet data
        wallet,
        walletLoading,
        walletError,

        // Actions
        refreshPortfolio,
        refreshMarket,
        refreshTransactions,
        refreshAll,
        connectWallet,
        disconnectWallet,

        // Utilities
        isConnected,
        isLoading,
        hasError,
    };
}

// Simplified hooks for specific data
export function usePortfolio() {
    const { portfolio, portfolioLoading, portfolioError, refreshPortfolio } =
        useBlockchainData();
    return {
        portfolio,
        loading: portfolioLoading,
        error: portfolioError,
        refresh: refreshPortfolio,
    };
}

export function useMarket() {
    const { market, marketLoading, marketError, refreshMarket } =
        useBlockchainData();
    return {
        market,
        loading: marketLoading,
        error: marketError,
        refresh: refreshMarket,
    };
}

export function useTransactions() {
    const {
        transactions,
        transactionsLoading,
        transactionsError,
        refreshTransactions,
    } = useBlockchainData();
    return {
        transactions,
        loading: transactionsLoading,
        error: transactionsError,
        refresh: refreshTransactions,
    };
}

export function useWalletState() {
    const {
        wallet,
        walletLoading,
        walletError,
        connectWallet,
        disconnectWallet,
    } = useBlockchainData();
    return {
        wallet,
        loading: walletLoading,
        error: walletError,
        connect: connectWallet,
        disconnect: disconnectWallet,
        isConnected: wallet.isConnected,
    };
}

// Hook for token prices
export function useTokenPrices(symbols: string[]) {
    const [prices, setPrices] = useState<Record<string, PriceData>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPrices = useCallback(async () => {
        if (symbols.length === 0) return;

        setLoading(true);
        setError(null);

        try {
            const priceData = await priceService.getPrices(symbols);
            setPrices(priceData);
        } catch (err) {
            const errorMessage = err instanceof Error
                ? err.message
                : "Failed to fetch prices";
            setError(errorMessage);
            console.error("Price fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [symbols]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            fetchPrices();
        }
    }, [fetchPrices]);

    return { prices, loading, error, refresh: fetchPrices };
}

// Hook for gas prices
export function useGasPrices() {
    const [gasPrices, setGasPrices] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGasPrices = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const metrics = await blockchainDataService.getBlockchainMetrics();
            setGasPrices(metrics.gasPrice);
        } catch (err) {
            const errorMessage = err instanceof Error
                ? err.message
                : "Failed to fetch gas prices";
            setError(errorMessage);
            console.error("Gas price fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            fetchGasPrices();
        }
    }, [fetchGasPrices]);

    return { gasPrices, loading, error, refresh: fetchGasPrices };
}
