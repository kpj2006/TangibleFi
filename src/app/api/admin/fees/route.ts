import { NextRequest, NextResponse } from 'next/server';

// Mock fee data - replace with actual database calls
const mockFees = [
  {
    id: "1",
    name: "Platform Fee",
    type: "percentage",
    value: 2.5,
    blockchain: "ethereum",
    isActive: true,
    lastUpdated: "2025-01-15T10:30:00Z",
    description: "Standard platform fee for asset tokenization",
  },
  {
    id: "2",
    name: "Transaction Fee",
    type: "fixed",
    value: 0.001,
    blockchain: "ethereum",
    isActive: true,
    lastUpdated: "2025-01-14T14:20:00Z",
    description: "Fixed fee per transaction",
  },
  {
    id: "3",
    name: "Polygon Platform Fee",
    type: "percentage",
    value: 1.5,
    blockchain: "polygon",
    isActive: true,
    lastUpdated: "2025-01-13T09:15:00Z",
    description: "Reduced platform fee for Polygon network",
  },
  {
    id: "4",
    name: "Premium Service Fee",
    type: "percentage",
    value: 5.0,
    minAmount: 1000,
    maxAmount: 50000,
    blockchain: "ethereum",
    isActive: false,
    lastUpdated: "2025-01-12T16:45:00Z",
    description: "Premium service fee with limits",
  },
  {
    id: "5",
    name: "Arbitrum Gas Fee",
    type: "fixed",
    value: 0.0005,
    blockchain: "arbitrum",
    isActive: true,
    lastUpdated: "2025-01-11T11:20:00Z",
    description: "Gas fee for Arbitrum transactions",
  },
];

export async function GET() {
  try {
    return NextResponse.json(mockFees);
  } catch (error) {
    console.error('Error fetching fees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fees' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newFee = {
      id: (mockFees.length + 1).toString(),
      ...body,
      lastUpdated: new Date().toISOString(),
    };

    mockFees.push(newFee);

    return NextResponse.json(newFee, { status: 201 });
  } catch (error) {
    console.error('Error creating fee:', error);
    return NextResponse.json(
      { error: 'Failed to create fee' },
      { status: 500 }
    );
  }
} 