import { useCallback, useEffect, useState } from "react";
import {
    MarketInsight,
    PortfolioAsset,
    PortfolioMetrics,
    PortfolioPrediction,
    portfolioService,
    RebalancingSuggestion,
    YieldOpportunity,
} from "@/lib/dashboard/portfolio-service";
import {
    ArbitrageOpportunity,
    CrossChainOpportunity,
    defiAggregator,
    DeFiInsight,
    DeFiProtocol,
    LendingOpportunity,
    LiquidityPool,
    YieldStrategy,
} from "@/lib/dashboard/defi-aggregator";
import { useBlockchainData } from "./useBlockchainData";

export interface PortfolioDashboardData {
    // Portfolio data
    assets: PortfolioAsset[];
    metrics: PortfolioMetrics;
    predictions: PortfolioPrediction[];
    rebalancingTips: RebalancingSuggestion[];

    // DeFi opportunities
    protocols: DeFiProtocol[];
    lending: LendingOpportunity[];
    strategies: YieldStrategy[];
    crossChain: CrossChainOpportunity[];
    liquidityPools: LiquidityPool[];
    arbitrage: ArbitrageOpportunity[];

    // Insights and recommendations
    marketInsights: MarketInsight[];
    defiInsights: DeFiInsight[];
    yieldOpportunities: YieldOpportunity[];

    // Status
    isLoading: boolean;
    error: string | null;
    lastUpdated: string | null;
}

export interface DashboardFilters {
    riskTolerance: "low" | "medium" | "high";
    timeframe: "1d" | "7d" | "30d" | "90d" | "1y";
    assetTypes: string[];
    minAPY: number;
    maxRisk: number;
    showTestnet: boolean;
}

export interface DashboardStats {
    totalValue: number;
    totalPnL: number;
    dailyChange: number;
    bestPerformer: PortfolioAsset | null;
    worstPerformer: PortfolioAsset | null;
    topOpportunity: YieldOpportunity | null;
    riskScore: number;
    diversificationScore: number;
}

