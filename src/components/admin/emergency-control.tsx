"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Shield,
  Power,
  Lock,
  Unlock,
  Pause,
  Play,
  StopCircle,
  Activity,
  Clock,
  FileText,
  Phone,
  Mail,
  Settings,
  Zap,
  Database,
  Users,
  Building2,
  TrendingDown,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface EmergencyControlSectionProps {
  onBack: () => void;
}

export default function EmergencyControlSection({
  onBack,
}: EmergencyControlSectionProps) {
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [incidentReport, setIncidentReport] = useState("");

  const systemStatus = {
    allOperational: true,
    lastCheck: "2 minutes ago",
    uptime: 99.98,
    activeConnections: 2384,
    totalTransactions: 15672,
    errorRate: 0.02,
  };

  const circuitBreakers = [
    {
      id: "asset-tokenization",
      name: "Asset Tokenization",
      status: "active",
      description: "Controls new asset tokenization requests",
      icon: Building2,
      color: "text-green-600",
      bgColor: "bg-green-50",
      lastTriggered: null,
    },
    {
      id: "user-registration",
      name: "User Registration",
      status: "active",
      description: "Controls new user account creation",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      lastTriggered: null,
    },
    {
      id: "large-transfers",
      name: "Large Transfers",
      status: "throttled",
      description: "Transfers above $100K require manual approval",
      icon: TrendingDown,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      lastTriggered: "1 hour ago",
    },
    {
      id: "api-endpoints",
      name: "API Endpoints",
      status: "active",
      description: "Rate limiting and DDoS protection",
      icon: Zap,
      color: "text-green-600",
      bgColor: "bg-green-50",
      lastTriggered: null,
    },
    {
      id: "database-writes",
      name: "Database Writes",
      status: "active",
      description: "Controls critical database operations",
      icon: Database,
      color: "text-green-600",
      bgColor: "bg-green-50",
      lastTriggered: null,
    },
  ];

  const emergencyProtocols = [
    {
      id: "full-shutdown",
      name: "Complete Platform Shutdown",
      level: "critical",
      description: "Immediately halt all platform operations",
      color: "bg-red-600",
      textColor: "text-red-600",
      hoverBg: "hover:bg-red-600",
      hoverBorder: "hover:border-red-600",
      hoverText: "hover:text-white",
      estimatedDowntime: "2-4 hours",
      affectedUsers: "All users",
      requiresApproval: true,
    },
    {
      id: "trading-halt",
      name: "Trading Halt",
      level: "high",
      description: "Suspend all trading and asset transfers",
      color: "bg-orange-600",
      textColor: "text-orange-600",
      hoverBg: "hover:bg-orange-600",
      hoverBorder: "hover:border-orange-600",
      hoverText: "hover:text-white",
      estimatedDowntime: "30-60 minutes",
      affectedUsers: "Active traders",
      requiresApproval: true,
    },
    {
      id: "new-registrations",
      name: "Registration Freeze",
      level: "medium",
      description: "Temporarily disable new user registrations",
      color: "bg-yellow-600",
      textColor: "text-yellow-600",
      hoverBg: "hover:bg-yellow-600",
      hoverBorder: "hover:border-yellow-600",
      hoverText: "hover:text-white",
      estimatedDowntime: "15-30 minutes",
      affectedUsers: "New users only",
      requiresApproval: false,
    },
    {
      id: "maintenance-mode",
      name: "Maintenance Mode",
      level: "low",
      description: "Enable maintenance mode with user notifications",
      color: "bg-blue-600",
      textColor: "text-blue-600",
      hoverBg: "hover:bg-blue-600",
      hoverBorder: "hover:border-blue-600",
      hoverText: "hover:text-white",
      estimatedDowntime: "10-20 minutes",
      affectedUsers: "Read-only access",
      requiresApproval: false,
    },
  ];

  const recentIncidents = [
    {
      id: 1,
      title: "DDoS Attack Detected",
      severity: "high",
      status: "resolved",
      timestamp: "2025-01-15 14:30:00",
      duration: "12 minutes",
      description: "Automated DDoS protection triggered, attack mitigated",
      actions: [
        "Rate limiting enabled",
        "IP addresses blocked",
        "Traffic rerouted",
      ],
    },
    {
      id: 2,
      title: "Database Connection Spike",
      severity: "medium",
      status: "monitored",
      timestamp: "2025-01-14 09:15:00",
      duration: "5 minutes",
      description: "Unusual database connection spike detected and handled",
      actions: ["Connection pooling adjusted", "Query optimization applied"],
    },
    {
      id: 3,
      title: "Smart Contract Anomaly",
      severity: "low",
      status: "resolved",
      timestamp: "2025-01-13 16:45:00",
      duration: "8 minutes",
      description: "Unusual transaction pattern detected in vault contract",
      actions: [
        "Transaction paused",
        "Code review completed",
        "Normal operation resumed",
      ],
    },
  ];

  const emergencyContacts = [
    {
      name: "Security Team Lead",
      phone: "+1-555-0101",
      email: "security@tangiblefi.com",
    },
    { name: "CTO", phone: "+1-555-0102", email: "cto@tangiblefi.com" },
    {
      name: "DevOps Manager",
      phone: "+1-555-0103",
      email: "devops@tangiblefi.com",
    },
  ];

  const handleProtocolActivation = (protocolId: string) => {
    setSelectedProtocol(protocolId);
  };

  const executeEmergencyProtocol = () => {
    if (confirmationCode === "EMERGENCY-2025") {
      // Execute the emergency protocol
      alert(`Emergency protocol "${selectedProtocol}" executed successfully!`);
      setSelectedProtocol(null);
      setConfirmationCode("");
    } else {
      alert("Invalid confirmation code!");
    }
  };

  const toggleCircuitBreaker = (breakerId: string) => {
    // Toggle circuit breaker logic
    alert(`Circuit breaker "${breakerId}" toggled!`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-700 border-0 hover:bg-green-200 hover:text-green-800 transition-colors duration-200 cursor-default">
            Active
          </Badge>
        );
      case "throttled":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-0 hover:bg-yellow-200 hover:text-yellow-800 transition-colors duration-200 cursor-default">
            Throttled
          </Badge>
        );
      case "disabled":
        return (
          <Badge className="bg-red-100 text-red-700 border-0 hover:bg-red-200 hover:text-red-800 transition-colors duration-200 cursor-default">
            Disabled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 border-0 hover:bg-gray-200 hover:text-gray-800 transition-colors duration-200 cursor-default">
            Unknown
          </Badge>
        );
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50";
      case "high":
        return "text-orange-600 bg-orange-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Emergency Control Center
          </h1>
          <p className="text-gray-600 mt-1">
            System security controls and emergency response protocols
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              All Systems Operational
            </span>
          </div>
          <Badge className="bg-green-100 text-green-700 border-0">
            <Shield className="w-3 h-3 mr-1" />
            Secure Mode
          </Badge>
        </div>
      </div>

      {/* System Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            System Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {systemStatus.uptime}%
              </div>
              <div className="text-sm text-gray-500">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {systemStatus.activeConnections}
              </div>
              <div className="text-sm text-gray-500">Active Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {systemStatus.totalTransactions}
              </div>
              <div className="text-sm text-gray-500">Total Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {systemStatus.errorRate}%
              </div>
              <div className="text-sm text-gray-500">Error Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">5</div>
              <div className="text-sm text-gray-500">Active Breakers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {systemStatus.lastCheck}
              </div>
              <div className="text-sm text-gray-500">Last Check</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Protocols */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Emergency Protocols
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {emergencyProtocols.map((protocol) => (
              <Card
                key={protocol.id}
                className={`border-2 ${
                  selectedProtocol === protocol.id
                    ? "border-red-300 bg-red-50 shadow-lg"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                } transition-all duration-300 cursor-pointer transform hover:scale-[1.02] group`}
                onClick={() => handleProtocolActivation(protocol.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3
                        className={`font-bold text-lg ${protocol.textColor} mb-2 group-hover:text-opacity-80 transition-colors duration-200`}
                      >
                        {protocol.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 group-hover:text-gray-700 transition-colors duration-200">
                        {protocol.description}
                      </p>
                      <div className="space-y-2 text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-200">
                        <div>
                          Estimated downtime: {protocol.estimatedDowntime}
                        </div>
                        <div>Affected users: {protocol.affectedUsers}</div>
                        {protocol.requiresApproval && (
                          <div className="text-red-600 font-medium group-hover:text-red-700 transition-colors duration-200">
                            ⚠️ Requires approval
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge
                      className={`${protocol.color} text-white border-0 transition-transform duration-200 group-hover:scale-103`}
                    >
                      {protocol.level.toUpperCase()}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`w-full ${protocol.textColor} border-current ${protocol.hoverBg} ${protocol.hoverBorder} ${protocol.hoverText} hover:shadow-md transition-all duration-300 transform hover:scale-105`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProtocolActivation(protocol.id);
                    }}
                  >
                    Activate Protocol
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedProtocol && (
            <Card className="mt-6 border-red-300 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-700">
                  Execute Emergency Protocol
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-red-300">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    You are about to execute an emergency protocol. This action
                    requires confirmation.
                  </AlertDescription>
                </Alert>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter confirmation code:{" "}
                    <span className="font-mono">EMERGENCY-2025</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter confirmation code"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                    className="border-red-300 focus:border-red-500"
                  />
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={executeEmergencyProtocol}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={confirmationCode !== "EMERGENCY-2025"}
                  >
                    Execute Protocol
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedProtocol(null);
                      setConfirmationCode("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Circuit Breakers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Power className="w-5 h-5 text-blue-600" />
            Circuit Breakers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {circuitBreakers.map((breaker) => (
              <div
                key={breaker.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${breaker.bgColor} border-current transition-all duration-300 hover:shadow-md hover:scale-[1.01] group`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg ${breaker.bgColor} flex items-center justify-center group-hover:shadow-sm transition-shadow duration-200`}
                  >
                    <breaker.icon
                      className={`w-6 h-6 ${breaker.color} transition-transform duration-200 group-hover:scale-110`}
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-gray-800 transition-colors duration-200">
                      {breaker.name}
                    </h4>
                    <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-200">
                      {breaker.description}
                    </p>
                    {breaker.lastTriggered && (
                      <p className="text-xs text-gray-500 mt-1 group-hover:text-gray-600 transition-colors duration-200">
                        Last triggered: {breaker.lastTriggered}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="transition-transform duration-200 hover:scale-103">
                    {getStatusBadge(breaker.status)}
                  </div>
                  <div className="transition-transform duration-200 hover:scale-110">
                    <Switch
                      checked={breaker.status === "active"}
                      onCheckedChange={() => toggleCircuitBreaker(breaker.id)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Incidents */}
      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Recent Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className={`p-4 rounded-lg border ${getSeverityColor(incident.severity)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {incident.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {incident.description}
                      </p>
                    </div>
                    <Badge
                      className={
                        incident.status === "resolved"
                          ? "bg-green-100 text-green-700 border-0"
                          : "bg-yellow-100 text-yellow-700 border-0"
                      }
                    >
                      {incident.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Time: {incident.timestamp}</div>
                    <div>Duration: {incident.duration}</div>
                    <div className="mt-2">
                      <span className="font-medium">Actions taken:</span>
                      <ul className="list-disc list-inside ml-2 mt-1">
                        {incident.actions.map((action, index) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-600" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {contact.name}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{contact.email}</span>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-4 border-t">
              <Textarea
                placeholder="Emergency incident report..."
                value={incidentReport}
                onChange={(e) => setIncidentReport(e.target.value)}
                className="mb-4"
              />
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Report Emergency
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
