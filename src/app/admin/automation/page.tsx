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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Zap,
  Bot,
  Clock,
  Play,
  Pause,
  Settings,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Activity,
  Calendar,
  Target,
} from "lucide-react";

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  type: "scheduled" | "event_based" | "threshold" | "approval";
  status: "active" | "paused" | "error";
  trigger: {
    type: string;
    condition: string;
    value?: number;
    schedule?: string;
  };
  action: {
    type: string;
    parameters: Record<string, any>;
  };
  lastExecuted?: string;
  executionCount: number;
  successRate: number;
  createdAt: string;
  createdBy: string;
}

interface AutomationStats {
  totalRules: number;
  activeRules: number;
  executionsToday: number;
  successRate: number;
  avgExecutionTime: number;
}

export default function AutomationManagement() {
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [automationStats, setAutomationStats] =
    useState<AutomationStats | null>(null);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newRule, setNewRule] = useState({
    name: "",
    description: "",
    type: "scheduled" as "scheduled" | "event_based" | "threshold" | "approval",
    triggerType: "",
    triggerCondition: "",
    triggerValue: 0,
    triggerSchedule: "",
    actionType: "",
    actionParameters: {} as Record<string, any>,
  });

  useEffect(() => {
    fetchAutomationData();
    fetchAutomationStats();
    // Set up real-time updates
    const interval = setInterval(() => {
      fetchAutomationData();
      fetchAutomationStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAutomationData = async () => {
    try {
      const response = await fetch("/api/admin/automation");
      if (response.ok) {
        const data = await response.json();
        setAutomationRules(data);
      } else {
        // Mock data for development
        setAutomationRules([
          {
            id: "1",
            name: "Auto Asset Approval",
            description:
              "Automatically approve assets that meet specific criteria",
            type: "event_based",
            status: "active",
            trigger: {
              type: "asset_submitted",
              condition: "value_less_than",
              value: 100000,
            },
            action: {
              type: "approve_asset",
              parameters: { auto_approve: true, notify_admin: true },
            },
            lastExecuted: "2025-01-15T14:30:00Z",
            executionCount: 45,
            successRate: 97.8,
            createdAt: "2025-01-10T10:00:00Z",
            createdBy: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C8b",
          },
          {
            id: "2",
            name: "Daily Fee Collection",
            description: "Collect platform fees daily at midnight",
            type: "scheduled",
            status: "active",
            trigger: {
              type: "schedule",
              condition: "daily",
              schedule: "0 0 * * *",
            },
            action: {
              type: "collect_fees",
              parameters: { notify_treasury: true },
            },
            lastExecuted: "2025-01-15T00:00:00Z",
            executionCount: 15,
            successRate: 100,
            createdAt: "2025-01-01T00:00:00Z",
            createdBy: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C8b",
          },
          {
            id: "3",
            name: "High Value Alert",
            description: "Alert admins when asset value exceeds threshold",
            type: "threshold",
            status: "active",
            trigger: {
              type: "asset_value",
              condition: "greater_than",
              value: 1000000,
            },
            action: {
              type: "send_alert",
              parameters: { alert_type: "high_value", notify_all_admins: true },
            },
            lastExecuted: "2025-01-14T16:45:00Z",
            executionCount: 8,
            successRate: 100,
            createdAt: "2025-01-05T12:00:00Z",
            createdBy: "0x8ba1f109551bD432803012645Hac136c5c8b8b8b",
          },
          {
            id: "4",
            name: "KYC Reminder",
            description: "Send KYC completion reminders to pending users",
            type: "scheduled",
            status: "paused",
            trigger: {
              type: "schedule",
              condition: "weekly",
              schedule: "0 9 * * 1",
            },
            action: {
              type: "send_reminder",
              parameters: { reminder_type: "kyc", template: "kyc_reminder" },
            },
            lastExecuted: "2025-01-08T09:00:00Z",
            executionCount: 3,
            successRate: 100,
            createdAt: "2025-01-01T00:00:00Z",
            createdBy: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C8b",
          },
          {
            id: "5",
            name: "Contract Health Check",
            description: "Monitor smart contract health and gas usage",
            type: "scheduled",
            status: "active",
            trigger: {
              type: "schedule",
              condition: "hourly",
              schedule: "0 * * * *",
            },
            action: {
              type: "health_check",
              parameters: {
                check_gas: true,
                check_balance: true,
                alert_threshold: 0.1,
              },
            },
            lastExecuted: "2025-01-15T15:00:00Z",
            executionCount: 360,
            successRate: 99.2,
            createdAt: "2025-01-01T00:00:00Z",
            createdBy: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C8b",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching automation data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAutomationStats = async () => {
    try {
      const response = await fetch("/api/admin/automation/stats");
      if (response.ok) {
        const data = await response.json();
        setAutomationStats(data);
      } else {
        // Mock data
        setAutomationStats({
          totalRules: 5,
          activeRules: 4,
          executionsToday: 28,
          successRate: 98.5,
          avgExecutionTime: 2.3,
        });
      }
    } catch (error) {
      console.error("Error fetching automation stats:", error);
    }
  };

  const handleToggleRule = async (ruleId: string) => {
    const rule = automationRules.find((r) => r.id === ruleId);
    if (!rule) return;

    const newStatus = rule.status === "active" ? "paused" : "active";

    try {
      const response = await fetch(`/api/admin/automation/${ruleId}/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setAutomationRules(
          automationRules.map((r) =>
            r.id === ruleId ? { ...r, status: newStatus } : r
          )
        );
        alert(
          `Rule ${newStatus === "active" ? "activated" : "paused"} successfully`
        );
      } else {
        alert("Error updating rule status");
      }
    } catch (error) {
      console.error("Error toggling rule:", error);
      alert("Error updating rule status");
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm("Are you sure you want to delete this automation rule?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/automation/${ruleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAutomationRules(automationRules.filter((r) => r.id !== ruleId));
        if (selectedRule?.id === ruleId) {
          setSelectedRule(null);
        }
        alert("Rule deleted successfully");
      } else {
        alert("Error deleting rule");
      }
    } catch (error) {
      console.error("Error deleting rule:", error);
      alert("Error deleting rule");
    }
  };

  const handleCreateRule = async () => {
    if (!newRule.name.trim() || !newRule.description.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch("/api/admin/automation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newRule.name,
          description: newRule.description,
          type: newRule.type,
          trigger: {
            type: newRule.triggerType,
            condition: newRule.triggerCondition,
            value: newRule.triggerValue,
            schedule: newRule.triggerSchedule,
          },
          action: {
            type: newRule.actionType,
            parameters: newRule.actionParameters,
          },
        }),
      });

      if (response.ok) {
        const createdRule = await response.json();
        setAutomationRules([...automationRules, createdRule]);
        setIsCreating(false);
        setNewRule({
          name: "",
          description: "",
          type: "scheduled",
          triggerType: "",
          triggerCondition: "",
          triggerValue: 0,
          triggerSchedule: "",
          actionType: "",
          actionParameters: {},
        });
        alert("Automation rule created successfully");
      } else {
        alert("Error creating rule");
      }
    } catch (error) {
      console.error("Error creating rule:", error);
      alert("Error creating rule");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "event_based":
        return "bg-purple-100 text-purple-800";
      case "threshold":
        return "bg-orange-100 text-orange-800";
      case "approval":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <div className="space-y-8 p-6">
          <h1 className="text-3xl font-bold text-gray-900">Automation</h1>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-white/60 rounded-lg shadow-sm"></div>
            <div className="h-64 bg-white/60 rounded-lg shadow-sm"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 animate-fadeIn">
      <div className="space-y-8 p-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Automation</h1>
            <p className="text-gray-600 mt-1">
              Manage automated processes and workflows across all networks
            </p>
          </div>
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Rule
          </Button>
        </div>

        {/* Automation Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {automationStats && (
            <>
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Rules
                      </p>
                      <p className="text-3xl font-bold text-blue-600">
                        {automationStats.totalRules}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50">
                      <Bot className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Active Rules
                      </p>
                      <p className="text-3xl font-bold text-emerald-600">
                        {automationStats.activeRules}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50">
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Executions Today
                      </p>
                      <p className="text-3xl font-bold text-purple-600">
                        {automationStats.executionsToday}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-50">
                      <Activity className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Success Rate
                      </p>
                      <p className="text-3xl font-bold text-emerald-600">
                        {automationStats.successRate}%
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50">
                      <Target className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Avg Time
                      </p>
                      <p className="text-3xl font-bold text-orange-600">
                        {automationStats.avgExecutionTime}s
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-orange-50">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Create Rule Modal */}
        {isCreating && (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-50/50">
            <CardHeader className="border-b border-blue-200">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Plus className="h-6 w-6 text-blue-600" />
                Create Automation Rule
              </CardTitle>
              <CardDescription>
                Configure a new automated process
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Rule Name</Label>
                  <Input
                    id="name"
                    value={newRule.name}
                    onChange={(e) =>
                      setNewRule({ ...newRule, name: e.target.value })
                    }
                    placeholder="Enter rule name"
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Rule Type</Label>
                  <Select
                    value={newRule.type}
                    onValueChange={(value: any) =>
                      setNewRule({ ...newRule, type: value })
                    }
                  >
                    <SelectTrigger className="border-gray-200 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="event_based">Event Based</SelectItem>
                      <SelectItem value="threshold">Threshold</SelectItem>
                      <SelectItem value="approval">Approval</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newRule.description}
                  onChange={(e) =>
                    setNewRule({ ...newRule, description: e.target.value })
                  }
                  placeholder="Describe what this rule does"
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="triggerType">Trigger Type</Label>
                  <Select
                    value={newRule.triggerType}
                    onValueChange={(value) =>
                      setNewRule({ ...newRule, triggerType: value })
                    }
                  >
                    <SelectTrigger className="border-gray-200 focus:border-blue-500">
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="schedule">Schedule</SelectItem>
                      <SelectItem value="asset_submitted">
                        Asset Submitted
                      </SelectItem>
                      <SelectItem value="user_registered">
                        User Registered
                      </SelectItem>
                      <SelectItem value="asset_value">Asset Value</SelectItem>
                      <SelectItem value="transaction_count">
                        Transaction Count
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="actionType">Action Type</Label>
                  <Select
                    value={newRule.actionType}
                    onValueChange={(value) =>
                      setNewRule({ ...newRule, actionType: value })
                    }
                  >
                    <SelectTrigger className="border-gray-200 focus:border-blue-500">
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approve_asset">
                        Approve Asset
                      </SelectItem>
                      <SelectItem value="send_alert">Send Alert</SelectItem>
                      <SelectItem value="collect_fees">Collect Fees</SelectItem>
                      <SelectItem value="send_reminder">
                        Send Reminder
                      </SelectItem>
                      <SelectItem value="health_check">Health Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newRule.type === "scheduled" && (
                <div>
                  <Label htmlFor="schedule">Cron Schedule</Label>
                  <Input
                    id="schedule"
                    value={newRule.triggerSchedule}
                    onChange={(e) =>
                      setNewRule({
                        ...newRule,
                        triggerSchedule: e.target.value,
                      })
                    }
                    placeholder="0 0 * * * (daily at midnight)"
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              )}

              {(newRule.type === "threshold" ||
                newRule.type === "event_based") && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="condition">Condition</Label>
                    <Select
                      value={newRule.triggerCondition}
                      onValueChange={(value) =>
                        setNewRule({ ...newRule, triggerCondition: value })
                      }
                    >
                      <SelectTrigger className="border-gray-200 focus:border-blue-500">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="greater_than">
                          Greater Than
                        </SelectItem>
                        <SelectItem value="less_than">Less Than</SelectItem>
                        <SelectItem value="equals">Equals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="value">Threshold Value</Label>
                    <Input
                      id="value"
                      type="number"
                      value={newRule.triggerValue}
                      onChange={(e) =>
                        setNewRule({
                          ...newRule,
                          triggerValue: parseFloat(e.target.value),
                        })
                      }
                      placeholder="Enter threshold value"
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={handleCreateRule}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-sm hover:shadow-md transition-all"
                >
                  Create Rule
                </Button>
                <Button
                  onClick={() => setIsCreating(false)}
                  variant="outline"
                  className="flex-1 border-gray-200 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Automation Rules Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Rules List */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Zap className="h-6 w-6 text-blue-600" />
                Automation Rules
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200 ml-2"
                >
                  LIVE
                </Badge>
              </CardTitle>
              <CardDescription>Click on a rule to view details</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {automationRules.map((rule) => (
                <Card
                  key={rule.id}
                  className={`cursor-pointer transition-all hover:shadow-lg border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 ${
                    selectedRule?.id === rule.id
                      ? "ring-2 ring-blue-500 shadow-lg"
                      : ""
                  }`}
                  onClick={() => setSelectedRule(rule)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {rule.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {rule.description}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Badge
                          className={`${getStatusColor(rule.status)} border`}
                        >
                          {rule.status}
                        </Badge>
                        <Badge className={`${getTypeColor(rule.type)} border`}>
                          {rule.type}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Executions:</span>
                        <span className="ml-1 font-medium text-gray-900">
                          {rule.executionCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Success Rate:</span>
                        <span className="ml-1 font-medium text-emerald-600">
                          {rule.successRate}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Last Run:</span>
                        <span className="ml-1 font-medium text-gray-900">
                          {rule.lastExecuted
                            ? new Date(rule.lastExecuted).toLocaleDateString()
                            : "Never"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <span className="ml-1 font-medium text-gray-900">
                          {new Date(rule.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Rule Details */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Settings className="w-6 h-6 text-emerald-600" />
                Rule Management
              </CardTitle>
              <CardDescription>
                {selectedRule
                  ? "Manage selected automation rule"
                  : "Select a rule to manage"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {selectedRule ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {selectedRule.name}
                    </h3>
                    <p className="text-gray-600">{selectedRule.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Status
                      </label>
                      <div className="mt-1">
                        <Badge
                          className={`${getStatusColor(selectedRule.status)} border`}
                        >
                          {selectedRule.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Type
                      </label>
                      <div className="mt-1">
                        <Badge
                          className={`${getTypeColor(selectedRule.type)} border`}
                        >
                          {selectedRule.type}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Executions
                      </label>
                      <p className="text-gray-900 font-medium">
                        {selectedRule.executionCount}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Success Rate
                      </label>
                      <p className="text-emerald-600 font-bold">
                        {selectedRule.successRate}%
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Last Executed
                      </label>
                      <p className="text-gray-900 font-medium">
                        {selectedRule.lastExecuted
                          ? new Date(selectedRule.lastExecuted).toLocaleString()
                          : "Never"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Created By
                      </label>
                      <p className="text-gray-900 font-medium font-mono text-xs bg-gray-50 px-2 py-1 rounded">
                        {selectedRule.createdBy.slice(0, 10)}...
                        {selectedRule.createdBy.slice(-8)}
                      </p>
                    </div>
                  </div>

                  {/* Trigger Details */}
                  <div>
                    <h4 className="text-gray-900 font-semibold mb-2">
                      Trigger Configuration
                    </h4>
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg border border-gray-100">
                      <div className="text-sm space-y-1">
                        <div>
                          <strong>Type:</strong> {selectedRule.trigger.type}
                        </div>
                        <div>
                          <strong>Condition:</strong>{" "}
                          {selectedRule.trigger.condition}
                        </div>
                        {selectedRule.trigger.value && (
                          <div>
                            <strong>Value:</strong> {selectedRule.trigger.value}
                          </div>
                        )}
                        {selectedRule.trigger.schedule && (
                          <div>
                            <strong>Schedule:</strong>{" "}
                            {selectedRule.trigger.schedule}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Details */}
                  <div>
                    <h4 className="text-gray-900 font-semibold mb-2">
                      Action Configuration
                    </h4>
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg border border-gray-100">
                      <div className="text-sm space-y-1">
                        <div>
                          <strong>Type:</strong> {selectedRule.action.type}
                        </div>
                        <div>
                          <strong>Parameters:</strong>
                          <pre className="text-xs mt-1 p-2 bg-white rounded border">
                            {JSON.stringify(
                              selectedRule.action.parameters,
                              null,
                              2
                            )}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Button
                      onClick={() => handleToggleRule(selectedRule.id)}
                      className={`flex-1 shadow-sm hover:shadow-md transition-all ${
                        selectedRule.status === "active"
                          ? "bg-yellow-600 hover:bg-yellow-700"
                          : "bg-emerald-600 hover:bg-emerald-700"
                      } text-white`}
                    >
                      {selectedRule.status === "active" ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause Rule
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Activate Rule
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={() => handleDeleteRule(selectedRule.id)}
                      variant="destructive"
                      className="flex-1 shadow-sm hover:shadow-md transition-all"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Rule
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Select an automation rule from the list to manage
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