// Main portfolio dashboard hook
export function usePortfolioDashboard(
    initialFilters?: Partial<DashboardFilters>,
) {
    // Get wallet state using the blockchain data hook
    const { wallet } = useBlockchainData();
    const isConnected = wallet.isConnected;
    const account = wallet.address;

    const [data, setData] = useState<PortfolioDashboardData>({
        assets: [],
        metrics: {
            totalValue: 0,
            totalPnl: 0,
            totalPnlPercentage: 0,
            dailyChange: 0,
            weeklyChange: 0,
            monthlyChange: 0,
            yearlyChange: 0,
            totalYield: 0,
            averageApy: 0,
            riskScore: 0,
            diversificationScore: 0,
            liquidityRatio: 0,
            assetCount: 0,
            assetTypes: {},
            blockchainDistribution: {},
            topPerformers: [],
            underperformers: [],
        },
        predictions: [],
        rebalancingTips: [],
        protocols: [],
        lending: [],
        strategies: [],
        crossChain: [],
        liquidityPools: [],
        arbitrage: [],
        marketInsights: [],
        defiInsights: [],
        yieldOpportunities: [],
        isLoading: false,
        error: null,
        lastUpdated: null,
    });

    const [filters, setFilters] = useState<DashboardFilters>({
        riskTolerance: "medium",
        timeframe: "30d",
        assetTypes: [],
        minAPY: 0,
        maxRisk: 100,
        showTestnet: false,
        ...initialFilters,
    });

    const [refreshInterval, setRefreshInterval] = useState<
        NodeJS.Timeout | null
    >(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Load dashboard data
    const loadDashboardData = useCallback(async () => {
        if (!isConnected || !account) return;

        setData((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            // Fetch portfolio and DeFi data in parallel
            const [portfolioData, defiData] = await Promise.all([
                portfolioService.getPortfolio(account),
                defiAggregator.getAllOpportunities(
                    [], // Will be filled with user assets
                    filters.riskTolerance,
                ),
            ]);

            setData({
                assets: portfolioData.assets,
                metrics: portfolioData.metrics,
                predictions: portfolioData.predictions,
                rebalancingTips: portfolioData.rebalancingTips,
                protocols: defiData.protocols,
                lending: defiData.lending,
                strategies: defiData.strategies,
                crossChain: defiData.crossChain,
                liquidityPools: defiData.liquidityPools,
                arbitrage: defiData.arbitrage,
                marketInsights: portfolioData.insights,
                defiInsights: defiData.insights,
                yieldOpportunities: portfolioData.yieldOpportunities,
                isLoading: false,
                error: null,
                lastUpdated: new Date().toISOString(),
            });
        } catch (error) {
            console.error("Dashboard data loading error:", error);
            setData((prev) => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error
                    ? error.message
                    : "Failed to load dashboard data",
            }));
        }
    }, [account, isConnected, filters.riskTolerance]);

    // Setup auto-refresh
    useEffect(() => {
        if (autoRefresh && isConnected) {
            const interval = setInterval(loadDashboardData, 30000); // 30 seconds
            setRefreshInterval(interval);
            return () => {
                if (interval) clearInterval(interval);
            };
        } else if (refreshInterval) {
            clearInterval(refreshInterval);
            setRefreshInterval(null);
        }
    }, [autoRefresh, isConnected, loadDashboardData]);

    // Initial load
    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    // Update filters
    const updateFilters = useCallback(
        (newFilters: Partial<DashboardFilters>) => {
            setFilters((prev) => ({ ...prev, ...newFilters }));
        },
        [],
    );

    // Get dashboard stats
    const stats: DashboardStats = {
        totalValue: data.metrics.totalValue,
        totalPnL: data.metrics.totalPnl,
        dailyChange: data.metrics.dailyChange,
        bestPerformer: data.assets.length > 0
            ? data.assets.reduce((best, asset) =>
                asset.pnlPercentage > best.pnlPercentage ? asset : best
            )
            : null,
        worstPerformer: data.assets.length > 0
            ? data.assets.reduce((worst, asset) =>
                asset.pnlPercentage < worst.pnlPercentage ? asset : worst
            )
            : null,
        topOpportunity: data.yieldOpportunities.length > 0
            ? data.yieldOpportunities.reduce((top, opp) =>
                opp.apy > top.apy ? opp : top
            )
            : null,
        riskScore: data.metrics.riskScore,
        diversificationScore: data.metrics.diversificationScore,
    };

    // Filter functions
    const getFilteredAssets = useCallback(() => {
        return data.assets.filter((asset) => {
            if (
                filters.assetTypes.length > 0 &&
                !filters.assetTypes.includes(asset.type)
            ) return false;
            if (asset.apy < filters.minAPY) return false;
            if (asset.riskScore > filters.maxRisk) return false;
            return true;
        });
    }, [data.assets, filters]);

    const getFilteredOpportunities = useCallback(() => {
        return data.yieldOpportunities.filter((opp) => {
            if (opp.apy < filters.minAPY) return false;
            const riskMap = { low: 1, medium: 2, high: 3 };
            const maxRiskLevel = riskMap[filters.riskTolerance];
            const oppRiskLevel = riskMap[opp.risk];
            if (oppRiskLevel > maxRiskLevel) return false;
            return true;
        });
    }, [data.yieldOpportunities, filters]);

    return {
        // Data
        data,
        stats,
        filters,

        // Filtered data
        filteredAssets: getFilteredAssets(),
        filteredOpportunities: getFilteredOpportunities(),

        // Actions
        refresh: loadDashboardData,
        updateFilters,
        setAutoRefresh,

        // Status
        isConnected,
        account,
        autoRefresh,
    };
}

// Simplified hooks for specific dashboard sections
export function usePortfolioOverview() {
    const { data, stats, isConnected } = usePortfolioDashboard();

    return {
        metrics: data.metrics,
        assets: data.assets.slice(0, 5), // Top 5 assets
        stats,
        predictions: data.predictions.find((p) => p.timeframe === "30d"),
        isLoading: data.isLoading,
        error: data.error,
        isConnected,
    };
}

export function useYieldOpportunities(
    riskTolerance: "low" | "medium" | "high" = "medium",
) {
    const [opportunities, setOpportunities] = useState<YieldOpportunity[]>([]);
    const [defiProtocols, setDefiProtocols] = useState<DeFiProtocol[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadOpportunities = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await defiAggregator.getAllOpportunities(
                [],
                riskTolerance,
            );
            setOpportunities(data.protocols.map((protocol) => ({
                id: protocol.id,
                name: protocol.name,
                protocol: protocol.name,
                type: protocol.category as any,
                asset: "Multi",
                apy: protocol.apy,
                tvl: protocol.tvl,
                risk: protocol.risk,
                minimumDeposit: protocol.minimumDeposit,
                lockupPeriod: protocol.lockupPeriod,
                blockchain: protocol.blockchain,
                description: protocol.description,
                rewards: ["Protocol Token"],
                audited: protocol.audited,
                featured: protocol.verified,
            })));
            setDefiProtocols(data.protocols);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load opportunities",
            );
        } finally {
            setIsLoading(false);
        }
    }, [riskTolerance]);

    useEffect(() => {
        loadOpportunities();
    }, [loadOpportunities]);

    return {
        opportunities,
        protocols: defiProtocols,
        isLoading,
        error,
        refresh: loadOpportunities,
    };
}

