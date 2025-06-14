"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "../../supabase/client";
import { User } from "@supabase/supabase-js";

export interface PortfolioAsset {
  id: string;
  name: string;
  asset_type: string;
  current_value: number;
  original_value: number;
  verification_status: string;
  collateralization_status: string;
  location: string;
  blockchain: string;
  created_at: string;
  updated_at: string;
}

export interface PortfolioLoan {
  id: string;
  loan_amount: number;
  outstanding_balance: number;
  interest_rate: number;
  monthly_payment: number;
  next_payment_date: string;
  loan_status: string;
  blockchain: string;
  created_at: string;
  assets: {
    id: string;
    name: string;
    asset_type: string;
  };
}

export interface CrossChainPosition {
  id: string;
  blockchain: string;
  asset_symbol: string;
  balance: number;
  usd_value: number;
  position_type: string;
  updated_at: string;
}

export interface PortfolioMetrics {
  totalAssetValue: number;
  totalLoanBalance: number;
  totalCryptoValue: number;
  netWorth: number;
  healthRatio: number;
  monthlyPayments: number;
  collateralUtilization: number;
  diversificationScore: number;
  performanceChange24h: number;
  performanceChange7d: number;
  performanceChange30d: number;
}

export interface PortfolioPerformance {
  period: string;
  value: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

export interface PortfolioData {
  assets: PortfolioAsset[];
  loans: PortfolioLoan[];
  positions: CrossChainPosition[];
  metrics: PortfolioMetrics;
  performance: PortfolioPerformance[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function usePortfolioData(user: User | null) {
  const [data, setData] = useState<PortfolioData>({
    assets: [],
    loans: [],
    positions: [],
    metrics: {
      totalAssetValue: 0,
      totalLoanBalance: 0,
      totalCryptoValue: 0,
      netWorth: 0,
      healthRatio: 0,
      monthlyPayments: 0,
      collateralUtilization: 0,
      diversificationScore: 0,
      performanceChange24h: 0,
      performanceChange7d: 0,
      performanceChange30d: 0,
    },
    performance: [],
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const supabase = createClient();

  const calculateMetrics = useCallback(
    (
      assets: PortfolioAsset[],
      loans: PortfolioLoan[],
      positions: CrossChainPosition[]
    ): PortfolioMetrics => {
      const totalAssetValue = assets.reduce(
        (sum, asset) => sum + asset.current_value,
        0
      );
      const totalLoanBalance = loans.reduce(
        (sum, loan) => sum + loan.outstanding_balance,
        0
      );
      const totalCryptoValue = positions.reduce(
        (sum, pos) => sum + pos.usd_value,
        0
      );
      const netWorth = totalAssetValue + totalCryptoValue - totalLoanBalance;
      const healthRatio =
        totalLoanBalance > 0 ? totalAssetValue / totalLoanBalance : 5.0;
      const monthlyPayments = loans
        .filter((loan) => loan.loan_status === "active")
        .reduce((sum, loan) => sum + loan.monthly_payment, 0);

      const collateralUtilization =
        totalAssetValue > 0 ? (totalLoanBalance / totalAssetValue) * 100 : 0;

      // Calculate diversification score based on asset types and blockchains
      const assetTypes = new Set(assets.map((a) => a.asset_type));
      const blockchains = new Set([
        ...assets.map((a) => a.blockchain),
        ...positions.map((p) => p.blockchain),
      ]);
      const diversificationScore = Math.min(
        100,
        assetTypes.size * 20 + blockchains.size * 15
      );

      // Mock performance changes (in real app, these would come from historical data)
      const performanceChange24h = (Math.random() - 0.5) * 10; // -5% to +5%
      const performanceChange7d = (Math.random() - 0.5) * 20; // -10% to +10%
      const performanceChange30d = (Math.random() - 0.5) * 40; // -20% to +20%

      return {
        totalAssetValue,
        totalLoanBalance,
        totalCryptoValue,
        netWorth,
        healthRatio,
        monthlyPayments,
        collateralUtilization,
        diversificationScore,
        performanceChange24h,
        performanceChange7d,
        performanceChange30d,
      };
    },
    []
  );

  const generatePerformanceData = useCallback(
    (netWorth: number): PortfolioPerformance[] => {
      const now = new Date();
      const performance: PortfolioPerformance[] = [];

      // Generate 30 days of performance data
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Simulate realistic portfolio performance
        const baseValue = netWorth;
        const volatility = 0.02; // 2% daily volatility
        const trend = 0.001; // Slight upward trend
        const randomChange = (Math.random() - 0.5) * volatility;
        const dayValue = baseValue * (1 + trend * (30 - i) + randomChange);

        const previousValue =
          i === 29
            ? baseValue * 0.95
            : performance[performance.length - 1]?.value || baseValue;
        const change = dayValue - previousValue;
        const changePercent =
          previousValue > 0 ? (change / previousValue) * 100 : 0;

        performance.push({
          period: date.toISOString().split("T")[0],
          value: dayValue,
          change,
          changePercent,
          timestamp: date.toISOString(),
        });
      }

      return performance;
    },
    []
  );

  const fetchPortfolioData = useCallback(async () => {
    if (!user) {
      setData((prev) => ({
        ...prev,
        loading: false,
        error: "User not authenticated",
      }));
      return;
    }

    try {
      setData((prev) => ({ ...prev, loading: true, error: null }));

      // Fetch all data in parallel for better performance
      const [assetsResponse, loansResponse, positionsResponse] =
        await Promise.all([
          supabase
            .from("assets")
            .select(
              `
            id,
            name,
            asset_type,
            current_value,
            original_value,
            verification_status,
            collateralization_status,
            location,
            blockchain,
            created_at,
            updated_at
          `
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(100),

          supabase
            .from("loans")
            .select(
              `
            id,
            loan_amount,
            outstanding_balance,
            interest_rate,
            monthly_payment,
            next_payment_date,
            loan_status,
            blockchain,
            created_at,
            assets!loans_asset_id_fkey (
              id,
              name,
              asset_type
            )
          `
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(50),

          supabase
            .from("cross_chain_positions")
            .select(
              `
            id,
            blockchain,
            asset_symbol,
            balance,
            usd_value,
            position_type,
            updated_at
          `
            )
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false })
            .limit(50),
        ]);

      if (assetsResponse.error) throw assetsResponse.error;
      if (loansResponse.error) throw loansResponse.error;
      if (positionsResponse.error) throw positionsResponse.error;

      const assets = assetsResponse.data || [];
      const loans = loansResponse.data || [];
      const positions = positionsResponse.data || [];

      const metrics = calculateMetrics(assets, loans, positions);
      const performance = generatePerformanceData(metrics.netWorth);

      setData({
        assets,
        loans,
        positions,
        metrics,
        performance,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (error: any) {
      console.error("Error fetching portfolio data:", error);
      setData((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to fetch portfolio data",
      }));
    }
  }, [user, supabase, calculateMetrics, generatePerformanceData]);

  const refreshData = useCallback(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  // Initial data fetch
  useEffect(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const channels = [
      supabase.channel("assets_changes").on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "assets",
          filter: `user_id=eq.${user.id}`,
        },
        () => refreshData()
      ),
      supabase.channel("loans_changes").on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "loans",
          filter: `user_id=eq.${user.id}`,
        },
        () => refreshData()
      ),
      supabase.channel("positions_changes").on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cross_chain_positions",
          filter: `user_id=eq.${user.id}`,
        },
        () => refreshData()
      ),
    ];

    channels.forEach((channel) => channel.subscribe());

    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel));
    };
  }, [user, supabase, refreshData]);

  // Auto-refresh every 30 seconds for live data
  useEffect(() => {
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  return {
    ...data,
    refreshData,
  };
}
