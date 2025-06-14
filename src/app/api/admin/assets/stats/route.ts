import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        // In a real implementation, you would fetch from your database
        // For now, returning mock data that simulates real-time stats

        const stats = {
            totalAssets: Math.floor(Math.random() * 50) + 150, // 150-200
            pendingApprovals: Math.floor(Math.random() * 20) + 5, // 5-25
            approvedAssets: Math.floor(Math.random() * 100) + 100, // 100-200
            rejectedAssets: Math.floor(Math.random() * 10) + 2, // 2-12
            totalValue: Math.floor(Math.random() * 10000000) + 40000000, // $40M-$50M
            averageValue: Math.floor(Math.random() * 500000) + 250000, // $250K-$750K
            lastUpdated: new Date().toISOString(),
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Error fetching asset stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch asset statistics" },
            { status: 500 },
        );
    }
}
