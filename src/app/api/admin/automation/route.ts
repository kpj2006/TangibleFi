import { NextRequest, NextResponse } from "next/server";

// Mock automation rules - replace with actual database calls
const mockAutomationRules = [
    {
        id: "1",
        name: "Auto Asset Approval",
        description: "Automatically approve assets that meet specific criteria",
        type: "event_based",
        status: "active",
        trigger: {
            type: "asset_submitted",
            condition: "value_less_than",
            value: 100000,
        },
        action: {
            type: "approve_asset",
            parameters: { auto_approve: true, notify_admin: true },
        },
        lastExecuted: "2025-01-15T14:30:00Z",
        executionCount: 45,
        successRate: 97.8,
        createdAt: "2025-01-10T10:00:00Z",
        createdBy: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C8b",
    },
    {
        id: "2",
        name: "Daily Fee Collection",
        description: "Collect platform fees daily at midnight",
        type: "scheduled",
        status: "active",
        trigger: {
            type: "schedule",
            condition: "daily",
            schedule: "0 0 * * *",
        },
        action: {
            type: "collect_fees",
            parameters: { notify_treasury: true },
        },
        lastExecuted: "2025-01-15T00:00:00Z",
        executionCount: 15,
        successRate: 100,
        createdAt: "2025-01-01T00:00:00Z",
        createdBy: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C8b",
    },
    {
        id: "3",
        name: "High Value Alert",
        description: "Alert admins when asset value exceeds threshold",
        type: "threshold",
        status: "active",
        trigger: {
            type: "asset_value",
            condition: "greater_than",
            value: 1000000,
        },
        action: {
            type: "send_alert",
            parameters: { alert_type: "high_value", notify_all_admins: true },
        },
        lastExecuted: "2025-01-14T16:45:00Z",
        executionCount: 8,
        successRate: 100,
        createdAt: "2025-01-05T12:00:00Z",
        createdBy: "0x8ba1f109551bD432803012645Hac136c5c8b8b8b",
    },
];

export async function GET() {
    try {
        return NextResponse.json(mockAutomationRules);
    } catch (error) {
        console.error("Error fetching automation rules:", error);
        return NextResponse.json(
            { error: "Failed to fetch automation rules" },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const newRule = {
            id: (mockAutomationRules.length + 1).toString(),
            ...body,
            status: "active",
            lastExecuted: null,
            executionCount: 0,
            successRate: 100,
            createdAt: new Date().toISOString(),
            createdBy: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C8b", // Mock admin address
        };

        mockAutomationRules.push(newRule);

        return NextResponse.json(newRule, { status: 201 });
    } catch (error) {
        console.error("Error creating automation rule:", error);
        return NextResponse.json(
            { error: "Failed to create automation rule" },
            { status: 500 },
        );
    }
}
