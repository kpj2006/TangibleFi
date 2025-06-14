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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  Settings,
  Zap,
  DollarSign,
  Users,
  FileText,
  ExternalLink,
  Copy,
  RefreshCw,
} from "lucide-react";

interface ContractInfo {
  id: string;
  name: string;
  address: string;
  blockchain: string;
  status: "active" | "paused" | "upgrading" | "error";
  version: string;
  deployedAt: string;
  gasUsed: number;
  transactions: number;
  tvl: number;
  lastActivity: string;
}

interface NetworkStats {
  ethereum: {
    gasPrice: number;
    blockNumber: number;
    status: "operational" | "congested" | "error";
  };
  polygon: {
    gasPrice: number;
    blockNumber: number;
    status: "operational" | "congested" | "error";
  };
  arbitrum: {
    gasPrice: number;
    blockNumber: number;
    status: "operational" | "congested" | "error";
  };
}

export default function ContractManagement() {
  const [contracts, setContracts] = useState<ContractInfo[]>([]);
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [selectedContract, setSelectedContract] = useState<ContractInfo | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [newContractAddress, setNewContractAddress] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("ethereum");

  useEffect(() => {
    fetchContractData();
    fetchNetworkStats();
    // Set up real-time updates
    const interval = setInterval(() => {
      fetchContractData();
      fetchNetworkStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchContractData = async () => {
    try {
      const response = await fetch("/api/admin/contracts");
      if (response.ok) {
        const data = await response.json();
        setContracts(data);
      } else {
        // Mock data for development
        setContracts([
          {
            id: "1",
            name: "TangibleFi Diamond",
            address: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C8b",
            blockchain: "ethereum",
            status: "active",
            version: "1.2.0",
            deployedAt: "2025-01-10T10:30:00Z",
            gasUsed: 2500000,
            transactions: 1247,
            tvl: 45600000,
            lastActivity: "2025-01-15T14:20:00Z",
          },
          {
            id: "2",
            name: "Asset NFT Factory",
            address: "0x8ba1f109551bD432803012645Hac136c5c8b8b8b",
            blockchain: "polygon",
            status: "active",
            version: "1.1.5",
            deployedAt: "2025-01-12T09:15:00Z",
            gasUsed: 850000,
            transactions: 456,
            tvl: 12300000,
            lastActivity: "2025-01-15T13:45:00Z",
          },
          {
            id: "3",
            name: "Lending Pool",
            address: "0xa39643CF2F0B78107Ed786c8156C6de492Eec3c",
            blockchain: "arbitrum",
            status: "paused",
            version: "1.0.8",
            deployedAt: "2025-01-08T16:45:00Z",
            gasUsed: 1200000,
            transactions: 789,
            tvl: 8900000,
            lastActivity: "2025-01-14T09:30:00Z",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching contracts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNetworkStats = async () => {
    try {
      const response = await fetch("/api/admin/network-stats");
      if (response.ok) {
        const data = await response.json();
        setNetworkStats(data);
      } else {
        // Mock data
        setNetworkStats({
          ethereum: {
            gasPrice: Math.floor(Math.random() * 50) + 20,
            blockNumber: 18500000 + Math.floor(Math.random() * 1000),
            status: "operational",
          },
          polygon: {
            gasPrice: Math.floor(Math.random() * 100) + 30,
            blockNumber: 50000000 + Math.floor(Math.random() * 1000),
            status: "operational",
          },
          arbitrum: {
            gasPrice: Math.floor(Math.random() * 5) + 1,
            blockNumber: 150000000 + Math.floor(Math.random() * 1000),
            status: "operational",
          },
        });
      }
    } catch (error) {
      console.error("Error fetching network stats:", error);
    }
  };

  const handleContractAction = async (contractId: string, action: string) => {
    try {
      const response = await fetch(
        `/api/admin/contracts/${contractId}/${action}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Update local state
        setContracts(
          contracts.map((contract) =>
            contract.id === contractId
              ? {
                  ...contract,
                  status: action === "pause" ? "paused" : "active",
                }
              : contract
          )
        );
        alert(`Contract ${action}d successfully`);
      } else {
        alert(`Error ${action}ing contract`);
      }
    } catch (error) {
      console.error(`Error ${action}ing contract:`, error);
      alert(`Error ${action}ing contract`);
    }
  };

  const deployNewContract = async () => {
    if (!newContractAddress) {
      alert("Please enter a contract address");
      return;
    }

    try {
      const response = await fetch("/api/admin/contracts/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: newContractAddress,
          network: selectedNetwork,
        }),
      });

      if (response.ok) {
        setNewContractAddress("");
        fetchContractData();
        alert("Contract deployed successfully");
      } else {
        alert("Error deploying contract");
      }
    } catch (error) {
      console.error("Error deploying contract:", error);
      alert("Error deploying contract");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "paused":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "upgrading":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "error":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getNetworkStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "text-emerald-600";
      case "congested":
        return "text-yellow-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Address copied to clipboard");
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <div className="space-y-8 p-6">
          <h1 className="text-3xl font-bold text-gray-900">Smart Contracts</h1>
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
            <h1 className="text-3xl font-bold text-gray-900">
              Smart Contracts
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor and manage deployed smart contracts across all networks
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              {contracts.length} Active Contracts
            </Badge>
            <Badge
              variant="outline"
              className="bg-emerald-50 text-emerald-700 border-emerald-200"
            >
              Multi-Chain Ready
            </Badge>
          </div>
        </div>

        {/* Network Status */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Activity className="h-6 w-6 text-blue-600" />
              Network Status
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700 border-emerald-200 ml-2"
              >
                LIVE
              </Badge>
            </CardTitle>
            <CardDescription>
              Real-time blockchain network information
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {networkStats &&
                Object.entries(networkStats).map(([network, stats]) => (
                  <div
                    key={network}
                    className="p-4 border border-gray-100 rounded-xl bg-gradient-to-br from-white to-gray-50/50 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 capitalize">
                        {network}
                      </h3>
                      <Badge
                        className={`${getNetworkStatusColor(stats.status)} bg-transparent border-0 p-0`}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Gas Price:</span>
                        <span className="font-medium text-gray-900">
                          {stats.gasPrice} gwei
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Block:</span>
                        <span className="font-medium text-gray-900">
                          {stats.blockNumber.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <span
                          className={`font-medium ${getNetworkStatusColor(stats.status)}`}
                        >
                          {stats.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Contract Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Contracts
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {contracts.length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total TVL</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    $
                    {(
                      contracts.reduce((sum, c) => sum + c.tvl, 0) / 1000000
                    ).toFixed(1)}
                    M
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Transactions
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {contracts
                      .reduce((sum, c) => sum + c.transactions, 0)
                      .toLocaleString()}
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
                  <p className="text-sm font-medium text-gray-600">Gas Used</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {(
                      contracts.reduce((sum, c) => sum + c.gasUsed, 0) / 1000000
                    ).toFixed(1)}
                    M
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-orange-50">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deploy New Contract */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Settings className="h-6 w-6 text-blue-600" />
              Deploy New Contract
            </CardTitle>
            <CardDescription>
              Add a new smart contract to the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Contract address (0x...)"
                  value={newContractAddress}
                  onChange={(e) => setNewContractAddress(e.target.value)}
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <Select
                value={selectedNetwork}
                onValueChange={setSelectedNetwork}
              >
                <SelectTrigger className="w-48 border-gray-200 focus:border-blue-500">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                  <SelectItem value="polygon">Polygon</SelectItem>
                  <SelectItem value="arbitrum">Arbitrum</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={deployNewContract}
                className="bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md transition-all"
              >
                Deploy Contract
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contracts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contracts List */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Database className="h-6 w-6 text-blue-600" />
                Deployed Contracts
              </CardTitle>
              <CardDescription>Click on a contract to manage</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {contracts.map((contract) => (
                <Card
                  key={contract.id}
                  className={`cursor-pointer transition-all hover:shadow-lg border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 ${
                    selectedContract?.id === contract.id
                      ? "ring-2 ring-blue-500 shadow-lg"
                      : ""
                  }`}
                  onClick={() => setSelectedContract(contract)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {contract.name}
                        </h3>
                        <p className="text-xs text-gray-500 font-mono">
                          {contract.address.slice(0, 10)}...
                          {contract.address.slice(-8)}
                        </p>
                      </div>
                      <Badge
                        className={`${getStatusColor(contract.status)} border`}
                      >
                        {contract.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Network:</span>
                        <span className="ml-1 font-medium text-gray-900 capitalize">
                          {contract.blockchain}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Version:</span>
                        <span className="ml-1 font-medium text-gray-900">
                          {contract.version}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">TVL:</span>
                        <span className="ml-1 font-medium text-emerald-600">
                          ${(contract.tvl / 1000000).toFixed(1)}M
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Transactions:</span>
                        <span className="ml-1 font-medium text-gray-900">
                          {contract.transactions}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Contract Details */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Settings className="w-6 h-6 text-emerald-600" />
                Contract Management
              </CardTitle>
              <CardDescription>
                {selectedContract
                  ? "Manage selected contract"
                  : "Select a contract to manage"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {selectedContract ? (
                <div className="space-y-6">
                  {/* Contract Info */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {selectedContract.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded">
                          {selectedContract.address}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            copyToClipboard(selectedContract.address)
                          }
                          className="border-gray-200 hover:bg-gray-50"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-200 hover:bg-gray-50"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Explorer
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Status
                        </label>
                        <div className="mt-1">
                          <Badge
                            className={`${getStatusColor(selectedContract.status)} border`}
                          >
                            {selectedContract.status}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Network
                        </label>
                        <p className="text-gray-900 font-medium capitalize">
                          {selectedContract.blockchain}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Version
                        </label>
                        <p className="text-gray-900 font-medium">
                          {selectedContract.version}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Deployed
                        </label>
                        <p className="text-gray-900 font-medium">
                          {new Date(
                            selectedContract.deployedAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Total Value Locked
                        </label>
                        <p className="text-emerald-600 font-bold">
                          ${selectedContract.tvl.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Gas Used
                        </label>
                        <p className="text-gray-900 font-medium">
                          {selectedContract.gasUsed.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    {selectedContract.status === "active" ? (
                      <Button
                        onClick={() =>
                          handleContractAction(selectedContract.id, "pause")
                        }
                        variant="destructive"
                        className="flex-1 shadow-sm hover:shadow-md transition-all"
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Pause Contract
                      </Button>
                    ) : (
                      <Button
                        onClick={() =>
                          handleContractAction(selectedContract.id, "resume")
                        }
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md transition-all"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Resume Contract
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className="flex-1 border-gray-200 hover:bg-gray-50 shadow-sm hover:shadow-md transition-all"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Upgrade Contract
                    </Button>
                  </div>

                  {/* Contract Logs */}
                  <div>
                    <h4 className="text-gray-900 font-semibold mb-3">
                      Recent Activity
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {[
                        "Asset tokenized: #LA-001",
                        "Fee collected: 0.5 ETH",
                        "User verified: 0x742d...8b8b",
                        "Contract upgraded to v1.2.0",
                      ].map((activity, index) => (
                        <div
                          key={index}
                          className="text-sm text-gray-600 p-3 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg border border-gray-100"
                        >
                          {activity}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Select a contract from the list to manage
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
