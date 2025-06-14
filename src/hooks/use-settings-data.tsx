"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "../../supabase/client";

export interface NotificationSettings {
  email_alerts: boolean;
  push_notifications: boolean;
  sms_alerts: boolean;
  weekly_reports: boolean;
  price_alerts: boolean;
  security_notifications: boolean;
}

export interface AppearanceSettings {
  theme: "light" | "dark" | "auto";
  language: string;
  timezone: string;
  currency: string;
  date_format: string;
  number_format: string;
}

export interface SecuritySettings {
  two_factor_auth: boolean;
  session_timeout: number;
  biometric_auth: boolean;
  device_trust: boolean;
  audit_log: boolean;
}

export interface TradingSettings {
  confirmations: boolean;
  slippage_tolerance: number;
  gas_price: "slow" | "standard" | "fast";
  auto_approval: boolean;
  max_transaction_value: number;
}

export interface IntegrationSettings {
  metamask: boolean;
  coinbase: boolean;
  ledger: boolean;
  trezor: boolean;
  wallet_connect: boolean;
}

export interface APISettings {
  enabled: boolean;
  rate_limit: number;
  webhook_url: string;
  ip_whitelist: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface SettingsData {
  profile: UserProfile | null;
  notifications: NotificationSettings;
  appearance: AppearanceSettings;
  security: SecuritySettings;
  trading: TradingSettings;
  integrations: IntegrationSettings;
  api: APISettings;
  loading: boolean;
  saving: boolean;
  error: string | null;
  last_updated: Date | null;
}

const defaultSettings = {
  notifications: {
    email_alerts: true,
    push_notifications: true,
    sms_alerts: false,
    weekly_reports: true,
    price_alerts: true,
    security_notifications: true,
  },
  appearance: {
    theme: "light" as const,
    language: "en",
    timezone: "UTC",
    currency: "USD",
    date_format: "MM/DD/YYYY",
    number_format: "US",
  },
  security: {
    two_factor_auth: false,
    session_timeout: 30,
    biometric_auth: false,
    device_trust: true,
    audit_log: true,
  },
  trading: {
    confirmations: true,
    slippage_tolerance: 0.5,
    gas_price: "standard" as const,
    auto_approval: false,
    max_transaction_value: 10000,
  },
  integrations: {
    metamask: true,
    coinbase: false,
    ledger: false,
    trezor: false,
    wallet_connect: true,
  },
  api: {
    enabled: false,
    rate_limit: 100,
    webhook_url: "",
    ip_whitelist: "",
  },
};

export function useSettingsData() {
  const [data, setData] = useState<SettingsData>({
    ...defaultSettings,
    profile: null,
    loading: true,
    saving: false,
    error: null,
    last_updated: null,
  });

  const supabase = createClient();

  const fetchUserProfile =
    useCallback(async (): Promise<UserProfile | null> => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return null;

        return {
          id: user.id,
          email: user.email || "",
          full_name: user.user_metadata?.full_name || "",
          avatar_url: user.user_metadata?.avatar_url || null,
          phone: user.phone || null,
          created_at: user.created_at,
          updated_at: user.updated_at,
        };
      } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }
    }, [supabase]);

  const saveSettings = useCallback(
    async (
      settingsToSave: Partial<
        Omit<
          SettingsData,
          "profile" | "loading" | "saving" | "error" | "last_updated"
        >
      >
    ) => {
      try {
        setData((prev) => ({ ...prev, saving: true, error: null }));

        // Simulate API call for now
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setData((prev) => ({
          ...prev,
          ...settingsToSave,
          saving: false,
          last_updated: new Date(),
        }));

        return { success: true };
      } catch (error: any) {
        setData((prev) => ({
          ...prev,
          saving: false,
          error: error.message || "Failed to save settings",
        }));
        return { success: false, error: error.message };
      }
    },
    []
  );

  const updateSettings = useCallback(
    (
      section: keyof Omit<
        SettingsData,
        "profile" | "loading" | "saving" | "error" | "last_updated"
      >,
      updates: any
    ) => {
      setData((prev) => ({
        ...prev,
        [section]: { ...prev[section], ...updates },
      }));
    },
    []
  );

  const fetchAllData = useCallback(async () => {
    try {
      setData((prev) => ({ ...prev, loading: true, error: null }));

      const profile = await fetchUserProfile();

      setData((prev) => ({
        ...prev,
        profile,
        loading: false,
        last_updated: new Date(),
      }));
    } catch (error: any) {
      setData((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to fetch settings",
      }));
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    ...data,
    updateSettings,
    saveSettings,
    refreshData: fetchAllData,
  };
}
