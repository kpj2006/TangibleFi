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
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">
            Configure platform settings and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge
              variant="outline"
              className="text-orange-600 border-orange-300"
            >
              Unsaved Changes
            </Badge>
          )}
          <Button
            onClick={handleSaveSettings}
            disabled={!hasChanges || isSaving}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>
      </div>

      {/* Settings Navigation */}
      <Card>
        <CardContent className="p-0">
          <div className="flex border-b">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Settings Content */}
      <div className="grid grid-cols-1 gap-6">
        {/* Platform Settings */}
        {activeTab === "platform" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Platform Configuration
              </CardTitle>
              <CardDescription>
                Basic platform settings and configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="platformName">Platform Name</Label>
                  <Input
                    id="platformName"
                    value={settings.platform.name}
                    onChange={(e) =>
                      updateSettings("platform", "name", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="platformVersion">Version</Label>
                  <Input
                    id="platformVersion"
                    value={settings.platform.version}
                    onChange={(e) =>
                      updateSettings("platform", "version", e.target.value)
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="platformDescription">Description</Label>
                <Textarea
                  id="platformDescription"
                  value={settings.platform.description}
                  onChange={(e) =>
                    updateSettings("platform", "description", e.target.value)
                  }
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="minAssetValue">Min Asset Value ($)</Label>
                  <Input
                    id="minAssetValue"
                    type="number"
                    value={settings.platform.minAssetValue}
                    onChange={(e) =>
                      updateSettings(
                        "platform",
                        "minAssetValue",
                        parseFloat(e.target.value)
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="maxAssetValue">Max Asset Value ($)</Label>
                  <Input
                    id="maxAssetValue"
                    type="number"
                    value={settings.platform.maxAssetValue}
                    onChange={(e) =>
                      updateSettings(
                        "platform",
                        "maxAssetValue",
                        parseFloat(e.target.value)
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="defaultFeeRate">Default Fee Rate (%)</Label>
                  <Input
                    id="defaultFeeRate"
                    type="number"
                    step="0.1"
                    value={settings.platform.defaultFeeRate}
                    onChange={(e) =>
                      updateSettings(
                        "platform",
                        "defaultFeeRate",
                        parseFloat(e.target.value)
                      )
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Maintenance Mode
                  </h3>
                  <p className="text-sm text-gray-500">
                    Enable maintenance mode to prevent user access
                  </p>
                </div>
                <Switch
                  checked={settings.platform.maintenanceMode}
                  onCheckedChange={(checked) =>
                    updateSettings("platform", "maintenanceMode", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Settings */}
        {activeTab === "security" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-600" />
                Security Configuration
              </CardTitle>
              <CardDescription>
                Security policies and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Require KYC</h3>
                    <p className="text-sm text-gray-500">
                      Require users to complete KYC verification
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.requireKYC}
                    onCheckedChange={(checked) =>
                      updateSettings("security", "requireKYC", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Enable Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-gray-500">
                      Require 2FA for admin accounts
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.enableTwoFA}
                    onCheckedChange={(checked) =>
                      updateSettings("security", "enableTwoFA", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">IP Whitelist</h3>
                    <p className="text-sm text-gray-500">
                      Restrict admin access to whitelisted IPs
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.enableIPWhitelist}
                    onCheckedChange={(checked) =>
                      updateSettings("security", "enableIPWhitelist", checked)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sessionTimeout">
                    Session Timeout (seconds)
                  </Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) =>
                      updateSettings(
                        "security",
                        "sessionTimeout",
                        parseInt(e.target.value)
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) =>
                      updateSettings(
                        "security",
                        "maxLoginAttempts",
                        parseInt(e.target.value)
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="passwordMinLength">Min Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) =>
                      updateSettings(
                        "security",
                        "passwordMinLength",
                        parseInt(e.target.value)
                      )
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications Settings */}
        {activeTab === "notifications" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-yellow-600" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure notification channels and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Email Notifications
                      </h3>
                      <p className="text-sm text-gray-500">
                        Send notifications via email
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notifications.emailEnabled}
                    onCheckedChange={(checked) =>
                      updateSettings("notifications", "emailEnabled", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-green-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        SMS Notifications
                      </h3>
                      <p className="text-sm text-gray-500">
                        Send notifications via SMS
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notifications.smsEnabled}
                    onCheckedChange={(checked) =>
                      updateSettings("notifications", "smsEnabled", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-purple-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Push Notifications
                      </h3>
                      <p className="text-sm text-gray-500">
                        Send browser push notifications
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notifications.pushEnabled}
                    onCheckedChange={(checked) =>
                      updateSettings("notifications", "pushEnabled", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Admin Alerts</h3>
                    <p className="text-sm text-gray-500">
                      Send critical alerts to administrators
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.adminAlerts}
                    onCheckedChange={(checked) =>
                      updateSettings("notifications", "adminAlerts", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      User Notifications
                    </h3>
                    <p className="text-sm text-gray-500">
                      Send notifications to users about their activities
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.userNotifications}
                    onCheckedChange={(checked) =>
                      updateSettings(
                        "notifications",
                        "userNotifications",
                        checked
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Marketing Emails
                    </h3>
                    <p className="text-sm text-gray-500">
                      Send marketing and promotional emails
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.marketingEmails}
                    onCheckedChange={(checked) =>
                      updateSettings(
                        "notifications",
                        "marketingEmails",
                        checked
                      )
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Blockchain Settings */}
        {activeTab === "blockchain" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-600" />
                Blockchain Configuration
              </CardTitle>
              <CardDescription>
                Blockchain network settings and parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultNetwork">Default Network</Label>
                  <Select
                    value={settings.blockchain.defaultNetwork}
                    onValueChange={(value) =>
                      updateSettings("blockchain", "defaultNetwork", value)
                    }
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="confirmationBlocks">
                    Confirmation Blocks
                  </Label>
                  <Input
                    id="confirmationBlocks"
                    type="number"
                    value={settings.blockchain.confirmationBlocks}
                    onChange={(e) =>
                      updateSettings(
                        "blockchain",
                        "confirmationBlocks",
                        parseInt(e.target.value)
                      )
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="gasLimitMultiplier">Gas Limit Multiplier</Label>
                <Input
                  id="gasLimitMultiplier"
                  type="number"
                  step="0.1"
                  value={settings.blockchain.gasLimitMultiplier}
                  onChange={(e) =>
                    updateSettings(
                      "blockchain",
                      "gasLimitMultiplier",
                      parseFloat(e.target.value)
                    )
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Enable Multi-chain
                  </h3>
                  <p className="text-sm text-gray-500">
                    Support multiple blockchain networks
                  </p>
                </div>
                <Switch
                  checked={settings.blockchain.enableMultichain}
                  onCheckedChange={(checked) =>
                    updateSettings("blockchain", "enableMultichain", checked)
                  }
                />
              </div>

              <div>
                <Label>Supported Networks</Label>
                <div className="mt-2 space-y-2">
                  {["ethereum", "polygon", "arbitrum", "bsc", "avalanche"].map(
                    (network) => (
                      <label
                        key={network}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={settings.blockchain.supportedNetworks.includes(
                            network
                          )}
                          onChange={(e) => {
                            const networks = e.target.checked
                              ? [
                                  ...settings.blockchain.supportedNetworks,
                                  network,
                                ]
                              : settings.blockchain.supportedNetworks.filter(
                                  (n) => n !== network
                                );
                            updateSettings(
                              "blockchain",
                              "supportedNetworks",
                              networks
                            );
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm capitalize">{network}</span>
                      </label>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* API Settings */}
        {activeTab === "api" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-green-600" />
                API Configuration
              </CardTitle>
              <CardDescription>
                API settings and integration configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rateLimit">
                    Rate Limit (requests/minute)
                  </Label>
                  <Input
                    id="rateLimit"
                    type="number"
                    value={settings.api.rateLimit}
                    onChange={(e) =>
                      updateSettings(
                        "api",
                        "rateLimit",
                        parseInt(e.target.value)
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="apiVersion">API Version</Label>
                  <Input
                    id="apiVersion"
                    value={settings.api.apiVersion}
                    onChange={(e) =>
                      updateSettings("api", "apiVersion", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Enable CORS</h3>
                    <p className="text-sm text-gray-500">
                      Allow cross-origin requests
                    </p>
                  </div>
                  <Switch
                    checked={settings.api.enableCORS}
                    onCheckedChange={(checked) =>
                      updateSettings("api", "enableCORS", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Enable Webhooks
                    </h3>
                    <p className="text-sm text-gray-500">
                      Allow webhook notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.api.enableWebhooks}
                    onCheckedChange={(checked) =>
                      updateSettings("api", "enableWebhooks", checked)
                    }
                  />
                </div>
              </div>

              {settings.api.enableWebhooks && (
                <div>
                  <Label htmlFor="webhookSecret">Webhook Secret</Label>
                  <div className="flex gap-2">
                    <Input
                      id="webhookSecret"
                      type="password"
                      value={settings.api.webhookSecret}
                      onChange={(e) =>
                        updateSettings("api", "webhookSecret", e.target.value)
                      }
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        const newSecret =
                          Math.random().toString(36).substring(2, 15) +
                          Math.random().toString(36).substring(2, 15);
                        updateSettings("api", "webhookSecret", newSecret);
                      }}
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Generate
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
