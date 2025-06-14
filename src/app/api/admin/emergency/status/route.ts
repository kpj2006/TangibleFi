import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Mock emergency status - replace with actual system status checks
        const status = {
            isEmergencyMode: false,
            isPaused: false,
            isWithdrawalLocked: false,
            lastEmergencyAction: "System resumed",
            emergencyReason: "",
            activatedBy: "",
            activatedAt: "",
            affectedContracts: [],
        };

        return NextResponse.json(status);
    } catch (error) {
        console.error("Error fetching emergency status:", error);
        return NextResponse.json(
            { error: "Failed to fetch emergency status" },
            { status: 500 },
        );
    }
}
