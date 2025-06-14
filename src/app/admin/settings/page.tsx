"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Database,
  Shield,
  Bell,
  Globe,
  Key,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Server,
  Mail,
  Smartphone,
} from "lucide-react";

interface SystemSettings {
  platform: {
    name: string;
    description: string;
    version: string;
    maintenanceMode: boolean;
    maxAssetValue: number;
    minAssetValue: number;
    defaultFeeRate: number;
  };
  security: {
    requireKYC: boolean;
    enableTwoFA: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    enableIPWhitelist: boolean;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    adminAlerts: boolean;
    userNotifications: boolean;
    marketingEmails: boolean;
  };
  blockchain: {
    defaultNetwork: string;
    gasLimitMultiplier: number;
    confirmationBlocks: number;
    enableMultichain: boolean;
    supportedNetworks: string[];
  };
  api: {
    rateLimit: number;
    enableCORS: boolean;
    apiVersion: string;
    enableWebhooks: boolean;
    webhookSecret: string;
  };
}

export default function SystemSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("platform");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        // Mock data for development
        setSettings({
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
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setHasChanges(false);
        alert("Settings saved successfully");
      } else {
        alert("Error saving settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  const updateSettings = (
    section: keyof SystemSettings,
    key: string,
    value: any
  ) => {
    if (!settings) return;

    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value,
      },
    });
    setHasChanges(true);
  };

  const tabs = [
    { id: "platform", label: "Platform", icon: Settings },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "blockchain", label: "Blockchain", icon: Database },
    { id: "api", label: "API", icon: Server },
  ];

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <div className="space-y-8 p-6">
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-white/60 rounded-lg shadow-sm"></div>
            <div className="h-64 bg-white/60 rounded-lg shadow-sm"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!settings) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Failed to load system settings</p>
            <Button onClick={fetchSettings} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 animate-fadeIn">
      <div className="space-y-8 p-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600 mt-1">
              Configure platform settings and system parameters
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                Unsaved Changes
              </Badge>
            )}
            <Button
              onClick={handleSaveSettings}
              disabled={!hasChanges}
              className="bg-emerald-600 hover:bg-emerald-700 shadow-sm hover:shadow-md transition-all"
            >
              <Save className="w-4 h-4 mr-2" />
              Save All Changes
            </Button>
          </div>
        </div>

        {/* Settings Tabs */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-100">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Platform Settings */}
            {activeTab === "platform" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Platform Configuration
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="platformName">Platform Name</Label>
                      <Input
                        id="platformName"
                        value={settings.platform.name}
                        onChange={(e) => updateSettings("platform", "name", e.target.value)}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="platformVersion">Version</Label>
                      <Input
                        id="platformVersion"
                        value={settings.platform.version}
                        onChange={(e) => updateSettings("platform", "version", e.target.value)}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="platformDescription">Description</Label>
                    <Textarea
                      id="platformDescription"
                      value={settings.platform.description}
                      onChange={(e) => updateSettings("platform", "description", e.target.value)}
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6 mt-4">
                    <div>
                      <Label htmlFor="maxAssets">Max Assets per User</Label>
                      <Input
                        id="maxAssets"
                        type="number"
                        value={settings.platform.maxAssetsPerUser}
                        onChange={(e) => updateSettings("platform", "maxAssetsPerUser", parseInt(e.target.value))}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="defaultFee">Default Fee (%)</Label>
                      <Input
                        id="defaultFee"
                        type="number"
                        step="0.1"
                        value={settings.platform.defaultFeePercentage}
                        onChange={(e) => updateSettings("platform", "defaultFeePercentage", parseFloat(e.target.value))}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Security Configuration
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-white to-gray-50/50">
                      <div>
                        <h4 className="font-medium text-gray-900">KYC Required</h4>
                        <p className="text-sm text-gray-600">Require KYC verification for all users</p>
                      </div>
                      <Switch
                        checked={settings.security.kycRequired}
                        onCheckedChange={(checked) => updateSettings("security", "kycRequired", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-white to-gray-50/50">
                      <div>
                        <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600">Require 2FA for admin accounts</p>
                      </div>
                      <Switch
                        checked={settings.security.twoFactorRequired}
                        onCheckedChange={(checked) => updateSettings("security", "twoFactorRequired", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-white to-gray-50/50">
                      <div>
                        <h4 className="font-medium text-gray-900">IP Whitelisting</h4>
                        <p className="text-sm text-gray-600">Restrict admin access to specific IPs</p>
                      </div>
                      <Switch
                        checked={settings.security.ipWhitelistEnabled}
                        onCheckedChange={(checked) => updateSettings("security", "ipWhitelistEnabled", checked)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6 mt-6">
                    <div>
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSettings("security", "sessionTimeout", parseInt(e.target.value))}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                      <Input
                        id="maxLoginAttempts"
                        type="number"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) => updateSettings("security", "maxLoginAttempts", parseInt(e.target.value))}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="passwordPolicy">Password Policy</Label>
                    <Select 
                      value={settings.security.passwordPolicy} 
                      onValueChange={(value) => updateSettings("security", "passwordPolicy", value)}
                    >
                      <SelectTrigger className="border-gray-200 focus:border-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                        <SelectItem value="medium">Medium (8+ chars, numbers, symbols)</SelectItem>
                        <SelectItem value="strong">Strong (12+ chars, mixed case, numbers, symbols)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Notification Preferences
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-white to-gray-50/50">
                      <div>
                        <h4 className="font-medium text-gray-900">Email Notifications</h4>
                        <p className="text-sm text-gray-600">Send notifications via email</p>
                      </div>
                      <Switch
                        checked={settings.notifications.emailEnabled}
                        onCheckedChange={(checked) => updateSettings("notifications", "emailEnabled", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-white to-gray-50/50">
                      <div>
                        <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                        <p className="text-sm text-gray-600">Send notifications via SMS</p>
                      </div>
                      <Switch
                        checked={settings.notifications.smsEnabled}
                        onCheckedChange={(checked) => updateSettings("notifications", "smsEnabled", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-white to-gray-50/50">
                      <div>
                        <h4 className="font-medium text-gray-900">Push Notifications</h4>
                        <p className="text-sm text-gray-600">Send browser push notifications</p>
                      </div>
                      <Switch
                        checked={settings.notifications.pushEnabled}
                        onCheckedChange={(checked) => updateSettings("notifications", "pushEnabled", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-white to-gray-50/50">
                      <div>
                        <h4 className="font-medium text-gray-900">Admin Alerts</h4>
                        <p className="text-sm text-gray-600">Critical system alerts for admins</p>
                      </div>
                      <Switch
                        checked={settings.notifications.adminAlertsEnabled}
                        onCheckedChange={(checked) => updateSettings("notifications", "adminAlertsEnabled", checked)}
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={settings.notifications.adminEmail}
                      onChange={(e) => updateSettings("notifications", "adminEmail", e.target.value)}
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Blockchain Settings */}
            {activeTab === "blockchain" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Blockchain Configuration
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="defaultNetwork">Default Network</Label>
                      <Select 
                        value={settings.blockchain.defaultNetwork} 
                        onValueChange={(value) => updateSettings("blockchain", "defaultNetwork", value)}
                      >
                        <SelectTrigger className="border-gray-200 focus:border-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ethereum">Ethereum</SelectItem>
                          <SelectItem value="polygon">Polygon</SelectItem>
                          <SelectItem value="arbitrum">Arbitrum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="gasLimit">Default Gas Limit</Label>
                      <Input
                        id="gasLimit"
                        type="number"
                        value={settings.blockchain.gasLimit}
                        onChange={(e) => updateSettings("blockchain", "gasLimit", parseInt(e.target.value))}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6 mt-4">
                    <div>
                      <Label htmlFor="confirmationBlocks">Confirmation Blocks</Label>
                      <Input
                        id="confirmationBlocks"
                        type="number"
                        value={settings.blockchain.confirmationBlocks}
                        onChange={(e) => updateSettings("blockchain", "confirmationBlocks", parseInt(e.target.value))}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxGasPrice">Max Gas Price (gwei)</Label>
                      <Input
                        id="maxGasPrice"
                        type="number"
                        value={settings.blockchain.maxGasPrice}
                        onChange={(e) => updateSettings("blockchain", "maxGasPrice", parseInt(e.target.value))}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Supported Networks
                    </Label>
                    <div className="space-y-2">
                      {["ethereum", "polygon", "arbitrum", "bsc", "avalanche"].map((network) => (
                        <div key={network} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gradient-to-r from-white to-gray-50/50">
                          <span className="font-medium text-gray-900 capitalize">{network}</span>
                          <Switch
                            checked={settings.blockchain.supportedNetworks.includes(network)}
                            onCheckedChange={(checked) => {
                              const networks = checked
                                ? [...settings.blockchain.supportedNetworks, network]
                                : settings.blockchain.supportedNetworks.filter(n => n !== network);
                              updateSettings("blockchain", "supportedNetworks", networks);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* API Settings */}
            {activeTab === "api" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    API Configuration
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-white to-gray-50/50">
                      <div>
                        <h4 className="font-medium text-gray-900">Rate Limiting</h4>
                        <p className="text-sm text-gray-600">Enable API rate limiting</p>
                      </div>
                      <Switch
                        checked={settings.api.rateLimitEnabled}
                        onCheckedChange={(checked) => updateSettings("api", "rateLimitEnabled", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-white to-gray-50/50">
                      <div>
                        <h4 className="font-medium text-gray-900">CORS Enabled</h4>
                        <p className="text-sm text-gray-600">Allow cross-origin requests</p>
                      </div>
                      <Switch
                        checked={settings.api.corsEnabled}
                        onCheckedChange={(checked) => updateSettings("api", "corsEnabled", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-white to-gray-50/50">
                      <div>
                        <h4 className="font-medium text-gray-900">Webhooks Enabled</h4>
                        <p className="text-sm text-gray-600">Enable webhook notifications</p>
                      </div>
                      <Switch
                        checked={settings.api.webhooksEnabled}
                        onCheckedChange={(checked) => updateSettings("api", "webhooksEnabled", checked)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6 mt-6">
                    <div>
                      <Label htmlFor="rateLimit">Rate Limit (requests/minute)</Label>
                      <Input
                        id="rateLimit"
                        type="number"
                        value={settings.api.rateLimit}
                        onChange={(e) => updateSettings("api", "rateLimit", parseInt(e.target.value))}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="apiVersion">API Version</Label>
                      <Select 
                        value={settings.api.version} 
                        onValueChange={(value) => updateSettings("api", "version", value)}
                      >
                        <SelectTrigger className="border-gray-200 focus:border-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="v1">v1</SelectItem>
                          <SelectItem value="v2">v2</SelectItem>
                          <SelectItem value="v3">v3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="corsOrigins">CORS Origins (comma-separated)</Label>
                    <Textarea
                      id="corsOrigins"
                      value={settings.api.corsOrigins.join(", ")}
                      onChange={(e) => updateSettings("api", "corsOrigins", e.target.value.split(", ").filter(Boolean))}
                      placeholder="https://example.com, https://app.example.com"
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