export function useMarketInsights() {
    const { data } = usePortfolioDashboard();

    const allInsights = [
        ...data.marketInsights.map((insight) => ({
            ...insight,
            category: "market" as const,
        })),
        ...data.defiInsights.map((insight) => ({
            ...insight,
            category: "defi" as const,
        })),
    ].sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const urgentInsights = allInsights.filter((insight) =>
        insight.urgency === "high"
    );
    const opportunities = allInsights.filter((insight) =>
        insight.type === "opportunity"
    );
    const risks = allInsights.filter((insight) =>
        insight.type === "risk" || insight.type === "risk-alert"
    );

    return {
        allInsights,
        urgentInsights,
        opportunities,
        risks,
        isLoading: data.isLoading,
        error: data.error,
    };
}

export function usePortfolioAnalytics(
    timeframe: "1d" | "7d" | "30d" | "90d" | "1y" = "30d",
) {
    const { data, stats } = usePortfolioDashboard();

    const prediction = data.predictions.find((p) => p.timeframe === timeframe);
    const rebalancingTips = data.rebalancingTips.filter((tip) =>
        tip.severity === "high"
    );

    // Calculate additional analytics
    const assetTypeDistribution = Object.entries(data.metrics.assetTypes).map((
        [type, value],
    ) => ({
        type,
        value,
        percentage: (value / data.metrics.totalValue) * 100,
    }));

    const blockchainDistribution = Object.entries(
        data.metrics.blockchainDistribution,
    ).map(([blockchain, value]) => ({
        blockchain,
        value,
        percentage: (value / data.metrics.totalValue) * 100,
    }));

    const performanceMetrics = {
        sharpeRatio: data.metrics.totalPnlPercentage /
            Math.max(data.metrics.riskScore, 1), // Simplified Sharpe ratio
        volatility: data.metrics.riskScore,
        maxDrawdown: Math.min(...data.assets.map((a) => a.pnlPercentage)) || 0,
        winRate: data.assets.filter((a) => a.pnlPercentage > 0).length /
            Math.max(data.assets.length, 1) * 100,
    };

    return {
        stats,
        prediction,
        rebalancingTips,
        assetTypeDistribution,
        blockchainDistribution,
        performanceMetrics,
        topPerformers: data.metrics.topPerformers,
        underperformers: data.metrics.underperformers,
        isLoading: data.isLoading,
        error: data.error,
    };
}

export function useDeFiStrategies(
    riskTolerance: "low" | "medium" | "high" = "medium",
) {
    const [strategies, setStrategies] = useState<YieldStrategy[]>([]);
    const [crossChainOpportunities, setCrossChainOpportunities] = useState<
        CrossChainOpportunity[]
    >([]);
    const [liquidityPools, setLiquidityPools] = useState<LiquidityPool[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadStrategies = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await defiAggregator.getAllOpportunities(
                [],
                riskTolerance,
            );
            setStrategies(data.strategies);
            setCrossChainOpportunities(data.crossChain);
            setLiquidityPools(data.liquidityPools);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load DeFi strategies",
            );
        } finally {
            setIsLoading(false);
        }
    }, [riskTolerance]);

    useEffect(() => {
        loadStrategies();
    }, [loadStrategies]);

    // Get strategy recommendations based on user profile
    const getRecommendedStrategies = useCallback(
        (userExperience: "beginner" | "intermediate" | "advanced") => {
            return strategies.filter((strategy) =>
                strategy.requirements.experience === userExperience ||
                (userExperience === "advanced" &&
                    strategy.requirements.experience !== "beginner")
            );
        },
        [strategies],
    );

    return {
        strategies,
        crossChainOpportunities,
        liquidityPools,
        getRecommendedStrategies,
        isLoading,
        error,
        refresh: loadStrategies,
    };
}

// Real-time portfolio value hook
export function useRealTimePortfolioValue() {
    const [value, setValue] = useState(0);
    const [change24h, setChange24h] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const { wallet } = useBlockchainData();
    const account = wallet.address;
    const isConnected = wallet.isConnected;

    useEffect(() => {
        if (!isConnected || !account) {
            setValue(0);
            setChange24h(0);
            setIsLoading(false);
            return;
        }

        const updateValue = async () => {
            try {
                const portfolioData = await portfolioService.getPortfolio(
                    account,
                );
                setValue(portfolioData.metrics.totalValue);
                setChange24h(portfolioData.metrics.dailyChange);
            } catch (error) {
                console.error("Error updating portfolio value:", error);
            } finally {
                setIsLoading(false);
            }
        };

        updateValue();
        const interval = setInterval(updateValue, 10000); // Update every 10 seconds

        return () => clearInterval(interval);
    }, [account, isConnected]);

    return {
        value,
        change24h,
        changePercent: value > 0 ? (change24h / value) * 100 : 0,
        isLoading,
        isConnected,
    };
}
