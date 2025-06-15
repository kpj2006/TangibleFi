import { blockchainDataService } from "@/lib/web3/blockchain-data-service";
import { priceService } from "@/lib/web3/price-service";
import { SUPPORTED_NETWORKS } from "@/lib/web3/blockchain-config";

export interface PortfolioAsset {
    id: string;
    name: string;
    symbol: string;
    type: "real-estate" | "commodity" | "equity" | "bond" | "crypto" | "nft";
    contractAddress: string;
    tokenId?: string;
    blockchain: string;
    balance: number;
    currentPrice: number;
    totalValue: number;
    originalPrice: number;
    pnl: number;
    pnlPercentage: number;
    dailyChange: number;
    dailyChangePercentage: number;
    weeklyChange: number;
    monthlyChange: number;
    yearlyChange: number;
    apy: number;
    stakingRewards: number;
    location?: string;
    lastAppraisal?: string;
    riskScore: number;
    liquidityScore: number;
    metadata: {
        description: string;
        image?: string;
        documents?: string[];
        certification?: string;
        lastUpdated: string;
    };
}

export interface PortfolioMetrics {
    totalValue: number;
    totalPnl: number;
    totalPnlPercentage: number;
    dailyChange: number;
    weeklyChange: number;
    monthlyChange: number;
    yearlyChange: number;
    totalYield: number;
    averageApy: number;
    riskScore: number;
    diversificationScore: number;
    liquidityRatio: number;
    assetCount: number;
    assetTypes: Record<string, number>;
    blockchainDistribution: Record<string, number>;
    topPerformers: PortfolioAsset[];
    underperformers: PortfolioAsset[];
}

export interface YieldOpportunity {
    id: string;
    name: string;
    protocol: string;
    type: "lending" | "staking" | "liquidity-mining" | "yield-farming";
    asset: string;
    apy: number;
    tvl: number;
    risk: "low" | "medium" | "high";
    minimumDeposit: number;
    lockupPeriod: number;
    blockchain: string;
    description: string;
    rewards: string[];
    audited: boolean;
    featured: boolean;
}

export interface MarketInsight {
    id: string;
    type: "trend" | "opportunity" | "risk" | "alert";
    title: string;
    description: string;
    impact: "positive" | "negative" | "neutral";
    confidence: number;
    relevantAssets: string[];
    actionable: boolean;
    recommendation?: string;
    timestamp: string;
    source: string;
}

export interface PortfolioPrediction {
    timeframe: "1d" | "7d" | "30d" | "90d" | "1y";
    predictedValue: number;
    predictedChange: number;
    confidence: number;
    factors: {
        name: string;
        impact: number;
        description: string;
    }[];
    scenarios: {
        optimistic: number;
        realistic: number;
        pessimistic: number;
    };
}

export interface RebalancingSuggestion {
    id: string;
    type:
        | "overweight"
        | "underweight"
        | "risk-adjustment"
        | "yield-optimization";
    severity: "low" | "medium" | "high";
    title: string;
    description: string;
    currentAllocation: number;
    suggestedAllocation: number;
    expectedImpact: {
        risk: number;
        return: number;
        diversification: number;
    };
    actions: {
        sell: { asset: string; amount: number }[];
        buy: { asset: string; amount: number }[];
    };
    estimatedCost: number;
    estimatedTime: string;
}

