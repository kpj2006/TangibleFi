import { NextRequest, NextResponse } from "next/server";
import { blockchainDataService } from "@/lib/web3/blockchain-data-service";
import { priceService } from "@/lib/web3/price-service";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get("type") || "overview";
        const symbols = searchParams.get("symbols")?.split(",");
        const refreshCache = searchParams.get("refresh") === "true";

        // Clear cache if requested
        if (refreshCache) {
            priceService.clearCache();
        }

        switch (type) {
            case "overview":
                const marketData = await blockchainDataService.getMarketData();
                return NextResponse.json({
                    success: true,
                    data: marketData,
                    timestamp: Date.now(),
                });

            case "prices":
                if (!symbols || symbols.length === 0) {
                    return NextResponse.json(
                        {
                            error:
                                "Symbols parameter is required for price queries",
                        },
                        { status: 400 },
                    );
                }

                const prices = await priceService.getPrices(symbols);
                return NextResponse.json({
                    success: true,
                    data: prices,
                    timestamp: Date.now(),
                });

            case "historical":
                const symbol = searchParams.get("symbol");
                const days = parseInt(searchParams.get("days") || "30");

                if (!symbol) {
                    return NextResponse.json(
                        {
                            error:
                                "Symbol parameter is required for historical data",
                        },
                        { status: 400 },
                    );
                }

                const historicalData = await priceService.getHistoricalPrices(
                    symbol,
                    days,
                );
                return NextResponse.json({
                    success: true,
                    data: {
                        symbol,
                        days,
                        prices: historicalData,
                    },
                    timestamp: Date.now(),
                });

            case "trending":
                const trending = await priceService.getTrendingTokens();
                return NextResponse.json({
                    success: true,
                    data: trending,
                    timestamp: Date.now(),
                });

            case "metrics":
                const metrics = await blockchainDataService
                    .getBlockchainMetrics();
                return NextResponse.json({
                    success: true,
                    data: metrics,
                    timestamp: Date.now(),
                });

            default:
                return NextResponse.json(
                    { error: "Invalid type parameter" },
                    { status: 400 },
                );
        }
    } catch (error) {
        console.error("Market API error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch market data",
                details: error instanceof Error
                    ? error.message
                    : "Unknown error",
            },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, symbols, watchlist } = body;

        switch (action) {
            case "bulk_prices":
                if (!symbols || !Array.isArray(symbols)) {
                    return NextResponse.json(
                        { error: "Symbols array is required" },
                        { status: 400 },
                    );
                }

                const bulkPrices = await priceService.getPrices(symbols);
                return NextResponse.json({
                    success: true,
                    data: bulkPrices,
                    message: "Bulk prices fetched successfully",
                });

            case "add_to_watchlist":
                // In a real implementation, you'd save this to the user's profile
                return NextResponse.json({
                    success: true,
                    message:
                        "Added to watchlist (implement user-specific storage)",
                    data: { watchlist: [...(watchlist || []), symbols] },
                });

            case "refresh_all":
                priceService.clearCache();
                await blockchainDataService.refreshAll();

                const refreshedMarketData = await blockchainDataService
                    .getMarketData();
                return NextResponse.json({
                    success: true,
                    data: refreshedMarketData,
                    message: "All market data refreshed successfully",
                });

            default:
                return NextResponse.json(
                    { error: "Invalid action" },
                    { status: 400 },
                );
        }
    } catch (error) {
        console.error("Market API POST error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to process market request",
                details: error instanceof Error
                    ? error.message
                    : "Unknown error",
            },
            { status: 500 },
        );
    }
}
