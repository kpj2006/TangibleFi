import axios from "axios";

export interface PriceData {
    symbol: string;
    price: number;
    priceChange24h: number;
    priceChangePercentage24h: number;
    marketCap?: number;
    volume24h?: number;
    lastUpdated: string;
}

export interface HistoricalPrice {
    timestamp: number;
    price: number;
}

export interface TokenPriceData {
    [tokenAddress: string]: {
        usd: number;
        usd_24h_change: number;
        usd_market_cap?: number;
        usd_24h_vol?: number;
        last_updated_at: number;
    };
}

class PriceService {
    private cache: Map<string, { data: PriceData; timestamp: number }> =
        new Map();
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache to reduce API calls
    private readonly COINGECKO_API = "https://api.coingecko.com/api/v3";
    private readonly COINMARKETCAP_API = "https://pro-api.coinmarketcap.com/v1";
    private readonly API_KEY = typeof process !== "undefined"
        ? process.env.NEXT_PUBLIC_COINGECKO_API_KEY
        : undefined;

    // Rate limiting
    private lastRequestTime = 0;
    private readonly MIN_REQUEST_INTERVAL = 1000; // 1 second between requests
    private requestQueue: Array<() => Promise<any>> = [];
    private isProcessingQueue = false;

    // Popular token addresses to symbol mapping
    private readonly TOKEN_SYMBOLS: Record<string, string> = {
        "0xA0b86a33E6441e8e421c7c7c4b8c8c8c8c8c8c8c": "USDC",
        "0xdAC17F958D2ee523a2206206994597C13D831ec7": "USDT",
        "0x6B175474E89094C44Da98b954EedeAC495271d0F": "DAI",
        "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599": "WBTC",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": "WETH",
        // Polygon tokens
        "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174": "USDC",
        "0xc2132D05D31c914a87C6611C10748AEb04B58e8F": "USDT",
    };

    // CoinGecko ID mapping for major cryptocurrencies
    private readonly COINGECKO_IDS: Record<string, string> = {
        "ETH": "ethereum",
        "BTC": "bitcoin",
        "MATIC": "matic-network",
        "BNB": "binancecoin",
        "USDC": "usd-coin",
        "USDT": "tether",
        "DAI": "dai",
        "WBTC": "wrapped-bitcoin",
        "WETH": "weth",
        "ARB": "arbitrum",
        "OP": "optimism",
    };

    // Mock price data for fallback
    private readonly MOCK_PRICES: Record<string, PriceData> = {
        "ETH": {
            symbol: "ETH",
            price: 3200,
            priceChange24h: 2.5,
            priceChangePercentage24h: 2.5,
            marketCap: 384000000000,
            volume24h: 15000000000,
            lastUpdated: new Date().toISOString(),
        },
        "BTC": {
            symbol: "BTC",
            price: 67000,
            priceChange24h: 1.8,
            priceChangePercentage24h: 1.8,
            marketCap: 1320000000000,
            volume24h: 25000000000,
            lastUpdated: new Date().toISOString(),
        },
        "MATIC": {
            symbol: "MATIC",
            price: 0.85,
            priceChange24h: -1.2,
            priceChangePercentage24h: -1.2,
            marketCap: 8500000000,
            volume24h: 400000000,
            lastUpdated: new Date().toISOString(),
        },
        "BNB": {
            symbol: "BNB",
            price: 620,
            priceChange24h: 0.8,
            priceChangePercentage24h: 0.8,
            marketCap: 92000000000,
            volume24h: 1800000000,
            lastUpdated: new Date().toISOString(),
        },
        "USDC": {
            symbol: "USDC",
            price: 1.0,
            priceChange24h: 0.01,
            priceChangePercentage24h: 0.01,
            marketCap: 32000000000,
            volume24h: 5000000000,
            lastUpdated: new Date().toISOString(),
        },
        "USDT": {
            symbol: "USDT",
            price: 1.0,
            priceChange24h: -0.01,
            priceChangePercentage24h: -0.01,
            marketCap: 120000000000,
            volume24h: 45000000000,
            lastUpdated: new Date().toISOString(),
        },
    };

