import { NextRequest, NextResponse } from "next/server";

// Mock system settings - replace with actual database calls
const mockSettings = {
    platform: {
        name: "TangibleFi",
        description: "Real World Asset Tokenization Platform",
        version: "1.2.0",
        maintenanceMode: false,
        maxAssetValue: 10000000,
        minAssetValue: 1000,
        defaultFeeRate: 2.5,
    },
    security: {
        requireKYC: true,
        enableTwoFA: true,
        sessionTimeout: 3600,
        maxLoginAttempts: 5,
        passwordMinLength: 8,
        enableIPWhitelist: false,
    },
    notifications: {
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: true,
        adminAlerts: true,
        userNotifications: true,
        marketingEmails: false,
    },
    blockchain: {
        defaultNetwork: "ethereum",
        gasLimitMultiplier: 1.2,
        confirmationBlocks: 12,
        enableMultichain: true,
        supportedNetworks: ["ethereum", "polygon", "arbitrum"],
    },
    api: {
        rateLimit: 100,
        enableCORS: true,
        apiVersion: "v1",
        enableWebhooks: true,
        webhookSecret: "webhook_secret_key_123",
    },
};

export async function GET() {
    try {
        return NextResponse.json(mockSettings);
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json(
            { error: "Failed to fetch settings" },
            { status: 500 },
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        // In a real implementation, update settings in database
        console.log("Updating system settings:", body);

        // Merge with existing settings
        Object.assign(mockSettings, body);

        return NextResponse.json({
            success: true,
            message: "Settings updated successfully",
            settings: mockSettings,
        });
    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json(
            { error: "Failed to update settings" },
            { status: 500 },
        );
    }
}
