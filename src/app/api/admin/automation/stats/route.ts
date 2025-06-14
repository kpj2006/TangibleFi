import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock automation statistics - replace with actual database queries
    const stats = {
      totalRules: 5,
      activeRules: 4,
      executionsToday: 28,
      successRate: 98.5,
      avgExecutionTime: 2.3,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching automation stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch automation statistics' },
      { status: 500 }
    );
  }
} 