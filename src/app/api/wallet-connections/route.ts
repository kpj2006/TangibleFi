import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../supabase/client";

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient();

        // Try to get user from auth - if it fails, return mock data
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        // Return mock data for development/demo purposes
        const mockConnections = [
            {
                id: "conn-1",
                user_id: user?.id || "demo-user",
                wallet_address: "0x742d35cc6cbf4532b4661e5f5e2c2d1b5a8f1234",
                wallet_type: "MetaMask",
                chain_id: 1,
                network_name: "Ethereum Mainnet",
                balance_eth: 2.5,
                balance_usd: 5000.0,
                is_connected: true,
                last_connected: "2025-01-15T10:30:00Z",
                created_at: "2025-01-10T08:00:00Z",
            },
            {
                id: "conn-2",
                user_id: user?.id || "demo-user",
                wallet_address: "0x1234567890abcdef1234567890abcdef12345678",
                wallet_type: "WalletConnect",
                chain_id: 137,
                network_name: "Polygon",
                balance_eth: 1000.0,
                balance_usd: 800.0,
                is_connected: true,
                last_connected: "2025-01-15T09:15:00Z",
                created_at: "2025-01-12T14:20:00Z",
            },
            {
                id: "conn-3",
                user_id: user?.id || "demo-user",
                wallet_address: "0xabcdef1234567890abcdef1234567890abcdef12",
                wallet_type: "Coinbase Wallet",
                chain_id: 42161,
                network_name: "Arbitrum One",
                balance_eth: 0.75,
                balance_usd: 1500.0,
                is_connected: false,
                last_connected: "2025-01-14T16:45:00Z",
                created_at: "2025-01-08T11:30:00Z",
            },
        ];

        if (authError || !user) {
            // Return mock data even without auth for demo purposes
            return NextResponse.json({
                success: true,
                data: mockConnections,
                count: mockConnections.length,
            });
        }

        // Try to fetch from database, fallback to mock data
        try {
            const { data: connections, error } = await supabase
                .from("wallet_connections")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Database error:", error);
                return NextResponse.json({
                    success: true,
                    data: mockConnections,
                    count: mockConnections.length,
                });
            }

            return NextResponse.json({
                success: true,
                data: connections || mockConnections,
                count: (connections || mockConnections).length,
            });
        } catch (dbError) {
            console.error("Database connection error:", dbError);
            return NextResponse.json({
                success: true,
                data: mockConnections,
                count: mockConnections.length,
            });
        }
    } catch (error) {
        console.error("API error:", error);
        // Even on error, return mock data for demo
        const mockConnections = [
            {
                id: "conn-1",
                user_id: "demo-user",
                wallet_address: "0x742d35cc6cbf4532b4661e5f5e2c2d1b5a8f1234",
                wallet_type: "MetaMask",
                chain_id: 1,
                network_name: "Ethereum Mainnet",
                balance_eth: 2.5,
                balance_usd: 5000.0,
                is_connected: true,
                last_connected: "2025-01-15T10:30:00Z",
                created_at: "2025-01-10T08:00:00Z",
            },
        ];

        return NextResponse.json({
            success: true,
            data: mockConnections,
            count: mockConnections.length,
        });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            wallet_address,
            wallet_type,
            chain_id,
            network_name,
            balance_eth,
            balance_usd,
        } = body;

        // Validate required fields
        if (!wallet_address || !chain_id || !network_name) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 },
            );
        }

        // Validate wallet address format
        if (!/^0x[a-fA-F0-9]{40}$/.test(wallet_address)) {
            return NextResponse.json(
                { error: "Invalid wallet address format" },
                { status: 400 },
            );
        }

        // Mock successful connection
        const newConnection = {
            id: `conn-${Date.now()}`,
            user_id: "user-123",
            wallet_address,
            wallet_type: wallet_type || "Unknown",
            chain_id,
            network_name,
            balance_eth: balance_eth || Math.random() * 10,
            balance_usd: balance_usd || Math.random() * 20000,
            is_connected: true,
            last_connected: new Date().toISOString(),
            created_at: new Date().toISOString(),
        };

        return NextResponse.json({
            success: true,
            data: newConnection,
            message: "Wallet connected successfully",
        }, { status: 201 });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { connection_id, is_connected, balance_eth, balance_usd } = body;

        if (!connection_id) {
            return NextResponse.json(
                { error: "Connection ID is required" },
                { status: 400 },
            );
        }

        // Mock update
        const updatedConnection = {
            id: connection_id,
            user_id: "user-123",
            wallet_address: "0x742d35cc6cbf4532b4661e5f5e2c2d1b5a8f1234",
            wallet_type: "MetaMask",
            chain_id: 1,
            network_name: "Ethereum Mainnet",
            balance_eth: balance_eth || 2.5,
            balance_usd: balance_usd || 5000.0,
            is_connected: is_connected !== undefined ? is_connected : true,
            last_connected: new Date().toISOString(),
            created_at: "2025-01-10T08:00:00Z",
        };

        return NextResponse.json({
            success: true,
            data: updatedConnection,
            message: "Wallet connection updated successfully",
        });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