class PortfolioService {
    private cache = new Map<string, { data: any; timestamp: number }>();
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    // Get comprehensive portfolio data
    async getPortfolio(walletAddress: string): Promise<{
        assets: PortfolioAsset[];
        metrics: PortfolioMetrics;
        yieldOpportunities: YieldOpportunity[];
        insights: MarketInsight[];
        predictions: PortfolioPrediction[];
        rebalancingTips: RebalancingSuggestion[];
    }> {
        const cacheKey = `portfolio-${walletAddress}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            // Fetch data from multiple sources in parallel
            const [
                portfolioBalances,
                marketData,
                yieldData,
                newsData,
            ] = await Promise.all([
                blockchainDataService.getPortfolioBalances(walletAddress),
                this.getMarketData(),
                this.getYieldOpportunities(),
                this.getMarketInsights(),
            ]);

            // Process and enrich portfolio data
            const assets = await this.enrichPortfolioAssets(
                portfolioBalances,
                marketData,
            );
            const metrics = this.calculatePortfolioMetrics(assets);
            const yieldOpportunities = this.filterRelevantOpportunities(
                yieldData,
                assets,
            );
            const insights = this.filterRelevantInsights(newsData, assets);
            const predictions = await this.generatePredictions(
                assets,
                marketData,
            );
            const rebalancingTips = this.generateRebalancingTips(
                assets,
                metrics,
            );

            const result = {
                assets,
                metrics,
                yieldOpportunities,
                insights,
                predictions,
                rebalancingTips,
            };

            this.setCachedData(cacheKey, result);
            return result;
        } catch (error) {
            console.error("Portfolio service error:", error);
            throw new Error("Failed to load portfolio data");
        }
    }

    // Enrich basic portfolio data with advanced metrics
    private async enrichPortfolioAssets(
        balances: any[],
        marketData: any,
    ): Promise<PortfolioAsset[]> {
        const enrichedAssets: PortfolioAsset[] = [];

        for (const balance of balances) {
            try {
                const tokenData = marketData[balance.contractAddress] || {};
                const priceHistory = await priceService.getHistoricalPrices(
                    balance.contractAddress,
                    "30d",
                );

                const asset: PortfolioAsset = {
                    id: `${balance.contractAddress}-${balance.tokenId || "0"}`,
                    name: balance.name || tokenData.name || "Unknown Asset",
                    symbol: balance.symbol || tokenData.symbol || "???",
                    type: this.categorizeAsset(balance.name, balance.metadata),
                    contractAddress: balance.contractAddress,
                    tokenId: balance.tokenId,
                    blockchain: balance.network,
                    balance: parseFloat(balance.balance),
                    currentPrice: tokenData.price || 0,
                    totalValue: parseFloat(balance.balance) *
                        (tokenData.price || 0),
                    originalPrice: balance.originalPrice || tokenData.price ||
                        0,
                    pnl: 0, // Will be calculated
                    pnlPercentage: 0,
                    dailyChange: tokenData.change24h || 0,
                    dailyChangePercentage: tokenData.changePercent24h || 0,
                    weeklyChange: this.calculatePeriodChange(priceHistory, 7),
                    monthlyChange: this.calculatePeriodChange(priceHistory, 30),
                    yearlyChange: this.calculatePeriodChange(priceHistory, 365),
                    apy: await this.calculateAssetAPY(balance.contractAddress),
                    stakingRewards: balance.stakingRewards || 0,
                    location: balance.metadata?.location,
                    lastAppraisal: balance.metadata?.lastAppraisal,
                    riskScore: this.calculateRiskScore(tokenData, priceHistory),
                    liquidityScore: this.calculateLiquidityScore(tokenData),
                    metadata: {
                        description: balance.metadata?.description || "",
                        image: balance.metadata?.image,
                        documents: balance.metadata?.documents || [],
                        certification: balance.metadata?.certification,
                        lastUpdated: new Date().toISOString(),
                    },
                };

                // Calculate PnL
                asset.pnl = asset.totalValue -
                    (asset.balance * asset.originalPrice);
                asset.pnlPercentage = asset.originalPrice > 0
                    ? ((asset.currentPrice - asset.originalPrice) /
                        asset.originalPrice) * 100
                    : 0;

                enrichedAssets.push(asset);
            } catch (error) {
                console.error(
                    `Error enriching asset ${balance.contractAddress}:`,
                    error,
                );
            }
        }

        return enrichedAssets;
    }

    // Calculate comprehensive portfolio metrics
    private calculatePortfolioMetrics(
        assets: PortfolioAsset[],
    ): PortfolioMetrics {
        if (assets.length === 0) {
            return {
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
            };
        }

        const totalValue = assets.reduce(
            (sum, asset) => sum + asset.totalValue,
            0,
        );
        const totalOriginalValue = assets.reduce(
            (sum, asset) => sum + (asset.balance * asset.originalPrice),
            0,
        );
        const totalPnl = assets.reduce((sum, asset) => sum + asset.pnl, 0);
        const totalYield = assets.reduce(
            (sum, asset) => sum + asset.stakingRewards,
            0,
        );

        // Asset type distribution
        const assetTypes: Record<string, number> = {};
        const blockchainDistribution: Record<string, number> = {};

        assets.forEach((asset) => {
            assetTypes[asset.type] = (assetTypes[asset.type] || 0) +
                asset.totalValue;
            blockchainDistribution[asset.blockchain] =
                (blockchainDistribution[asset.blockchain] || 0) +
                asset.totalValue;
        });

        // Sort assets for top performers
        const sortedByPerformance = [...assets].sort((a, b) =>
            b.pnlPercentage - a.pnlPercentage
        );

        return {
            totalValue,
            totalPnl,
            totalPnlPercentage: totalOriginalValue > 0
                ? (totalPnl / totalOriginalValue) * 100
                : 0,
            dailyChange: assets.reduce(
                (sum, asset) =>
                    sum +
                    (asset.totalValue * asset.dailyChangePercentage / 100),
                0,
            ),
            weeklyChange: assets.reduce(
                (sum, asset) => sum + asset.weeklyChange,
                0,
            ),
            monthlyChange: assets.reduce(
                (sum, asset) => sum + asset.monthlyChange,
                0,
            ),
            yearlyChange: assets.reduce(
                (sum, asset) => sum + asset.yearlyChange,
                0,
            ),
            totalYield,
            averageApy: assets.reduce((sum, asset) => sum + asset.apy, 0) /
                assets.length,
            riskScore: assets.reduce(
                (sum, asset) => sum + (asset.riskScore * asset.totalValue),
                0,
            ) / totalValue,
            diversificationScore: this.calculateDiversificationScore(
                assetTypes,
            ),
            liquidityRatio: assets.reduce(
                (sum, asset) => sum + (asset.liquidityScore * asset.totalValue),
                0,
            ) / totalValue,
            assetCount: assets.length,
            assetTypes,
            blockchainDistribution,
            topPerformers: sortedByPerformance.slice(0, 5),
            underperformers: sortedByPerformance.slice(-5).reverse(),
        };
    }

    // Get yield farming and staking opportunities
    private async getYieldOpportunities(): Promise<YieldOpportunity[]> {
        // Mock data - in production, fetch from DeFi protocols
        return [
            {
                id: "aave-usdc",
                name: "USDC Lending",
                protocol: "Aave",
                type: "lending",
                asset: "USDC",
                apy: 12.5,
                tvl: 1200000000,
                risk: "low",
                minimumDeposit: 100,
                lockupPeriod: 0,
                blockchain: "ethereum",
                description: "Earn yield by lending USDC on Aave protocol",
                rewards: ["AAVE", "USDC"],
                audited: true,
                featured: true,
            },
            {
                id: "curve-3pool",
                name: "3Pool Liquidity Mining",
                protocol: "Curve Finance",
                type: "liquidity-mining",
                asset: "3CRV",
                apy: 18.7,
                tvl: 850000000,
                risk: "medium",
                minimumDeposit: 50,
                lockupPeriod: 0,
                blockchain: "ethereum",
                description:
                    "Provide liquidity to Curve 3Pool for trading fees and CRV rewards",
                rewards: ["CRV", "Trading Fees"],
                audited: true,
                featured: true,
            },
            {
                id: "compound-eth",
                name: "ETH Staking",
                protocol: "Compound",
                type: "staking",
                asset: "ETH",
                apy: 4.2,
                tvl: 2100000000,
                risk: "low",
                minimumDeposit: 0.1,
                lockupPeriod: 0,
                blockchain: "ethereum",
                description:
                    "Stake ETH and earn rewards through Compound protocol",
                rewards: ["COMP", "ETH"],
                audited: true,
                featured: false,
            },
        ];
    }

    // Get market insights and trends
    private async getMarketInsights(): Promise<MarketInsight[]> {
        // Mock data - in production, fetch from news APIs and analysis services
        return [
            {
                id: "real-estate-trend-1",
                type: "trend",
                title: "Real Estate Market Showing Strong Momentum",
                description:
                    "Tokenized real estate assets have gained 15% this month, driven by institutional adoption",
                impact: "positive",
                confidence: 85,
                relevantAssets: ["real-estate"],
                actionable: true,
                recommendation: "Consider increasing real estate allocation",
                timestamp: new Date().toISOString(),
                source: "Market Analysis AI",
            },
            {
                id: "defi-risk-1",
                type: "risk",
                title: "High Gas Fees Impact DeFi Operations",
                description:
                    "Ethereum gas fees are elevated, affecting profitability of small DeFi transactions",
                impact: "negative",
                confidence: 92,
                relevantAssets: ["ethereum"],
                actionable: true,
                recommendation:
                    "Consider layer 2 solutions or alternative chains",
                timestamp: new Date().toISOString(),
                source: "Network Analysis",
            },
        ];
    }

    // Generate portfolio predictions using AI/ML models
    private async generatePredictions(
        assets: PortfolioAsset[],
        marketData: any,
    ): Promise<PortfolioPrediction[]> {
        // Simplified prediction model - in production, use sophisticated ML models
        const predictions: PortfolioPrediction[] = [];
        const currentValue = assets.reduce(
            (sum, asset) => sum + asset.totalValue,
            0,
        );

        const timeframes: Array<"1d" | "7d" | "30d" | "90d" | "1y"> = [
            "1d",
            "7d",
            "30d",
            "90d",
            "1y",
        ];

        for (const timeframe of timeframes) {
            const volatility = this.calculatePortfolioVolatility(assets);
            const trend = this.calculateTrendScore(assets);

            // Simple prediction model (replace with ML model in production)
            const basePrediction = currentValue *
                (1 + (trend * this.getTimeframMultiplier(timeframe)));
            const confidenceScore = Math.max(20, 90 - (volatility * 10));

            predictions.push({
                timeframe,
                predictedValue: basePrediction,
                predictedChange:
                    ((basePrediction - currentValue) / currentValue) * 100,
                confidence: confidenceScore,
                factors: [
                    {
                        name: "Market Trend",
                        impact: trend * 50,
                        description: trend > 0
                            ? "Positive market momentum"
                            : "Market headwinds",
                    },
                    {
                        name: "Portfolio Diversification",
                        impact: this.calculateDiversificationScore(
                            assets.reduce((acc, asset) => {
                                acc[asset.type] = (acc[asset.type] || 0) +
                                    asset.totalValue;
                                return acc;
                            }, {} as Record<string, number>),
                        ) * 20,
                        description: "Well-diversified portfolio reduces risk",
                    },
                ],
                scenarios: {
                    optimistic: basePrediction * 1.2,
                    realistic: basePrediction,
                    pessimistic: basePrediction * 0.8,
                },
            });
        }

        return predictions;
    }

    // Generate rebalancing suggestions
    private generateRebalancingTips(
        assets: PortfolioAsset[],
        metrics: PortfolioMetrics,
    ): RebalancingSuggestion[] {
        const suggestions: RebalancingSuggestion[] = [];

        // Check for over-concentration in single asset type
        Object.entries(metrics.assetTypes).forEach(([type, value]) => {
            const allocation = (value / metrics.totalValue) * 100;

            if (allocation > 40) {
                suggestions.push({
                    id: `overweight-${type}`,
                    type: "overweight",
                    severity: allocation > 60 ? "high" : "medium",
                    title: `Overweight in ${type}`,
                    description: `Your portfolio is ${
                        allocation.toFixed(1)
                    }% allocated to ${type}, which may increase risk`,
                    currentAllocation: allocation,
                    suggestedAllocation: 30,
                    expectedImpact: {
                        risk: -15,
                        return: 5,
                        diversification: 25,
                    },
                    actions: {
                        sell: [{ asset: type, amount: value * 0.25 }],
                        buy: [{ asset: "mixed", amount: value * 0.25 }],
                    },
                    estimatedCost: 50,
                    estimatedTime: "2-3 days",
                });
            }
        });

        // Check for low-yield assets
        const lowYieldAssets = assets.filter((asset) =>
            asset.apy < 2 && asset.totalValue > 1000
        );
        if (lowYieldAssets.length > 0) {
            suggestions.push({
                id: "yield-optimization",
                type: "yield-optimization",
                severity: "medium",
                title: "Optimize Yield Generation",
                description:
                    `You have ${lowYieldAssets.length} assets with low yield potential`,
                currentAllocation: 0,
                suggestedAllocation: 0,
                expectedImpact: {
                    risk: 5,
                    return: 15,
                    diversification: 0,
                },
                actions: {
                    sell: [],
                    buy: lowYieldAssets.map((asset) => ({
                        asset: `${asset.symbol}-staking`,
                        amount: asset.totalValue * 0.3,
                    })),
                },
                estimatedCost: 25,
                estimatedTime: "1-2 hours",
            });
        }

        return suggestions;
    }

    // Helper methods
    private getCachedData(key: string): any {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
            return cached.data;
        }
        return null;
    }

    private setCachedData(key: string, data: any): void {
        this.cache.set(key, { data, timestamp: Date.now() });
    }

    private async getMarketData(): Promise<any> {
        return await priceService.getMultipleTokenPrices([
            "ethereum",
            "polygon",
            "binancecoin",
        ]);
    }

    private categorizeAsset(
        name: string,
        metadata: any,
    ): PortfolioAsset["type"] {
        const nameKey = name?.toLowerCase() || "";
        const description = metadata?.description?.toLowerCase() || "";

        if (
            nameKey.includes("real estate") || nameKey.includes("property") ||
            description.includes("building")
        ) {
            return "real-estate";
        }
        if (
            nameKey.includes("gold") || nameKey.includes("silver") ||
            nameKey.includes("commodity")
        ) {
            return "commodity";
        }
        if (nameKey.includes("nft") || metadata?.tokenStandard === "ERC721") {
            return "nft";
        }
        if (nameKey.includes("bond") || nameKey.includes("treasury")) {
            return "bond";
        }
        if (nameKey.includes("stock") || nameKey.includes("equity")) {
            return "equity";
        }
        return "crypto";
    }

    private calculatePeriodChange(priceHistory: any[], days: number): number {
        if (!priceHistory || priceHistory.length < 2) return 0;

        const recent = priceHistory[0]?.price || 0;
        const past =
            priceHistory[Math.min(days, priceHistory.length - 1)]?.price ||
            recent;

        return recent - past;
    }

    private async calculateAssetAPY(contractAddress: string): Promise<number> {
        // Mock APY calculation - in production, integrate with DeFi protocols
        return Math.random() * 15; // 0-15% APY
    }

    private calculateRiskScore(tokenData: any, priceHistory: any[]): number {
        // Calculate volatility-based risk score (0-100)
        if (!priceHistory || priceHistory.length < 10) return 50;

        const prices = priceHistory.map((p) => p.price);
        const returns = prices.slice(1).map((price, i) =>
            (price - prices[i]) / prices[i]
        );
        const volatility = Math.sqrt(
            returns.reduce((sum, r) => sum + r * r, 0) / returns.length,
        );

        return Math.min(100, volatility * 1000); // Scale to 0-100
    }

    private calculateLiquidityScore(tokenData: any): number {
        // Calculate liquidity score based on volume and market cap
        const volume = tokenData.volume24h || 0;
        const marketCap = tokenData.marketCap || 1;
        const liquidityRatio = volume / marketCap;

        return Math.min(100, liquidityRatio * 1000);
    }

    private calculateDiversificationScore(
        assetTypes: Record<string, number>,
    ): number {
        const values = Object.values(assetTypes);
        const total = values.reduce((sum, val) => sum + val, 0);

        if (total === 0) return 0;

        // Calculate Herfindahl-Hirschman Index and convert to score
        const hhi = values.reduce(
            (sum, val) => sum + Math.pow(val / total, 2),
            0,
        );
        return Math.max(0, 100 - (hhi * 100));
    }

    private calculatePortfolioVolatility(assets: PortfolioAsset[]): number {
        const totalValue = assets.reduce(
            (sum, asset) => sum + asset.totalValue,
            0,
        );
        if (totalValue === 0) return 0;

        return assets.reduce((sum, asset) => {
            const weight = asset.totalValue / totalValue;
            return sum + (weight * asset.riskScore / 100);
        }, 0);
    }

    private calculateTrendScore(assets: PortfolioAsset[]): number {
        const totalValue = assets.reduce(
            (sum, asset) => sum + asset.totalValue,
            0,
        );
        if (totalValue === 0) return 0;

        return assets.reduce((sum, asset) => {
            const weight = asset.totalValue / totalValue;
            return sum + (weight * asset.monthlyChange / asset.totalValue);
        }, 0);
    }

    private getTimeframMultiplier(timeframe: string): number {
        switch (timeframe) {
            case "1d":
                return 0.01;
            case "7d":
                return 0.05;
            case "30d":
                return 0.15;
            case "90d":
                return 0.35;
            case "1y":
                return 1.0;
            default:
                return 0.1;
        }
    }

    private filterRelevantOpportunities(
        opportunities: YieldOpportunity[],
        assets: PortfolioAsset[],
    ): YieldOpportunity[] {
        const userAssetSymbols = assets.map((asset) =>
            asset.symbol.toLowerCase()
        );
        const userBlockchains = [
            ...new Set(assets.map((asset) => asset.blockchain)),
        ];

        return opportunities
            .filter((opp) =>
                userAssetSymbols.includes(opp.asset.toLowerCase()) ||
                userBlockchains.includes(opp.blockchain)
            )
            .sort((a, b) => b.apy - a.apy);
    }

    private filterRelevantInsights(
        insights: MarketInsight[],
        assets: PortfolioAsset[],
    ): MarketInsight[] {
        const userAssetTypes = [...new Set(assets.map((asset) => asset.type))];

        return insights.filter((insight) =>
            insight.relevantAssets.some((assetType) =>
                userAssetTypes.includes(assetType as any)
            )
        );
    }
}

// Export singleton instance
export const portfolioService = new PortfolioService();
