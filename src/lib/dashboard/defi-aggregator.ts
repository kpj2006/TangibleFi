import { ethers } from "ethers";
import { priceService } from "@/lib/web3/price-service";
import { blockchainDataService } from "@/lib/web3/blockchain-data-service";

export interface DeFiProtocol {
    id: string;
    name: string;
    category:
        | "lending"
        | "dex"
        | "yield-farming"
        | "staking"
        | "options"
        | "insurance";
    blockchain: string;
    tvl: number;
    apy: number;
    risk: "low" | "medium" | "high";
    audited: boolean;
    contractAddress: string;
    website: string;
    description: string;
    features: string[];
    minimumDeposit: number;
    fees: {
        deposit: number;
        withdrawal: number;
        performance: number;
    };
    lockupPeriod: number;
    autoCompound: boolean;
    verified: boolean;
    logo: string;
}

export interface LendingOpportunity {
    protocol: string;
    asset: string;
    supplyAPY: number;
    borrowAPY: number;
    utilization: number;
    totalSupply: number;
    totalBorrow: number;
    collateralFactor: number;
    liquidationThreshold: number;
    reserveFactor: number;
    blockchain: string;
    contractAddress: string;
    priceOracle: string;
    lastUpdated: string;
}

export interface YieldStrategy {
    id: string;
    name: string;
    description: string;
    category: "conservative" | "moderate" | "aggressive";
    expectedAPY: number;
    riskScore: number;
    tvl: number;
    protocols: string[];
    steps: {
        action: "supply" | "borrow" | "swap" | "stake" | "compound";
        protocol: string;
        asset: string;
        amount: number;
        apy: number;
        description: string;
    }[];
    requirements: {
        minimumAmount: number;
        assets: string[];
        experience: "beginner" | "intermediate" | "advanced";
    };
    risks: string[];
    timeCommitment: string;
    automation: {
        available: boolean;
        cost: number;
        features: string[];
    };
}

export interface CrossChainOpportunity {
    id: string;
    name: string;
    sourceChain: string;
    targetChain: string;
    asset: string;
    sourceAPY: number;
    targetAPY: number;
    bridgeFee: number;
    gasCost: number;
    totalYield: number;
    estimatedTime: string;
    bridgeProtocol: string;
    targetProtocol: string;
    riskFactors: string[];
    profitPotential: number;
}

export interface LiquidityPool {
    id: string;
    protocol: string;
    name: string;
    tokens: {
        symbol: string;
        address: string;
        weight: number;
        reserve: number;
    }[];
    totalLiquidity: number;
    volume24h: number;
    fees24h: number;
    apy: number;
    impermanentLoss: number;
    blockchain: string;
    contractAddress: string;
    swapFee: number;
    rewards: {
        token: string;
        apy: number;
        emissions: number;
    }[];
}

export interface ArbitrageOpportunity {
    id: string;
    asset: string;
    buyExchange: string;
    sellExchange: string;
    buyPrice: number;
    sellPrice: number;
    priceDiscrepancy: number;
    profitPercent: number;
    volume: number;
    gasCost: number;
    netProfit: number;
    timeWindow: number;
    blockchain: string;
    risk: "low" | "medium" | "high";
    complexity: "simple" | "moderate" | "complex";
}

export interface DeFiInsight {
    id: string;
    type: "market-move" | "protocol-update" | "yield-change" | "risk-alert";
    title: string;
    description: string;
    impact: "positive" | "negative" | "neutral";
    urgency: "low" | "medium" | "high";
    protocols: string[];
    recommendedAction: string;
    estimatedImpact: number;
    timestamp: string;
    source: string;
}

class DeFiAggregator {
    private cache = new Map<string, { data: any; timestamp: number }>();
    private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for DeFi data

