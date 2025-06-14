import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        // In a real implementation, you would fetch from your database
        // For now, returning mock data that simulates real-time stats

        const stats = {
            totalUsers: Math.floor(Math.random() * 200) + 1200, // 1200-1400
            activeUsers: Math.floor(Math.random() * 100) + 800, // 800-900
            newUsersToday: Math.floor(Math.random() * 20) + 5, // 5-25
            newUsersThisWeek: Math.floor(Math.random() * 100) + 50, // 50-150
            verifiedUsers: Math.floor(Math.random() * 150) + 1000, // 1000-1150
            kycPending: Math.floor(Math.random() * 50) + 20, // 20-70
            lastUpdated: new Date().toISOString(),
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Error fetching user stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch user statistics" },
            { status: 500 },
        );
    }
}