    private async queueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.requestQueue.push(async () => {
                try {
                    const result = await requestFn();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
            this.processQueue();
        });
    }

    private async processQueue(): Promise<void> {
        if (this.isProcessingQueue || this.requestQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;

        while (this.requestQueue.length > 0) {
            const now = Date.now();
            const timeSinceLastRequest = now - this.lastRequestTime;

            if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
                await new Promise((resolve) =>
                    setTimeout(
                        resolve,
                        this.MIN_REQUEST_INTERVAL - timeSinceLastRequest,
                    )
                );
            }

            const request = this.requestQueue.shift();
            if (request) {
                this.lastRequestTime = Date.now();
                await request();
            }
        }

        this.isProcessingQueue = false;
    }

    private getAxiosConfig() {
        const config: any = {
            timeout: 10000,
            headers: {
                "Accept": "application/json",
            },
        };

        if (this.API_KEY) {
            config.headers["x-cg-demo-api-key"] = this.API_KEY;
        }

        return config;
    }

    async getPrice(symbol: string): Promise<PriceData | null> {
        const cacheKey = symbol.toUpperCase();

        // Check cache first
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
            return cached.data;
        }

        try {
            const price = await this.fetchPriceFromCoinGecko(symbol);
            if (price) {
                this.cache.set(cacheKey, {
                    data: price,
                    timestamp: Date.now(),
                });
                return price;
            }

            // Fallback to mock data
            const mockPrice = this.MOCK_PRICES[symbol.toUpperCase()];
            if (mockPrice) {
                console.log(`Using mock price for ${symbol}`);
                return mockPrice;
            }

            return null;
        } catch (error) {
            console.error(`Failed to fetch price for ${symbol}:`, error);

            // Return cached data if available
            if (cached?.data) {
                return cached.data;
            }

            // Fallback to mock data
            const mockPrice = this.MOCK_PRICES[symbol.toUpperCase()];
            if (mockPrice) {
                console.log(`Using mock price for ${symbol} due to error`);
                return mockPrice;
            }

            return null;
        }
    }

    async getPrices(
        symbols: string[],
    ): Promise<Record<string, PriceData | null>> {
        const results: Record<string, PriceData | null> = {};

        // Check cache first for all symbols
        const uncachedSymbols: string[] = [];
        for (const symbol of symbols) {
            const cacheKey = symbol.toUpperCase();
            const cached = this.cache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
                results[symbol] = cached.data;
            } else {
                uncachedSymbols.push(symbol);
            }
        }

        // If all symbols are cached, return immediately
        if (uncachedSymbols.length === 0) {
            return results;
        }

        try {
            // Try to fetch multiple prices at once for uncached symbols
            const prices = await this.fetchMultiplePricesFromCoinGecko(
                uncachedSymbols,
            );

            for (const symbol of uncachedSymbols) {
                const price = prices[symbol];
                if (price) {
                    results[symbol] = price;
                    this.cache.set(symbol.toUpperCase(), {
                        data: price,
                        timestamp: Date.now(),
                    });
                } else {
                    // Fallback to mock data
                    const mockPrice = this.MOCK_PRICES[symbol.toUpperCase()];
                    if (mockPrice) {
                        console.log(`Using mock price for ${symbol}`);
                        results[symbol] = mockPrice;
                    } else {
                        results[symbol] = null;
                    }
                }
            }
        } catch (error) {
            console.error("Failed to fetch multiple prices:", error);

            // Fallback to individual requests with rate limiting
            for (const symbol of uncachedSymbols) {
                try {
                    const price = await this.getPrice(symbol);
                    results[symbol] = price;
                } catch (individualError) {
                    console.error(
                        `Failed to fetch individual price for ${symbol}:`,
                        individualError,
                    );

                    // Use mock data as final fallback
                    const mockPrice = this.MOCK_PRICES[symbol.toUpperCase()];
                    if (mockPrice) {
                        console.log(
                            `Using mock price for ${symbol} due to individual error`,
                        );
                        results[symbol] = mockPrice;
                    } else {
                        results[symbol] = null;
                    }
                }
            }
        }

        return results;
    }

    async getTokenPrice(
        tokenAddress: string,
        chainId: number = 1,
    ): Promise<PriceData | null> {
        const symbol = this.TOKEN_SYMBOLS[tokenAddress];
        if (symbol) {
            return this.getPrice(symbol);
        }

        try {
            // Fallback to CoinGecko token price API
            const platform = this.getCoingeckoPlatformId(chainId);
            if (!platform) return null;

            const response = await this.queueRequest(() =>
                axios.get(
                    `${this.COINGECKO_API}/simple/token_price/${platform}`,
                    {
                        ...this.getAxiosConfig(),
                        params: {
                            contract_addresses: tokenAddress,
                            vs_currencies: "usd",
                            include_24hr_change: true,
                            include_market_cap: true,
                            include_24hr_vol: true,
                        },
                    },
                )
            );

            const data = response.data[tokenAddress.toLowerCase()];
            if (!data) return null;

            return {
                symbol: tokenAddress,
                price: data.usd,
                priceChange24h: data.usd_24h_change || 0,
                priceChangePercentage24h: data.usd_24h_change || 0,
                marketCap: data.usd_market_cap,
                volume24h: data.usd_24h_vol,
                lastUpdated: new Date().toISOString(),
            };
        } catch (error) {
            console.error(
                `Failed to fetch token price for ${tokenAddress}:`,
                error,
            );
            return null;
        }
    }

    async getHistoricalPrices(
        symbol: string,
        days: number = 30,
    ): Promise<HistoricalPrice[]> {
        try {
            const coinId = this.COINGECKO_IDS[symbol.toUpperCase()];
            if (!coinId) return [];

            const response = await this.queueRequest(() =>
                axios.get(
                    `${this.COINGECKO_API}/coins/${coinId}/market_chart`,
                    {
                        ...this.getAxiosConfig(),
                        params: {
                            vs_currency: "usd",
                            days: days,
                            interval: days > 1 ? "daily" : "hourly",
                        },
                    },
                )
            );

            return response.data.prices.map((
                [timestamp, price]: [number, number],
            ) => ({
                timestamp,
                price,
            }));
        } catch (error) {
            console.error(
                `Failed to fetch historical prices for ${symbol}:`,
                error,
            );
            return [];
        }
    }

    private async fetchPriceFromCoinGecko(
        symbol: string,
    ): Promise<PriceData | null> {
        const coinId = this.COINGECKO_IDS[symbol.toUpperCase()];
        if (!coinId) return null;

        const response = await this.queueRequest(() =>
            axios.get(
                `${this.COINGECKO_API}/simple/price`,
                {
                    ...this.getAxiosConfig(),
                    params: {
                        ids: coinId,
                        vs_currencies: "usd",
                        include_24hr_change: true,
                        include_market_cap: true,
                        include_24hr_vol: true,
                    },
                },
            )
        );

        const data = response.data[coinId];
        if (!data) return null;

        return {
            symbol: symbol.toUpperCase(),
            price: data.usd,
            priceChange24h: data.usd_24h_change || 0,
            priceChangePercentage24h: data.usd_24h_change || 0,
            marketCap: data.usd_market_cap,
            volume24h: data.usd_24h_vol,
            lastUpdated: new Date().toISOString(),
        };
    }

    private async fetchMultiplePricesFromCoinGecko(
        symbols: string[],
    ): Promise<Record<string, PriceData | null>> {
        const coinIds = symbols
            .map((symbol) => this.COINGECKO_IDS[symbol.toUpperCase()])
            .filter(Boolean);

        if (coinIds.length === 0) return {};

        const response = await this.queueRequest(() =>
            axios.get(
                `${this.COINGECKO_API}/simple/price`,
                {
                    ...this.getAxiosConfig(),
                    params: {
                        ids: coinIds.join(","),
                        vs_currencies: "usd",
                        include_24hr_change: true,
                        include_market_cap: true,
                        include_24hr_vol: true,
                    },
                },
            )
        );

        const results: Record<string, PriceData | null> = {};

        symbols.forEach((symbol) => {
            const coinId = this.COINGECKO_IDS[symbol.toUpperCase()];
            const data = coinId ? response.data[coinId] : null;

            if (data) {
                results[symbol] = {
                    symbol: symbol.toUpperCase(),
                    price: data.usd,
                    priceChange24h: data.usd_24h_change || 0,
                    priceChangePercentage24h: data.usd_24h_change || 0,
                    marketCap: data.usd_market_cap,
                    volume24h: data.usd_24h_vol,
                    lastUpdated: new Date().toISOString(),
                };
            } else {
                results[symbol] = null;
            }
        });

        return results;
    }

    private getCoingeckoPlatformId(chainId: number): string | null {
        const platformMap: Record<number, string> = {
            1: "ethereum",
            137: "polygon-pos",
            56: "binance-smart-chain",
            42161: "arbitrum-one",
            10: "optimistic-ethereum",
        };

        return platformMap[chainId] || null;
    }

    // Calculate USD value for a token balance
    calculateUSDValue(balance: string, price: number): number {
        return parseFloat(balance) * price;
    }

    // Format price for display
    formatPrice(price: number): string {
        if (price >= 1) {
            return price.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
        } else {
            return price.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 6,
                maximumFractionDigits: 6,
            });
        }
    }

    // Format percentage change
    formatPercentageChange(change: number): string {
        const sign = change >= 0 ? "+" : "";
        return `${sign}${change.toFixed(2)}%`;
    }

    // Clear cache (useful for manual refresh)
    clearCache(): void {
        this.cache.clear();
    }

    // Get cached prices (for offline mode)
    getCachedPrices(): Record<string, PriceData> {
        const cached: Record<string, PriceData> = {};
        this.cache.forEach((value, key) => {
            cached[key] = value.data;
        });
        return cached;
    }

    // Market data aggregation
    async getMarketOverview(): Promise<
        {
            totalMarketCap: number;
            totalVolume24h: number;
            btcDominance: number;
            marketCapChange24h: number;
        } | null
    > {
        try {
            const response = await this.queueRequest(() =>
                axios.get(`${this.COINGECKO_API}/global`, this.getAxiosConfig())
            );
            const data = response.data.data;

            return {
                totalMarketCap: data.total_market_cap.usd,
                totalVolume24h: data.total_volume.usd,
                btcDominance: data.market_cap_percentage.btc,
                marketCapChange24h: data.market_cap_change_percentage_24h_usd,
            };
        } catch (error) {
            console.error("Failed to fetch market overview:", error);
            // Return mock market data
            return {
                totalMarketCap: 2400000000000,
                totalVolume24h: 85000000000,
                btcDominance: 55.2,
                marketCapChange24h: 1.8,
            };
        }
    }

    // Trending tokens
    async getTrendingTokens(): Promise<
        Array<{
            id: string;
            name: string;
            symbol: string;
            rank: number;
            price: number;
            change24h: number;
        }>
    > {
        try {
            const response = await this.queueRequest(() =>
                axios.get(
                    `${this.COINGECKO_API}/search/trending`,
                    this.getAxiosConfig(),
                )
            );
            return response.data.coins.map((coin: any) => ({
                id: coin.item.id,
                name: coin.item.name,
                symbol: coin.item.symbol,
                rank: coin.item.market_cap_rank,
                price: 0, // Would need additional API call for price
                change24h: 0, // Would need additional API call for change
            }));
        } catch (error) {
            console.error("Failed to fetch trending tokens:", error);
            // Return mock trending data
            return [
                {
                    id: "bitcoin",
                    name: "Bitcoin",
                    symbol: "BTC",
                    rank: 1,
                    price: 67000,
                    change24h: 1.8,
                },
                {
                    id: "ethereum",
                    name: "Ethereum",
                    symbol: "ETH",
                    rank: 2,
                    price: 3200,
                    change24h: 2.5,
                },
                {
                    id: "binancecoin",
                    name: "BNB",
                    symbol: "BNB",
                    rank: 4,
                    price: 620,
                    change24h: 0.8,
                },
            ];
        }
    }
}

// Create and export singleton instance
export const priceService = new PriceService();

// Utility functions
export function formatCurrency(amount: number): string {
    return priceService.formatPrice(amount);
}

export function formatPercentage(percentage: number): string {
    return priceService.formatPercentageChange(percentage);
}