    // Get comprehensive DeFi opportunities
    async getAllOpportunities(
        userAssets: string[],
        riskTolerance: "low" | "medium" | "high",
    ): Promise<{
        protocols: DeFiProtocol[];
        lending: LendingOpportunity[];
        strategies: YieldStrategy[];
        crossChain: CrossChainOpportunity[];
        liquidityPools: LiquidityPool[];
        arbitrage: ArbitrageOpportunity[];
        insights: DeFiInsight[];
    }> {
        const cacheKey = `defi-all-${userAssets.join(",")}-${riskTolerance}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            const [
                protocols,
                lending,
                strategies,
                crossChain,
                liquidityPools,
                arbitrage,
                insights,
            ] = await Promise.all([
                this.getTopProtocols(),
                this.getLendingOpportunities(userAssets),
                this.getYieldStrategies(riskTolerance),
                this.getCrossChainOpportunities(userAssets),
                this.getLiquidityPools(userAssets),
                this.getArbitrageOpportunities(userAssets),
                this.getDeFiInsights(),
            ]);

            const result = {
                protocols: this.filterProtocolsByRisk(protocols, riskTolerance),
                lending: this.filterLendingByRisk(lending, riskTolerance),
                strategies: strategies.filter((s) =>
                    s.category === riskTolerance || riskTolerance === "high"
                ),
                crossChain: this.filterCrossChainByRisk(
                    crossChain,
                    riskTolerance,
                ),
                liquidityPools: this.filterPoolsByRisk(
                    liquidityPools,
                    riskTolerance,
                ),
                arbitrage: this.filterArbitrageByRisk(arbitrage, riskTolerance),
                insights,
            };

            this.setCachedData(cacheKey, result);
            return result;
        } catch (error) {
            console.error("DeFi aggregator error:", error);
            throw new Error("Failed to fetch DeFi opportunities");
        }
    }

    // Get top DeFi protocols by TVL and user preference
    async getTopProtocols(): Promise<DeFiProtocol[]> {
        return [
            {
                id: "aave-v3",
                name: "Aave V3",
                category: "lending",
                blockchain: "ethereum",
                tvl: 6200000000,
                apy: 8.5,
                risk: "low",
                audited: true,
                contractAddress: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
                website: "https://aave.com",
                description:
                    "Leading decentralized lending protocol with high liquidity",
                features: [
                    "Flash Loans",
                    "Collateral Swapping",
                    "Isolation Mode",
                ],
                minimumDeposit: 0.01,
                fees: { deposit: 0, withdrawal: 0, performance: 0 },
                lockupPeriod: 0,
                autoCompound: true,
                verified: true,
                logo: "/protocols/aave.png",
            },
            {
                id: "compound-v3",
                name: "Compound V3",
                category: "lending",
                blockchain: "ethereum",
                tvl: 2800000000,
                apy: 7.2,
                risk: "low",
                audited: true,
                contractAddress: "0xc3d688B66703497DAA19211EEdff47f25384cdc3",
                website: "https://compound.finance",
                description:
                    "Autonomous interest rate protocol for borrowing and lending",
                features: [
                    "Autonomous Interest Rates",
                    "cToken Rewards",
                    "Governance",
                ],
                minimumDeposit: 0.01,
                fees: { deposit: 0, withdrawal: 0, performance: 0 },
                lockupPeriod: 0,
                autoCompound: false,
                verified: true,
                logo: "/protocols/compound.png",
            },
            {
                id: "uniswap-v3",
                name: "Uniswap V3",
                category: "dex",
                blockchain: "ethereum",
                tvl: 3400000000,
                apy: 15.8,
                risk: "medium",
                audited: true,
                contractAddress: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
                website: "https://uniswap.org",
                description:
                    "Leading DEX with concentrated liquidity and LP rewards",
                features: [
                    "Concentrated Liquidity",
                    "Multiple Fee Tiers",
                    "LP NFTs",
                ],
                minimumDeposit: 100,
                fees: { deposit: 0, withdrawal: 0.05, performance: 0.3 },
                lockupPeriod: 0,
                autoCompound: false,
                verified: true,
                logo: "/protocols/uniswap.png",
            },
            {
                id: "curve-finance",
                name: "Curve Finance",
                category: "dex",
                blockchain: "ethereum",
                tvl: 1900000000,
                apy: 12.4,
                risk: "medium",
                audited: true,
                contractAddress: "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7",
                website: "https://curve.fi",
                description: "Stablecoin-focused DEX with low slippage trading",
                features: [
                    "Low Slippage",
                    "Stablecoin Pools",
                    "Boosted Rewards",
                ],
                minimumDeposit: 50,
                fees: { deposit: 0, withdrawal: 0.04, performance: 0.5 },
                lockupPeriod: 0,
                autoCompound: true,
                verified: true,
                logo: "/protocols/curve.png",
            },
            {
                id: "convex-finance",
                name: "Convex Finance",
                category: "yield-farming",
                blockchain: "ethereum",
                tvl: 1200000000,
                apy: 18.9,
                risk: "medium",
                audited: true,
                contractAddress: "0xF403C135812408BFbE8713b5A23a04b3D48AAE31",
                website: "https://www.convexfinance.com",
                description: "Boosted Curve rewards with simplified staking",
                features: [
                    "Boosted CRV Rewards",
                    "CVX Rewards",
                    "Auto-Compounding",
                ],
                minimumDeposit: 100,
                fees: { deposit: 0, withdrawal: 0, performance: 16 },
                lockupPeriod: 0,
                autoCompound: true,
                verified: true,
                logo: "/protocols/convex.png",
            },
            {
                id: "yearn-finance",
                name: "Yearn Finance",
                category: "yield-farming",
                blockchain: "ethereum",
                tvl: 800000000,
                apy: 22.1,
                risk: "high",
                audited: true,
                contractAddress: "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e",
                website: "https://yearn.finance",
                description: "Automated yield farming strategies and vaults",
                features: [
                    "Strategy Automation",
                    "Vault Optimization",
                    "Gas Efficiency",
                ],
                minimumDeposit: 200,
                fees: { deposit: 0, withdrawal: 0.5, performance: 20 },
                lockupPeriod: 0,
                autoCompound: true,
                verified: true,
                logo: "/protocols/yearn.png",
            },
        ];
    }

    // Get lending opportunities across protocols
    async getLendingOpportunities(
        assets: string[],
    ): Promise<LendingOpportunity[]> {
        return [
            {
                protocol: "Aave V3",
                asset: "USDC",
                supplyAPY: 4.85,
                borrowAPY: 5.42,
                utilization: 89.5,
                totalSupply: 1250000000,
                totalBorrow: 1118750000,
                collateralFactor: 0.85,
                liquidationThreshold: 0.88,
                reserveFactor: 0.10,
                blockchain: "ethereum",
                contractAddress: "0xA0b86a33E6417f59a6aD48b8A60C8a62aA9da5Af",
                priceOracle: "0x54586bE62E3c3580375aE3723C145253060Ca0C2",
                lastUpdated: new Date().toISOString(),
            },
            {
                protocol: "Aave V3",
                asset: "WETH",
                supplyAPY: 1.95,
                borrowAPY: 2.84,
                utilization: 68.7,
                totalSupply: 850000,
                totalBorrow: 584000,
                collateralFactor: 0.82,
                liquidationThreshold: 0.85,
                reserveFactor: 0.15,
                blockchain: "ethereum",
                contractAddress: "0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8",
                priceOracle: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
                lastUpdated: new Date().toISOString(),
            },
            {
                protocol: "Compound V3",
                asset: "USDC",
                supplyAPY: 4.25,
                borrowAPY: 5.15,
                utilization: 85.2,
                totalSupply: 980000000,
                totalBorrow: 835000000,
                collateralFactor: 0.80,
                liquidationThreshold: 0.83,
                reserveFactor: 0.25,
                blockchain: "ethereum",
                contractAddress: "0xc3d688B66703497DAA19211EEdff47f25384cdc3",
                priceOracle: "0x50ce56A3239671Ab62f185704Caedf626352741e",
                lastUpdated: new Date().toISOString(),
            },
        ];
    }

    // Get advanced yield strategies
    async getYieldStrategies(riskTolerance: string): Promise<YieldStrategy[]> {
        return [
            {
                id: "stable-lending",
                name: "Stable Lending Strategy",
                description:
                    "Conservative approach with stablecoin lending on blue-chip protocols",
                category: "conservative",
                expectedAPY: 5.2,
                riskScore: 15,
                tvl: 2500000000,
                protocols: ["Aave V3", "Compound V3"],
                steps: [
                    {
                        action: "supply",
                        protocol: "Aave V3",
                        asset: "USDC",
                        amount: 0.7,
                        apy: 4.85,
                        description: "Supply 70% to Aave for stable returns",
                    },
                    {
                        action: "supply",
                        protocol: "Compound V3",
                        asset: "USDT",
                        amount: 0.3,
                        apy: 4.25,
                        description: "Diversify remaining 30% to Compound",
                    },
                ],
                requirements: {
                    minimumAmount: 1000,
                    assets: ["USDC", "USDT"],
                    experience: "beginner",
                },
                risks: ["Smart contract risk", "Interest rate fluctuation"],
                timeCommitment: "5 minutes setup",
                automation: {
                    available: true,
                    cost: 0.1,
                    features: ["Auto-rebalancing", "Yield optimization"],
                },
            },
            {
                id: "leveraged-yield",
                name: "Leveraged Yield Farming",
                description:
                    "Borrow against collateral to amplify yields through recursive strategies",
                category: "aggressive",
                expectedAPY: 28.7,
                riskScore: 75,
                tvl: 180000000,
                protocols: ["Aave V3", "Curve Finance", "Convex"],
                steps: [
                    {
                        action: "supply",
                        protocol: "Aave V3",
                        asset: "WETH",
                        amount: 1.0,
                        apy: 1.95,
                        description: "Deposit ETH as collateral",
                    },
                    {
                        action: "borrow",
                        protocol: "Aave V3",
                        asset: "USDC",
                        amount: 0.75,
                        apy: -5.42,
                        description: "Borrow USDC against ETH (75% LTV)",
                    },
                    {
                        action: "supply",
                        protocol: "Curve Finance",
                        asset: "3CRV",
                        amount: 1.0,
                        apy: 12.4,
                        description: "Provide liquidity to Curve 3Pool",
                    },
                    {
                        action: "stake",
                        protocol: "Convex",
                        asset: "3CRV-LP",
                        amount: 1.0,
                        apy: 18.9,
                        description: "Stake LP tokens for boosted rewards",
                    },
                ],
                requirements: {
                    minimumAmount: 5000,
                    assets: ["WETH"],
                    experience: "advanced",
                },
                risks: ["Liquidation risk", "IL risk", "High complexity"],
                timeCommitment: "30-45 minutes setup",
                automation: {
                    available: true,
                    cost: 0.5,
                    features: [
                        "Health monitoring",
                        "Auto-deleveraging",
                        "Rebalancing",
                    ],
                },
            },
        ];
    }

    // Get cross-chain arbitrage opportunities
    async getCrossChainOpportunities(
        assets: string[],
    ): Promise<CrossChainOpportunity[]> {
        return [
            {
                id: "eth-polygon-usdc",
                name: "USDC: Ethereum → Polygon",
                sourceChain: "ethereum",
                targetChain: "polygon",
                asset: "USDC",
                sourceAPY: 4.85,
                targetAPY: 12.2,
                bridgeFee: 0.1,
                gasCost: 35,
                totalYield: 7.15,
                estimatedTime: "15-20 minutes",
                bridgeProtocol: "Polygon Bridge",
                targetProtocol: "Aave Polygon",
                riskFactors: ["Bridge risk", "Cross-chain delay"],
                profitPotential: 7.35,
            },
            {
                id: "eth-arbitrum-weth",
                name: "WETH: Ethereum → Arbitrum",
                sourceChain: "ethereum",
                targetChain: "arbitrum",
                asset: "WETH",
                sourceAPY: 1.95,
                targetAPY: 6.8,
                bridgeFee: 0.05,
                gasCost: 45,
                totalYield: 4.8,
                estimatedTime: "10-15 minutes",
                bridgeProtocol: "Arbitrum Bridge",
                targetProtocol: "GMX Staking",
                riskFactors: ["Bridge risk", "Protocol risk"],
                profitPotential: 4.85,
            },
        ];
    }

    // Get liquidity pool opportunities
    async getLiquidityPools(assets: string[]): Promise<LiquidityPool[]> {
        return [
            {
                id: "uni-v3-usdc-eth",
                protocol: "Uniswap V3",
                name: "USDC/ETH 0.05%",
                tokens: [
                    {
                        symbol: "USDC",
                        address: "0xA0b86a33E6417f59a6aD48b8A60C8a62aA9da5Af",
                        weight: 50,
                        reserve: 125000000,
                    },
                    {
                        symbol: "WETH",
                        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                        weight: 50,
                        reserve: 68500,
                    },
                ],
                totalLiquidity: 250000000,
                volume24h: 45000000,
                fees24h: 22500,
                apy: 15.8,
                impermanentLoss: 2.3,
                blockchain: "ethereum",
                contractAddress: "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640",
                swapFee: 0.05,
                rewards: [
                    { token: "UNI", apy: 3.2, emissions: 158400 },
                ],
            },
            {
                id: "curve-3pool",
                protocol: "Curve Finance",
                name: "3Pool (USDC/USDT/DAI)",
                tokens: [
                    {
                        symbol: "USDC",
                        address: "0xA0b86a33E6417f59a6aD48b8A60C8a62aA9da5Af",
                        weight: 33.3,
                        reserve: 285000000,
                    },
                    {
                        symbol: "USDT",
                        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
                        weight: 33.3,
                        reserve: 290000000,
                    },
                    {
                        symbol: "DAI",
                        address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
                        weight: 33.4,
                        reserve: 295000000,
                    },
                ],
                totalLiquidity: 870000000,
                volume24h: 18000000,
                fees24h: 72000,
                apy: 12.4,
                impermanentLoss: 0.1,
                blockchain: "ethereum",
                contractAddress: "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7",
                swapFee: 0.04,
                rewards: [
                    { token: "CRV", apy: 8.9, emissions: 1250000 },
                    { token: "CVX", apy: 3.5, emissions: 485000 },
                ],
            },
        ];
    }

    // Get arbitrage opportunities
    async getArbitrageOpportunities(
        assets: string[],
    ): Promise<ArbitrageOpportunity[]> {
        return [
            {
                id: "usdc-uniswap-sushiswap",
                asset: "USDC",
                buyExchange: "SushiSwap",
                sellExchange: "Uniswap V3",
                buyPrice: 0.9985,
                sellPrice: 1.0015,
                priceDiscrepancy: 0.003,
                profitPercent: 0.3,
                volume: 50000,
                gasCost: 65,
                netProfit: 85,
                timeWindow: 45,
                blockchain: "ethereum",
                risk: "low",
                complexity: "simple",
            },
            {
                id: "weth-1inch-paraswap",
                asset: "WETH",
                buyExchange: "1inch",
                sellExchange: "ParaSwap",
                buyPrice: 2456.80,
                sellPrice: 2459.20,
                priceDiscrepancy: 2.40,
                profitPercent: 0.098,
                volume: 25000,
                gasCost: 125,
                netProfit: 615,
                timeWindow: 30,
                blockchain: "ethereum",
                risk: "medium",
                complexity: "moderate",
            },
        ];
    }

    // Get DeFi market insights
    async getDeFiInsights(): Promise<DeFiInsight[]> {
        return [
            {
                id: "aave-rate-increase",
                type: "yield-change",
                title: "Aave Interest Rates Climbing",
                description:
                    "USDC supply rates on Aave have increased 15% this week due to increased borrowing demand",
                impact: "positive",
                urgency: "medium",
                protocols: ["Aave V3"],
                recommendedAction:
                    "Consider moving more USDC to Aave for higher yields",
                estimatedImpact: 0.8,
                timestamp: new Date().toISOString(),
                source: "Protocol Analysis",
            },
            {
                id: "curve-pool-imbalance",
                type: "risk-alert",
                title: "Curve Pool Imbalance Detected",
                description:
                    "3Pool showing unusual USDT concentration, potential arbitrage risk",
                impact: "negative",
                urgency: "high",
                protocols: ["Curve Finance"],
                recommendedAction:
                    "Monitor positions closely, consider partial exit",
                estimatedImpact: -1.2,
                timestamp: new Date().toISOString(),
                source: "Risk Monitoring",
            },
        ];
    }

    // Helper methods for filtering by risk tolerance
    private filterProtocolsByRisk(
        protocols: DeFiProtocol[],
        risk: string,
    ): DeFiProtocol[] {
        const riskMap = {
            low: ["low"],
            medium: ["low", "medium"],
            high: ["low", "medium", "high"],
        };
        return protocols.filter((p) =>
            riskMap[risk as keyof typeof riskMap].includes(p.risk)
        );
    }

    private filterLendingByRisk(
        lending: LendingOpportunity[],
        risk: string,
    ): LendingOpportunity[] {
        // Filter based on utilization rates (higher utilization = higher risk)
        const maxUtilization = { low: 80, medium: 90, high: 95 };
        return lending.filter((l) =>
            l.utilization <= maxUtilization[risk as keyof typeof maxUtilization]
        );
    }

    private filterCrossChainByRisk(
        crossChain: CrossChainOpportunity[],
        risk: string,
    ): CrossChainOpportunity[] {
        if (risk === "low") return []; // Cross-chain inherently medium+ risk
        return crossChain.filter((c) =>
            c.riskFactors.length <= (risk === "medium" ? 2 : 5)
        );
    }

    private filterPoolsByRisk(
        pools: LiquidityPool[],
        risk: string,
    ): LiquidityPool[] {
        const maxIL = { low: 1, medium: 5, high: 20 };
        return pools.filter((p) =>
            p.impermanentLoss <= maxIL[risk as keyof typeof maxIL]
        );
    }

    private filterArbitrageByRisk(
        arbitrage: ArbitrageOpportunity[],
        risk: string,
    ): ArbitrageOpportunity[] {
        const allowedComplexity = {
            low: ["simple"],
            medium: ["simple", "moderate"],
            high: ["simple", "moderate", "complex"],
        };
        return arbitrage.filter((a) =>
            allowedComplexity[risk as keyof typeof allowedComplexity].includes(
                a.complexity,
            )
        );
    }

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
}

// Export singleton instance
export const defiAggregator = new DeFiAggregator();
