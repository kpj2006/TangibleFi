import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Mock fee statistics - replace with actual database queries
        const stats = {
            totalCollected: 1250000,
            monthlyRevenue: 185000,
            averageFee: 125.50,
            transactionCount: 8947,
            topFeeType: "Platform Fee",
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Error fetching fee stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch fee statistics" },
            { status: 500 },
        );
    }
}
