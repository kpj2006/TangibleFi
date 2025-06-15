import { NextRequest, NextResponse } from "next/server";
import { blockchainDataService } from "@/lib/web3/blockchain-data-service";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const walletAddress = searchParams.get("address");
        const limit = parseInt(searchParams.get("limit") || "50");
        const type = searchParams.get("type"); // 'send', 'receive', 'all'
        const network = searchParams.get("network"); // specific network filter
        const offset = parseInt(searchParams.get("offset") || "0");

        // Validate wallet address
        if (!walletAddress) {
            return NextResponse.json(
                { error: "Wallet address is required" },
                { status: 400 },
            );
        }

        // Validate limit
        if (limit > 1000) {
            return NextResponse.json(
                { error: "Limit cannot exceed 1000 transactions" },
                { status: 400 },
            );
        }

        // Get transaction history
        const transactions = await blockchainDataService.getTransactionHistory(
            limit,
        );

        // Apply filters
        let filteredTransactions = transactions;

        if (type && type !== "all") {
            filteredTransactions = filteredTransactions.filter((tx) =>
                tx.type === type
            );
        }

        if (network) {
            filteredTransactions = filteredTransactions.filter((tx) =>
                tx.network.toLowerCase().includes(network.toLowerCase())
            );
        }

        // Apply pagination
        const paginatedTransactions = filteredTransactions.slice(
            offset,
            offset + limit,
        );

        // Calculate total count and pages
        const totalCount = filteredTransactions.length;
        const totalPages = Math.ceil(totalCount / limit);
        const currentPage = Math.floor(offset / limit) + 1;

        return NextResponse.json({
            success: true,
            data: {
                transactions: paginatedTransactions,
                pagination: {
                    currentPage,
                    totalPages,
                    totalCount,
                    limit,
                    offset,
                    hasNext: currentPage < totalPages,
                    hasPrevious: currentPage > 1,
                },
                filters: {
                    type,
                    network,
                    walletAddress,
                },
            },
            timestamp: Date.now(),
        });
    } catch (error) {
        console.error("Transactions API error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch transaction history",
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
        const { action, walletAddress, transactionHash, networkId } = body;

        switch (action) {
            case "refresh":
                // Force refresh transaction history
                await blockchainDataService.refreshAll();
                const refreshedTransactions = await blockchainDataService
                    .getTransactionHistory(50);

                return NextResponse.json({
                    success: true,
                    data: refreshedTransactions,
                    message: "Transaction history refreshed successfully",
                });

            case "get_by_hash":
                if (!transactionHash) {
                    return NextResponse.json(
                        { error: "Transaction hash is required" },
                        { status: 400 },
                    );
                }

                // Get specific transaction details
                const allTransactions = await blockchainDataService
                    .getTransactionHistory(1000);
                const specificTransaction = allTransactions.find((tx) =>
                    tx.hash === transactionHash
                );

                if (!specificTransaction) {
                    return NextResponse.json(
                        { error: "Transaction not found" },
                        { status: 404 },
                    );
                }

                return NextResponse.json({
                    success: true,
                    data: specificTransaction,
                });

            case "get_by_network":
                if (!networkId) {
                    return NextResponse.json(
                        { error: "Network ID is required" },
                        { status: 400 },
                    );
                }

                const networkTransactions = await blockchainDataService
                    .getTransactionHistory(1000);
                const filteredByNetwork = networkTransactions.filter((tx) =>
                    tx.chainId === networkId
                );

                return NextResponse.json({
                    success: true,
                    data: filteredByNetwork,
                    message: `Transactions for network ${networkId}`,
                });

            case "export":
                // Export transaction history (implement CSV/JSON export)
                const exportTransactions = await blockchainDataService
                    .getTransactionHistory(1000);

                return NextResponse.json({
                    success: true,
                    data: {
                        format: "json",
                        transactions: exportTransactions,
                        exportedAt: new Date().toISOString(),
                        walletAddress,
                    },
                    message: "Transaction history exported successfully",
                });

            case "get_stats":
                // Get transaction statistics
                const statsTransactions = await blockchainDataService
                    .getTransactionHistory(1000);

                const stats = {
                    totalTransactions: statsTransactions.length,
                    totalSent: statsTransactions.filter((tx) =>
                        tx.type === "send"
                    ).length,
                    totalReceived: statsTransactions.filter((tx) =>
                        tx.type === "receive"
                    ).length,
                    totalNetworks: new Set(statsTransactions.map((tx) =>
                        tx.network
                    )).size,
                    totalVolume: statsTransactions.reduce((sum, tx) => {
                        const amount = parseFloat(tx.amount);
                        return sum + (isNaN(amount) ? 0 : amount);
                    }, 0),
                    networkBreakdown: statsTransactions.reduce((acc, tx) => {
                        acc[tx.network] = (acc[tx.network] || 0) + 1;
                        return acc;
                    }, {} as Record<string, number>),
                    typeBreakdown: statsTransactions.reduce((acc, tx) => {
                        acc[tx.type] = (acc[tx.type] || 0) + 1;
                        return acc;
                    }, {} as Record<string, number>),
                };

                return NextResponse.json({
                    success: true,
                    data: stats,
                    message: "Transaction statistics calculated successfully",
                });

            default:
                return NextResponse.json(
                    { error: "Invalid action" },
                    { status: 400 },
                );
        }
    } catch (error) {
        console.error("Transactions API POST error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to process transaction request",
                details: error instanceof Error
                    ? error.message
                    : "Unknown error",
            },
            { status: 500 },
        );
    }
}
