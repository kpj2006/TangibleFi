"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  Code,
  Shield,
  CheckCircle,
  AlertTriangle,
  Copy,
  ExternalLink,
  Zap,
  Lock,
  Database,
  Network,
} from "lucide-react";

interface ContractSettingsSectionProps {
  onBack: () => void;
}

export default function ContractSettingsSection({
  onBack,
}: ContractSettingsSectionProps) {
  const [selectedContract, setSelectedContract] = useState<string | null>(null);

  const contracts = [
    {
      id: "vault-manager",
      name: "Vault Manager",
      address: "0x742d35cc6cbf4532b4661e5f5e2c2d1b5a8f1234",
      network: "Ethereum",
      status: "active",
      version: "v2.1.0",
      lastUpdated: "2025-01-15",
      gasUsed: "2.1M",
      transactions: "15,672",
      tvl: "$2.97B",
    },
    {
      id: "asset-registry",
      name: "Asset Registry",
      address: "0x1234567890abcdef1234567890abcdef12345678",
      network: "Polygon",
      status: "active",
      version: "v1.8.2",
      lastUpdated: "2025-01-12",
      gasUsed: "890K",
      transactions: "8,439",
      tvl: "$1.2B",
    },
    {
      id: "fee-controller",
      name: "Fee Controller",
      address: "0xabcdef1234567890abcdef1234567890abcdef12",
      network: "Arbitrum",
      status: "maintenance",
      version: "v1.5.1",
      lastUpdated: "2025-01-10",
      gasUsed: "150K",
      transactions: "2,103",
      tvl: "$45.8K",
    },
  ];

  const contractParameters = [
    {
      name: "Max Collateral Ratio",
      value: "80%",
      type: "percentage",
      editable: true,
      description: "Maximum collateral ratio for asset backing",
    },
    {
      name: "Base Fee Rate",
      value: "0.5%",
      type: "percentage",
      editable: true,
      description: "Base management fee rate",
    },
    {
      name: "Emergency Pause",
      value: false,
      type: "boolean",
      editable: true,
      description: "Emergency pause mechanism status",
    },
    {
      name: "Min Asset Value",
      value: "$10,000",
      type: "currency",
      editable: true,
      description: "Minimum asset value for tokenization",
    },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Smart Contract Configuration
          </h1>
          <p className="text-gray-600 mt-1">
            Manage contract addresses, parameters, and deployment settings
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Code className="w-4 h-4 mr-2" />
          Deploy New Contract
        </Button>
      </div>

      {/* Contract Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        {contracts.map((contract) => (
          <Card
            key={contract.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedContract === contract.id
                ? "ring-2 ring-blue-500 bg-blue-50"
                : ""
            }`}
            onClick={() => setSelectedContract(contract.id)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{contract.name}</CardTitle>
                <Badge
                  className={
                    contract.status === "active"
                      ? "bg-green-100 text-green-700 border-0"
                      : contract.status === "maintenance"
                        ? "bg-yellow-100 text-yellow-700 border-0"
                        : "bg-red-100 text-red-700 border-0"
                  }
                >
                  {contract.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Address:</span>
                  <span className="text-sm font-mono text-gray-900">
                    {contract.address.slice(0, 6)}...
                    {contract.address.slice(-4)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(contract.address);
                    }}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Network:</span>
                    <p className="font-medium">{contract.network}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Version:</span>
                    <p className="font-medium">{contract.version}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">TVL:</span>
                    <p className="font-medium text-green-600">{contract.tvl}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Transactions:</span>
                    <p className="font-medium">{contract.transactions}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contract Details */}
      {selectedContract && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Parameters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Contract Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {contractParameters.map((param, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{param.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {param.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {param.type === "boolean" ? (
                      <Switch
                        checked={param.value as boolean}
                        disabled={!param.editable}
                      />
                    ) : (
                      <Input
                        value={param.value as string}
                        className="w-24 text-right"
                        disabled={!param.editable}
                      />
                    )}
                    {param.editable && (
                      <Button size="sm" variant="outline">
                        Update
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Security & Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Security & Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Security Status */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-900">
                        Security Audit
                      </h4>
                      <p className="text-sm text-green-700">
                        Last audit: December 2023
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-0">
                    Passed
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-blue-900">
                        Access Control
                      </h4>
                      <p className="text-sm text-blue-700">Multi-sig enabled</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-0">
                    Active
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <h4 className="font-medium text-yellow-900">
                        Rate Limiting
                      </h4>
                      <p className="text-sm text-yellow-700">
                        Monitoring gas usage
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700 border-0">
                    Monitoring
                  </Badge>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <Button className="w-full" variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Etherscan
                </Button>
                <Button className="w-full" variant="outline">
                  <Database className="w-4 h-4 mr-2" />
                  Download ABI
                </Button>
                <Button className="w-full" variant="outline">
                  <Network className="w-4 h-4 mr-2" />
                  Network Stats
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Deployment Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            Deployment Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">
                Deploy New Contract
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contract Type
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>Vault Manager</option>
                    <option>Asset Registry</option>
                    <option>Fee Controller</option>
                    <option>Custom Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Network
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>Ethereum Mainnet</option>
                    <option>Polygon</option>
                    <option>Arbitrum</option>
                    <option>Optimism</option>
                  </select>
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Deploy Contract
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-4">
                Upgrade Contract
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Contract
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    {contracts.map((contract) => (
                      <option key={contract.id} value={contract.id}>
                        {contract.name} ({contract.network})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Implementation
                  </label>
                  <Textarea
                    placeholder="0x... (new implementation address)"
                    className="h-20"
                  />
                </div>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Upgrade Contract
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
