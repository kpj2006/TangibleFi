"use client";
// Add these imports at the top
import { createClient } from "../../../../supabase/client";
import { useWallet } from "../../../lib/web3/wallet-provider";
import { Loader2, Wallet, Link as LinkIcon, Check, AlertCircle } from "lucide-react"; // Add new icons
import { useState, useEffect } from "react";
import { useSettingsData } from "../../../hooks/use-settings-data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Badge } from "../../../components/ui/badge";
import { Switch } from "../../../components/ui/switch";
import {
  Settings,
  Bell,
  Shield,
  CreditCard,
  Database,
  Network,
  Smartphone,
  Globe,
  Palette,
  Monitor,
  Lock,
  Key,
  Webhook,
  Zap,
  AlertTriangle,
  CheckCircle,
  Save,
  RefreshCw,
  User,
  Mail,
  Phone,
  Calendar,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { Textarea } from "../../../components/ui/textarea";

export default function SettingsPage() {
  const settingsData = useSettingsData();
  const [activeTab, setActiveTab] = useState("profile");
  const [showAPIKey, setShowAPIKey] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const supabase = createClient();
  const { address: connectedAddress, isConnected, connect: connectWallet } = useWallet();

  const [savedAddress, setSavedAddress] = useState<string | null>(null);
  const [isSavingWallet, setIsSavingWallet] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [walletSuccess, setWalletSuccess] = useState<string | null>(null);

  // Fetch the saved wallet address when the component mounts or the user changes
  useEffect(() => {
    const fetchProfileWallet = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('wallet_address')
          .eq('id', user.id)
          .single();

        if (profile) {
          setSavedAddress(profile.wallet_address);
        }
      }
    };

    fetchProfileWallet();
  }, [supabase]);

  const handleSaveWalletAddress = async () => {
    setIsSavingWallet(true);
    setWalletError(null);
    setWalletSuccess(null);

    if (!connectedAddress) {
      setWalletError("Please connect your wallet first.");
      setIsSavingWallet(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({ wallet_address: connectedAddress })
        .eq('id', user.id);

      if (error) {
        setWalletError(`Failed to save address: ${error.message}`);
      } else {
        setSavedAddress(connectedAddress);
        setWalletSuccess("Wallet address saved successfully!");
      }
    }
    setIsSavingWallet(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await settingsData.refreshData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleSave = async (section?: string) => {
    if (section) {
      await settingsData.saveSettings({
        [section]: settingsData[section as keyof typeof settingsData],
      });
    } else {
      await settingsData.saveSettings({
        notifications: settingsData.notifications,
        appearance: settingsData.appearance,
        security: settingsData.security,
        trading: settingsData.trading,
        integrations: settingsData.integrations,
        api: settingsData.api,
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (settingsData.loading) {
    return (
      <div className="w-full px-6 py-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
          <div className="grid grid-cols-6 gap-4 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
          <p className="text-lg text-gray-600 mt-3">
            Manage your platform preferences and configurations
          </p>
          {settingsData.last_updated && (
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                Last updated: {settingsData.last_updated.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button onClick={() => handleSave()} disabled={settingsData.saving}>
            <Save className="w-4 h-4 mr-2" />
            {settingsData.saving ? "Saving..." : "Save All"}
          </Button>
        </div>
      </div>

      {/* Error State */}
      {settingsData.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Error loading settings</span>
            </div>
            <p className="text-red-600 text-sm mt-1">{settingsData.error}</p>
          </CardContent>
        </Card>
      )}

      {/* Settings Status */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <Settings className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-gray-900">
                  Settings Synchronized
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Real-time sync with secure cloud storage
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-green-600 font-medium">Secure</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                <span className="text-blue-600 font-medium">Synced</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="trading" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Trading
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {settingsData.profile && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={settingsData.profile.full_name}
                      onChange={(e) => {
                        // Profile updates would need a separate handler
                        console.log("Profile update:", e.target.value);
                      }}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={settingsData.profile.email}
                        disabled
                        className="bg-gray-50"
                      />
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-200"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      value={settingsData.profile.phone || ""}
                      onChange={(e) => {
                        // Profile updates would need a separate handler
                        console.log("Phone update:", e.target.value);
                      }}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Avatar URL</Label>
                    <Input
                      value={settingsData.profile.avatar_url || ""}
                      onChange={(e) => {
                        // Profile updates would need a separate handler
                        console.log("Avatar update:", e.target.value);
                      }}
                      placeholder="Enter avatar URL"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Account Information
                    </h3>
                    <p className="text-sm text-gray-500">
                      Your account details and status
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>
                {settingsData.profile && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">
                        Account Created
                      </span>
                      <span className="text-sm font-medium">
                        {formatDate(settingsData.profile.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">
                        Last Updated
                      </span>
                      <span className="text-sm font-medium">
                        {formatDate(settingsData.profile.updated_at)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Wallet Management
              </CardTitle>
              <CardDescription>
                This is the wallet address where your asset NFTs will be minted.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="saved-address">Saved Wallet Address</Label>
                <Input
                  id="saved-address"
                  value={savedAddress || 'No address has been saved yet.'}
                  disabled
                  className="font-mono bg-gray-50"
                />
                <p className="text-xs text-gray-500">This address is used for receiving your tokenized assets.</p>
              </div>

              <div className="p-4 border rounded-lg bg-secondary/50 space-y-3">
                <Label className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Currently Connected Wallet
                </Label>
                {isConnected && connectedAddress ? (
                  <p className="font-mono text-sm">{connectedAddress}</p>
                ) : (
                  <Button size="sm" variant="outline" onClick={connectWallet}>Connect Wallet</Button>
                )}
              </div>

              {walletError && <p className="text-sm text-red-500 flex items-center gap-2"><AlertCircle className="h-4 w-4" />{walletError}</p>}
              {walletSuccess && <p className="text-sm text-green-500 flex items-center gap-2"><Check className="h-4 w-4" />{walletSuccess}</p>}

              <div className="pt-4 border-t">
                <Button
                  onClick={handleSaveWalletAddress}
                  disabled={isSavingWallet || !connectedAddress || connectedAddress === savedAddress}
                >
                  {isSavingWallet ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {connectedAddress === savedAddress ? 'Address is Up to Date' : 'Save Connected Address'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {Object.entries(settingsData.notifications).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <Label className="text-sm font-medium capitalize">
                          {key.replace(/_/g, " ")}
                        </Label>
                        <p className="text-xs text-gray-500">
                          {key === "email_alerts" &&
                            "Receive important updates via email"}
                          {key === "push_notifications" &&
                            "Browser push notifications"}
                          {key === "sms_alerts" &&
                            "SMS notifications for critical events"}
                          {key === "weekly_reports" &&
                            "Weekly portfolio summary reports"}
                          {key === "price_alerts" &&
                            "Asset price change notifications"}
                          {key === "security_notifications" &&
                            "Security and login alerts"}
                        </p>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) =>
                          settingsData.updateSettings("notifications", {
                            [key]: checked,
                          })
                        }
                      />
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance & Localization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select
                    value={settingsData.appearance.theme}
                    onValueChange={(value) =>
                      settingsData.updateSettings("appearance", {
                        theme: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto (System)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={settingsData.appearance.language}
                    onValueChange={(value) =>
                      settingsData.updateSettings("appearance", {
                        language: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={settingsData.appearance.timezone}
                    onValueChange={(value) =>
                      settingsData.updateSettings("appearance", {
                        timezone: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">EST</SelectItem>
                      <SelectItem value="America/Los_Angeles">PST</SelectItem>
                      <SelectItem value="Europe/London">GMT</SelectItem>
                      <SelectItem value="Asia/Tokyo">JST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={settingsData.appearance.currency}
                    onValueChange={(value) =>
                      settingsData.updateSettings("appearance", {
                        currency: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select
                    value={settingsData.appearance.date_format}
                    onValueChange={(value) =>
                      settingsData.updateSettings("appearance", {
                        date_format: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Number Format</Label>
                  <Select
                    value={settingsData.appearance.number_format}
                    onValueChange={(value) =>
                      settingsData.updateSettings("appearance", {
                        number_format: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">US (1,234.56)</SelectItem>
                      <SelectItem value="EU">EU (1.234,56)</SelectItem>
                      <SelectItem value="IN">IN (1,23,456.78)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {Object.entries(settingsData.security).map(([key, value]) => {
                  if (key === "session_timeout") {
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <Label className="text-sm font-medium">
                            Session Timeout (minutes)
                          </Label>
                          <p className="text-xs text-gray-500">
                            Automatically log out after inactivity
                          </p>
                        </div>
                        <div className="w-32">
                          <Input
                            type="number"
                            value={value}
                            onChange={(e) =>
                              settingsData.updateSettings("security", {
                                [key]: parseInt(e.target.value),
                              })
                            }
                            min="5"
                            max="480"
                          />
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <Label className="text-sm font-medium capitalize">
                          {key.replace(/_/g, " ")}
                        </Label>
                        <p className="text-xs text-gray-500">
                          {key === "two_factor_auth" &&
                            "Enable 2FA for additional security"}
                          {key === "biometric_auth" &&
                            "Use fingerprint or face recognition"}
                          {key === "device_trust" && "Remember trusted devices"}
                          {key === "audit_log" && "Keep detailed activity logs"}
                        </p>
                      </div>
                      <Switch
                        checked={value as boolean}
                        onCheckedChange={(checked) =>
                          settingsData.updateSettings("security", {
                            [key]: checked,
                          })
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trading Tab */}
        <TabsContent value="trading" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Trading Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      Transaction Confirmations
                    </Label>
                    <p className="text-xs text-gray-500">
                      Require confirmation for all transactions
                    </p>
                  </div>
                  <Switch
                    checked={settingsData.trading.confirmations}
                    onCheckedChange={(checked) =>
                      settingsData.updateSettings("trading", {
                        confirmations: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      Slippage Tolerance (%)
                    </Label>
                    <p className="text-xs text-gray-500">
                      Maximum acceptable price slippage
                    </p>
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      value={settingsData.trading.slippage_tolerance}
                      onChange={(e) =>
                        settingsData.updateSettings("trading", {
                          slippage_tolerance: parseFloat(e.target.value),
                        })
                      }
                      min="0.1"
                      max="10"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      Gas Price Setting
                    </Label>
                    <p className="text-xs text-gray-500">
                      Default gas price for transactions
                    </p>
                  </div>
                  <div className="w-32">
                    <Select
                      value={settingsData.trading.gas_price}
                      onValueChange={(value) =>
                        settingsData.updateSettings("trading", {
                          gas_price: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slow">Slow</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="fast">Fast</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Auto Approval</Label>
                    <p className="text-xs text-gray-500">
                      Automatically approve small transactions
                    </p>
                  </div>
                  <Switch
                    checked={settingsData.trading.auto_approval}
                    onCheckedChange={(checked) =>
                      settingsData.updateSettings("trading", {
                        auto_approval: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      Max Transaction Value ($)
                    </Label>
                    <p className="text-xs text-gray-500">
                      Maximum single transaction amount
                    </p>
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      value={settingsData.trading.max_transaction_value}
                      onChange={(e) =>
                        settingsData.updateSettings("trading", {
                          max_transaction_value: parseInt(e.target.value),
                        })
                      }
                      min="100"
                      max="1000000"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5" />
                Wallet Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {Object.entries(settingsData.integrations).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          {key === "metamask" && (
                            <Globe className="h-4 w-4 text-orange-600" />
                          )}
                          {key === "coinbase" && (
                            <Database className="h-4 w-4 text-blue-600" />
                          )}
                          {key === "ledger" && (
                            <Shield className="h-4 w-4 text-green-600" />
                          )}
                          {key === "trezor" && (
                            <Lock className="h-4 w-4 text-red-600" />
                          )}
                          {key === "wallet_connect" && (
                            <Smartphone className="h-4 w-4 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-medium capitalize">
                            {key.replace(/_/g, " ")}
                          </Label>
                          <p className="text-xs text-gray-500">
                            {key === "metamask" &&
                              "Connect with MetaMask wallet"}
                            {key === "coinbase" &&
                              "Coinbase Wallet integration"}
                            {key === "ledger" && "Hardware wallet support"}
                            {key === "trezor" && "Trezor hardware wallet"}
                            {key === "wallet_connect" &&
                              "WalletConnect protocol"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {value && (
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-200"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        )}
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) =>
                            settingsData.updateSettings("integrations", {
                              [key]: checked,
                            })
                          }
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* API Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">API Access</Label>
                    <p className="text-xs text-gray-500">
                      Enable API access for third-party integrations
                    </p>
                  </div>
                  <Switch
                    checked={settingsData.api.enabled}
                    onCheckedChange={(checked) =>
                      settingsData.updateSettings("api", { enabled: checked })
                    }
                  />
                </div>

                {settingsData.api.enabled && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">
                          Rate Limit (requests/hour)
                        </Label>
                        <p className="text-xs text-gray-500">
                          Maximum API requests per hour
                        </p>
                      </div>
                      <div className="w-32">
                        <Input
                          type="number"
                          value={settingsData.api.rate_limit}
                          onChange={(e) =>
                            settingsData.updateSettings("api", {
                              rate_limit: parseInt(e.target.value),
                            })
                          }
                          min="10"
                          max="10000"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Webhook URL</Label>
                      <Input
                        value={settingsData.api.webhook_url}
                        onChange={(e) =>
                          settingsData.updateSettings("api", {
                            webhook_url: e.target.value,
                          })
                        }
                        placeholder="https://your-app.com/webhook"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        IP Whitelist
                      </Label>
                      <Textarea
                        value={settingsData.api.ip_whitelist}
                        onChange={(e) =>
                          settingsData.updateSettings("api", {
                            ip_whitelist: e.target.value,
                          })
                        }
                        placeholder="192.168.1.1, 10.0.0.1"
                        rows={3}
                      />
                      <p className="text-xs text-gray-500">
                        Comma-separated list of allowed IP addresses
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600">
                Settings are automatically saved when changed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Settings
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import Settings
              </Button>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Reset All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
