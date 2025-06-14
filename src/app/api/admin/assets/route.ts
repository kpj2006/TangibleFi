import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, you would fetch from your database
    // For now, returning mock data that simulates real assets
    
    const assets = [
      {
        id: "1",
        name: "Luxury Apartment Downtown",
        asset_type: "Real Estate",
        original_value: 850000,
        user_id: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C8b",
        created_at: "2025-01-15T10:30:00Z",
        verification_status: "pending",
        location: "New York, NY",
        description: "Modern 2-bedroom apartment in downtown Manhattan",
        blockchain: "ethereum",
        documents: ["deed.pdf", "appraisal.pdf", "insurance.pdf"],
        riskScore: 2,
        collateralRatio: 75,
        submittedBy: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C8b",
        submittedDate: "Jan 15, 2025",
      },
      {
        id: "2",
        name: "Commercial Office Building",
        asset_type: "Commercial Real Estate",
        original_value: 2500000,
        user_id: "0x8ba1f109551bD432803012645Hac136c5c8b8b8b",
        created_at: "2025-01-14T14:20:00Z",
        verification_status: "under-review",
        location: "Los Angeles, CA",
        description: "5-story office building with retail ground floor",
        blockchain: "polygon",
        documents: ["title.pdf", "lease_agreements.pdf", "financial_statements.pdf"],
        riskScore: 3,
        collateralRatio: 70,
        submittedBy: "0x8ba1f109551bD432803012645Hac136c5c8b8b8b",
        submittedDate: "Jan 14, 2025",
      },
      {
        id: "3",
        name: "Vintage Wine Collection",
        asset_type: "Collectibles",
        original_value: 125000,
        user_id: "0xa39643CF2F0B78107Ed786c8156C6de492Eec3c",
        created_at: "2025-01-13T09:15:00Z",
        verification_status: "approved",
        location: "Napa Valley, CA",
        description: "Rare vintage wine collection from 1990-2010",
        blockchain: "arbitrum",
        token_id: 1001,
        contract_address: "0x1234567890123456789012345678901234567890",
        documents: ["authentication.pdf", "storage_certificate.pdf"],
        riskScore: 4,
        collateralRatio: 60,
        submittedBy: "0xa39643CF2F0B78107Ed786c8156C6de492Eec3c",
        submittedDate: "Jan 13, 2025",
      },
      {
        id: "4",
        name: "Art Collection - Modern Paintings",
        asset_type: "Art",
        original_value: 750000,
        user_id: "0x1234567890123456789012345678901234567890",
        created_at: "2025-01-12T16:45:00Z",
        verification_status: "pending",
        location: "Miami, FL",
        description: "Collection of 5 modern paintings by renowned artists",
        blockchain: "ethereum",
        documents: ["authenticity_certificates.pdf", "appraisal_report.pdf"],
        riskScore: 3,
        collateralRatio: 65,
        submittedBy: "0x1234567890123456789012345678901234567890",
        submittedDate: "Jan 12, 2025",
      },
      {
        id: "5",
        name: "Industrial Warehouse",
        asset_type: "Industrial Real Estate",
        original_value: 1800000,
        user_id: "0x9876543210987654321098765432109876543210",
        created_at: "2025-01-11T11:20:00Z",
        verification_status: "rejected",
        location: "Chicago, IL",
        description: "Large industrial warehouse with loading docks",
        blockchain: "polygon",
        documents: ["property_deed.pdf", "environmental_report.pdf"],
        riskScore: 5,
        collateralRatio: 50,
        submittedBy: "0x9876543210987654321098765432109876543210",
        submittedDate: "Jan 11, 2025",
      },
    ];

    return NextResponse.json(assets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
} 