import { NextRequest, NextResponse } from "next/server";

// Mock contract data - replace with actual database/blockchain calls
const mockContracts = [
    {
        id: "1",
        name: "TangibleFi Diamond",
        address: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C8b",
        blockchain: "ethereum",
        status: "active",
        version: "1.2.0",
        deployedAt: "2025-01-10T10:30:00Z",
        gasUsed: 2500000,
        transactions: 1247,
        tvl: 45600000,
        lastActivity: "2025-01-15T14:20:00Z",
    },
    {
        id: "2",
        name: "Asset NFT Factory",
        address: "0x8ba1f109551bD432803012645Hac136c5c8b8b8b",
        blockchain: "polygon",
        status: "active",
        version: "1.1.5",
        deployedAt: "2025-01-12T09:15:00Z",
        gasUsed: 850000,
        transactions: 456,
        tvl: 12300000,
        lastActivity: "2025-01-15T13:45:00Z",
    },
    {
        id: "3",
        name: "Lending Pool",
        address: "0xa39643CF2F0B78107Ed786c8156C6de492Eec3c",
        blockchain: "arbitrum",
        status: "paused",
        version: "1.0.8",
        deployedAt: "2025-01-08T16:45:00Z",
        gasUsed: 1200000,
        transactions: 789,
        tvl: 8900000,
        lastActivity: "2025-01-14T09:30:00Z",
    },
];

export async function GET() {
    try {
        // In a real implementation, fetch from database/blockchain
        return NextResponse.json(mockContracts);
    } catch (error) {
        console.error("Error fetching contracts:", error);
        return NextResponse.json(
            { error: "Failed to fetch contracts" },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { address, network } = body;

        // In a real implementation, deploy contract to blockchain
        const newContract = {
            id: (mockContracts.length + 1).toString(),
            name: `New Contract ${mockContracts.length + 1}`,
            address,
            blockchain: network,
            status: "active",
            version: "1.0.0",
            deployedAt: new Date().toISOString(),
            gasUsed: 0,
            transactions: 0,
            tvl: 0,
            lastActivity: new Date().toISOString(),
        };

        mockContracts.push(newContract);

        return NextResponse.json(newContract, { status: 201 });
    } catch (error) {
        console.error("Error deploying contract:", error);
        return NextResponse.json(
            { error: "Failed to deploy contract" },
            { status: 500 },
        );
    }
}
