"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "../../supabase/client";

export interface CryptoMarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  circulating_supply: number;
  max_supply: number;
  image: string;
  last_updated: string;
}

export interface RWAAssetData {
  id: string;
  name: string;
  asset_type: string;
  current_value: number;
  original_value: number;
  price_change_24h: number;
  volume_24h: number;
  verification_status: string;
  blockchain: string;
  location: string;
  created_at: string;
  updated_at: string;
}

export interface MarketCategory {
  name: string;
  total_value: number;
  asset_count: number;
  change_24h: number;
  volume_24h: number;
  icon: string;
}

export interface MarketOverview {
  total_market_cap: number;
  total_volume_24h: number;
  total_assets: number;
  market_change_24h: number;
  active_traders: number;
  total_transactions: number;
}

export interface MarketData {
  overview: MarketOverview;
  crypto_markets: CryptoMarketData[];
  rwa_assets: RWAAssetData[];
  categories: MarketCategory[];
  loading: boolean;
  error: string | null;
  last_updated: Date | null;
}

export function useMarketData() {
  const [data, setData] = useState<MarketData>({
    overview: {
      total_market_cap: 0,
      total_volume_24h: 0,
      total_assets: 0,
      market_change_24h: 0,
      active_traders: 0,
      total_transactions: 0,
    },
    crypto_markets: [],
    rwa_assets: [],
    categories: [],
    loading: true,
    error: null,
    last_updated: null,
  });

  const supabase = createClient();

  // Fetch cryptocurrency market data from CoinGecko API
  const fetchCryptoData = useCallback(async (): Promise<CryptoMarketData[]> => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch crypto data");
      }

      const cryptoData = await response.json();
      return cryptoData.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        current_price: coin.current_price,
        price_change_percentage_24h: coin.price_change_percentage_24h || 0,
        market_cap: coin.market_cap || 0,
        total_volume: coin.total_volume || 0,
        circulating_supply: coin.circulating_supply || 0,
        max_supply: coin.max_supply || 0,
        image: coin.image,
        last_updated: coin.last_updated,
      }));
    } catch (error) {
      console.error("Error fetching crypto data:", error);
      return [];
    }
  }, []);

  // Fetch RWA assets from database
  const fetchRWAAssets = useCallback(async (): Promise<RWAAssetData[]> => {
    try {
      const { data: assets, error } = await supabase
        .from("assets")
        .select(
          `
          id,
          name,
          asset_type,
          current_value,
          original_value,
          verification_status,
          blockchain,
          location,
          created_at,
          updated_at
        `
        )
        .eq("verification_status", "verified")
        .order("current_value", { ascending: false })
        .limit(50);

      if (error) throw error;

      return (assets || []).map((asset) => ({
        ...asset,
        price_change_24h: (Math.random() - 0.5) * 10, // Simulated for demo
        volume_24h: asset.current_value * (0.01 + Math.random() * 0.05), // 1-6% of value
      }));
    } catch (error) {
      console.error("Error fetching RWA assets:", error);
      return [];
    }
  }, [supabase]);

  // Calculate market categories
  const calculateCategories = useCallback(
    (assets: RWAAssetData[]): MarketCategory[] => {
      const categoryMap = new Map<
        string,
        {
          total_value: number;
          asset_count: number;
          volume_24h: number;
          price_changes: number[];
        }
      >();

      assets.forEach((asset) => {
        const category = asset.asset_type || "Other";
        const existing = categoryMap.get(category) || {
          total_value: 0,
          asset_count: 0,
          volume_24h: 0,
          price_changes: [],
        };

        existing.total_value += asset.current_value;
        existing.asset_count += 1;
        existing.volume_24h += asset.volume_24h;
        existing.price_changes.push(asset.price_change_24h);

        categoryMap.set(category, existing);
      });

      return Array.from(categoryMap.entries())
        .map(([name, data]) => ({
          name,
          total_value: data.total_value,
          asset_count: data.asset_count,
          volume_24h: data.volume_24h,
          change_24h:
            data.price_changes.reduce((sum, change) => sum + change, 0) /
            data.price_changes.length,
          icon: getIconForCategory(name),
        }))
        .sort((a, b) => b.total_value - a.total_value);
    },
    []
  );

  // Get icon for category
  const getIconForCategory = (category: string): string => {
    const iconMap: Record<string, string> = {
      "Real Estate": "🏠",
      Vehicle: "🚗",
      Art: "🎨",
      Jewelry: "💎",
      Collectible: "🏆",
      Equipment: "⚙️",
      Commodity: "🥇",
      Other: "📦",
    };
    return iconMap[category] || "📦";
  };

  // Calculate market overview
  const calculateOverview = useCallback(
    (
      cryptoData: CryptoMarketData[],
      rwaAssets: RWAAssetData[]
    ): MarketOverview => {
      const cryptoMarketCap = cryptoData.reduce(
        (sum, coin) => sum + (coin.market_cap || 0),
        0
      );
      const rwaMarketCap = rwaAssets.reduce(
        (sum, asset) => sum + asset.current_value,
        0
      );

      const cryptoVolume = cryptoData.reduce(
        (sum, coin) => sum + (coin.total_volume || 0),
        0
      );
      const rwaVolume = rwaAssets.reduce(
        (sum, asset) => sum + asset.volume_24h,
        0
      );

      const cryptoChanges = cryptoData.map(
        (coin) => coin.price_change_percentage_24h || 0
      );
      const rwaChanges = rwaAssets.map((asset) => asset.price_change_24h);
      const allChanges = [...cryptoChanges, ...rwaChanges];
      const avgChange =
        allChanges.length > 0
          ? allChanges.reduce((sum, change) => sum + change, 0) /
            allChanges.length
          : 0;

      return {
        total_market_cap: cryptoMarketCap + rwaMarketCap,
        total_volume_24h: cryptoVolume + rwaVolume,
        total_assets: cryptoData.length + rwaAssets.length,
        market_change_24h: avgChange,
        active_traders: Math.floor(1000 + Math.random() * 5000), // Simulated
        total_transactions: Math.floor(10000 + Math.random() * 50000), // Simulated
      };
    },
    []
  );

  // Main data fetching function
  const fetchMarketData = useCallback(async () => {
    try {
      setData((prev) => ({ ...prev, loading: true, error: null }));

      // Fetch all data in parallel
      const [cryptoData, rwaAssets] = await Promise.all([
        fetchCryptoData(),
        fetchRWAAssets(),
      ]);

      const categories = calculateCategories(rwaAssets);
      const overview = calculateOverview(cryptoData, rwaAssets);

      setData({
        overview,
        crypto_markets: cryptoData,
        rwa_assets: rwaAssets,
        categories,
        loading: false,
        error: null,
        last_updated: new Date(),
      });
    } catch (error: any) {
      console.error("Error fetching market data:", error);
      setData((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to fetch market data",
      }));
    }
  }, [fetchCryptoData, fetchRWAAssets, calculateCategories, calculateOverview]);

  const refreshData = useCallback(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  // Initial data fetch
  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  // Auto-refresh every 60 seconds for market data
  useEffect(() => {
    const interval = setInterval(refreshData, 60000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // Set up real-time subscriptions for RWA assets
  useEffect(() => {
    const channel = supabase
      .channel("market_assets_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "assets" },
        () => refreshData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, refreshData]);

  return {
    ...data,
    refreshData,
  };
}
