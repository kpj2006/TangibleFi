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
  AlertTriangle,
  Shield,
  Pause,
  Play,
  Lock,
  Unlock,
  StopCircle,
  CheckCircle,
  Clock,
  Activity,
  AlertCircle,
  Zap,
} from "lucide-react";

interface EmergencyStatus {
  isEmergencyMode: boolean;
  isPaused: boolean;
  isWithdrawalLocked: boolean;
  lastEmergencyAction: string;
  emergencyReason: string;
  activatedBy: string;
  activatedAt: string;
  affectedContracts: string[];
}

interface EmergencyAction {
  id: string;
  type: "pause" | "unpause" | "lock" | "unlock" | "emergency_stop" | "resume";
  description: string;
  timestamp: string;
  executor: string;
  reason: string;
  affectedContracts: string[];
  status: "completed" | "pending" | "failed";
}

export default function EmergencyControls() {
  const [emergencyStatus, setEmergencyStatus] = useState<EmergencyStatus>({
    isEmergencyMode: false,
    isPaused: false,
    isWithdrawalLocked: false,
    lastEmergencyAction: "",
    emergencyReason: "",
    activatedBy: "",
    activatedAt: "",
    affectedContracts: [],
  });
  const [emergencyActions, setEmergencyActions] = useState<EmergencyAction[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [actionReason, setActionReason] = useState("");
  const [selectedContracts, setSelectedContracts] = useState<string[]>([]);
  const [isConfirming, setIsConfirming] = useState<string | null>(null);

  const availableContracts = [
    { id: "main", name: "TangibleFi Diamond", address: "0x742d35Cc..." },
    { id: "nft", name: "Asset NFT Factory", address: "0x8ba1f109..." },
    { id: "lending", name: "Lending Pool", address: "0xa39643CF..." },
  ];

  useEffect(() => {
    fetchEmergencyStatus();
    fetchEmergencyActions();
    // Set up real-time updates
    const interval = setInterval(() => {
      fetchEmergencyStatus();
      fetchEmergencyActions();
    }, 10000); // Update every 10 seconds for emergency monitoring
    return () => clearInterval(interval);
  }, []);

  const fetchEmergencyStatus = async () => {
    try {
      const response = await fetch("/api/admin/emergency/status");
      if (response.ok) {
        const data = await response.json();
        setEmergencyStatus(data);
      } else {
        // Mock data for development
        setEmergencyStatus({
          isEmergencyMode: false,
          isPaused: false,
          isWithdrawalLocked: false,
          lastEmergencyAction: "System resumed",
          emergencyReason: "",
          activatedBy: "",
          activatedAt: "",
          affectedContracts: [],
        });
      }
    } catch (error) {
      console.error("Error fetching emergency status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmergencyActions = async () => {
    try {
      const response = await fetch("/api/admin/emergency/actions");
      if (response.ok) {
        const data = await response.json();
        setEmergencyActions(data);
      } else {
        // Mock data
        setEmergencyActions([
          {
            id: "1",
            type: "pause",
            description: "Emergency pause activated due to suspicious activity",
            timestamp: "2024-01-15T14:30:00Z",
            executor: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C8b",
            reason: "Suspicious large transactions detected",
            affectedContracts: ["main", "nft"],
            status: "completed",
          },
          {
            id: "2",
            type: "unpause",
            description: "System resumed after security review",
            timestamp: "2024-01-15T16:45:00Z",
            executor: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C8b",
            reason: "Security review completed, no threats found",
            affectedContracts: ["main", "nft"],
            status: "completed",
          },
          {
            id: "3",
            type: "lock",
            description: "Withdrawal lock activated",
            timestamp: "2024-01-14T09:20:00Z",
            executor: "0x8ba1f109551bD432803012645Hac136c5c8b8b8b",
            reason: "Maintenance window for contract upgrade",
            affectedContracts: ["lending"],
            status: "completed",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching emergency actions:", error);
    }
  };

  const executeEmergencyAction = async (actionType: string) => {
    if (!actionReason.trim()) {
      alert("Please provide a reason for this emergency action");
      return;
    }

    if (selectedContracts.length === 0) {
      alert("Please select at least one contract");
      return;
    }

    try {
      const response = await fetch("/api/admin/emergency/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: actionType,
          reason: actionReason,
          contracts: selectedContracts,
        }),
      });

      if (response.ok) {
        // Update local state
        const newStatus = { ...emergencyStatus };
        switch (actionType) {
          case "emergency_stop":
            newStatus.isEmergencyMode = true;
            newStatus.isPaused = true;
            break;
          case "pause":
            newStatus.isPaused = true;
            break;
          case "unpause":
            newStatus.isPaused = false;
            break;
          case "lock":
            newStatus.isWithdrawalLocked = true;
            break;
          case "unlock":
            newStatus.isWithdrawalLocked = false;
            break;
          case "resume":
            newStatus.isEmergencyMode = false;
            newStatus.isPaused = false;
            newStatus.isWithdrawalLocked = false;
            break;
        }
        newStatus.lastEmergencyAction = actionType;
        newStatus.emergencyReason = actionReason;
        newStatus.activatedAt = new Date().toISOString();
        newStatus.affectedContracts = selectedContracts;

        setEmergencyStatus(newStatus);
        setActionReason("");
        setSelectedContracts([]);
        setIsConfirming(null);

        // Refresh data
        fetchEmergencyActions();

        alert(`Emergency action "${actionType}" executed successfully`);
      } else {
        alert(`Error executing emergency action: ${actionType}`);
      }
    } catch (error) {
      console.error(`Error executing emergency action:`, error);
      alert(`Error executing emergency action: ${actionType}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "pause":
        return <Pause className="w-4 h-4" />;
      case "unpause":
        return <Play className="w-4 h-4" />;
      case "lock":
        return <Lock className="w-4 h-4" />;
      case "unlock":
        return <Unlock className="w-4 h-4" />;
      case "emergency_stop":
        return <StopCircle className="w-4 h-4" />;
      case "resume":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Emergency Controls</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Emergency Controls
          </h1>
          <p className="text-gray-600 mt-1">
            Critical system controls and emergency procedures
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              emergencyStatus.isEmergencyMode ? "destructive" : "secondary"
            }
            className={
              emergencyStatus.isEmergencyMode
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }
          >
            {emergencyStatus.isEmergencyMode ? (
              <>
                <AlertTriangle className="w-3 h-3 mr-1" />
                Emergency Mode
              </>
            ) : (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Normal Operation
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className={
            emergencyStatus.isEmergencyMode ? "border-red-200 bg-red-50" : ""
          }
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Emergency Mode</p>
                <p
                  className={`text-2xl font-bold ${
                    emergencyStatus.isEmergencyMode
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {emergencyStatus.isEmergencyMode ? "ACTIVE" : "INACTIVE"}
                </p>
              </div>
              <AlertTriangle
                className={`h-8 w-8 ${
                  emergencyStatus.isEmergencyMode
                    ? "text-red-600"
                    : "text-gray-400"
                }`}
              />
            </div>
          </CardContent>
        </Card>

        <Card
          className={
            emergencyStatus.isPaused ? "border-yellow-200 bg-yellow-50" : ""
          }
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">System Status</p>
                <p
                  className={`text-2xl font-bold ${
                    emergencyStatus.isPaused
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {emergencyStatus.isPaused ? "PAUSED" : "RUNNING"}
                </p>
              </div>
              {emergencyStatus.isPaused ? (
                <Pause className="h-8 w-8 text-yellow-600" />
              ) : (
                <Play className="h-8 w-8 text-green-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          className={
            emergencyStatus.isWithdrawalLocked
              ? "border-orange-200 bg-orange-50"
              : ""
          }
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Withdrawals</p>
                <p
                  className={`text-2xl font-bold ${
                    emergencyStatus.isWithdrawalLocked
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}
                >
                  {emergencyStatus.isWithdrawalLocked ? "LOCKED" : "OPEN"}
                </p>
              </div>
              {emergencyStatus.isWithdrawalLocked ? (
                <Lock className="h-8 w-8 text-orange-600" />
              ) : (
                <Unlock className="h-8 w-8 text-green-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last Action</p>
                <p className="text-lg font-bold text-blue-600">
                  {emergencyStatus.lastEmergencyAction || "None"}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Emergency Actions
            </CardTitle>
            <CardDescription>Execute critical system controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Contract Selection */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Select Contracts
              </Label>
              <div className="space-y-2">
                {availableContracts.map((contract) => (
                  <label
                    key={contract.id}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedContracts.includes(contract.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedContracts([
                            ...selectedContracts,
                            contract.id,
                          ]);
                        } else {
                          setSelectedContracts(
                            selectedContracts.filter((id) => id !== contract.id)
                          );
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">
                      {contract.name} ({contract.address})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Reason Input */}
            <div>
              <Label htmlFor="reason">Action Reason</Label>
              <Textarea
                id="reason"
                placeholder="Provide a detailed reason for this emergency action..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              {!emergencyStatus.isEmergencyMode ? (
                <Button
                  onClick={() => setIsConfirming("emergency_stop")}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                  disabled={
                    !actionReason.trim() || selectedContracts.length === 0
                  }
                >
                  <StopCircle className="w-4 h-4 mr-2" />
                  Emergency Stop
                </Button>
              ) : (
                <Button
                  onClick={() => setIsConfirming("resume")}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={
                    !actionReason.trim() || selectedContracts.length === 0
                  }
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Resume System
                </Button>
              )}

              {!emergencyStatus.isPaused ? (
                <Button
                  onClick={() => setIsConfirming("pause")}
                  variant="outline"
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                  disabled={
                    !actionReason.trim() || selectedContracts.length === 0
                  }
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause System
                </Button>
              ) : (
                <Button
                  onClick={() => setIsConfirming("unpause")}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                  disabled={
                    !actionReason.trim() || selectedContracts.length === 0
                  }
                >
                  <Play className="w-4 h-4 mr-2" />
                  Unpause System
                </Button>
              )}

              {!emergencyStatus.isWithdrawalLocked ? (
                <Button
                  onClick={() => setIsConfirming("lock")}
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  disabled={
                    !actionReason.trim() || selectedContracts.length === 0
                  }
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Lock Withdrawals
                </Button>
              ) : (
                <Button
                  onClick={() => setIsConfirming("unlock")}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  disabled={
                    !actionReason.trim() || selectedContracts.length === 0
                  }
                >
                  <Unlock className="w-4 h-4 mr-2" />
                  Unlock Withdrawals
                </Button>
              )}
            </div>

            {/* Confirmation Dialog */}
            {isConfirming && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <h3 className="font-semibold text-red-800">
                      Confirm Emergency Action
                    </h3>
                  </div>
                  <p className="text-red-700 text-sm mb-4">
                    Are you sure you want to execute "{isConfirming}"? This
                    action will affect {selectedContracts.length} contract(s)
                    and cannot be easily undone.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => executeEmergencyAction(isConfirming)}
                      size="sm"
                      variant="destructive"
                    >
                      Confirm
                    </Button>
                    <Button
                      onClick={() => setIsConfirming(null)}
                      size="sm"
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Action History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Action History
            </CardTitle>
            <CardDescription>
              Recent emergency actions and system events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {emergencyActions.map((action) => (
                <Card key={action.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getActionIcon(action.type)}
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {action.type.replace("_", " ").toUpperCase()}
                        </h3>
                      </div>
                      <Badge className={getStatusColor(action.status)}>
                        {action.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      {action.description}
                    </p>

                    <div className="text-xs text-gray-500 space-y-1">
                      <div>
                        <strong>Reason:</strong> {action.reason}
                      </div>
                      <div>
                        <strong>Executor:</strong>{" "}
                        {action.executor.slice(0, 10)}...
                        {action.executor.slice(-8)}
                      </div>
                      <div>
                        <strong>Time:</strong>{" "}
                        {new Date(action.timestamp).toLocaleString()}
                      </div>
                      <div>
                        <strong>Contracts:</strong>{" "}
                        {action.affectedContracts.length} affected
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
