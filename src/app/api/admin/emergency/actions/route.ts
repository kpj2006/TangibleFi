import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Mock emergency action history - replace with actual database queries
        const actions = [
            {
                id: "1",
                type: "pause",
                description:
                    "Emergency pause activated due to suspicious activity",
                timestamp: "2025-01-15T14:30:00Z",
                executor: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C8b",
                reason: "Suspicious large transactions detected",
                affectedContracts: ["main", "nft"],
                status: "completed",
            },
            {
                id: "2",
                type: "unpause",
                description: "System resumed after security review",
                timestamp: "2025-01-15T16:45:00Z",
                executor: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C8b",
                reason: "Security review completed, no threats found",
                affectedContracts: ["main", "nft"],
                status: "completed",
            },
            {
                id: "3",
                type: "lock",
                description: "Withdrawal lock activated",
                timestamp: "2025-01-14T09:20:00Z",
                executor: "0x8ba1f109551bD432803012645Hac136c5c8b8b8b",
                reason: "Maintenance window for contract upgrade",
                affectedContracts: ["lending"],
                status: "completed",
            },
        ];

        return NextResponse.json(actions);
    } catch (error) {
        console.error("Error fetching emergency actions:", error);
        return NextResponse.json(
            { error: "Failed to fetch emergency actions" },
            { status: 500 },
        );
    }
}
