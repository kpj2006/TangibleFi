import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Mock network statistics - replace with actual blockchain API calls
        const networkStats = {
            ethereum: {
                gasPrice: Math.floor(Math.random() * 50) + 20,
                blockNumber: 18500000 + Math.floor(Math.random() * 1000),
                status: "operational",
            },
            polygon: {
                gasPrice: Math.floor(Math.random() * 100) + 30,
                blockNumber: 50000000 + Math.floor(Math.random() * 1000),
                status: "operational",
            },
            arbitrum: {
                gasPrice: Math.floor(Math.random() * 5) + 1,
                blockNumber: 150000000 + Math.floor(Math.random() * 1000),
                status: "operational",
            },
        };

        return NextResponse.json(networkStats);
    } catch (error) {
        console.error("Error fetching network stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch network statistics" },
            { status: 500 },
        );
    }
}
