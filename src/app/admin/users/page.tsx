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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  AlertTriangle,
  UserCheck,
  UserX,
  Activity,
} from "lucide-react";

interface User {
  id: string;
  wallet_address: string;
  email?: string;
  kyc_status: "pending" | "verified" | "rejected" | "not_submitted";
  created_at: string;
  last_active: string;
  total_assets: number;
  total_value: number;
  is_active: boolean;
  risk_score: number;
  country?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchUsers();
    // Set up real-time updates
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        // Mock data for development
        setUsers([
          {
            id: "1",
            wallet_address: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C8b",
            email: "user1@example.com",
            kyc_status: "verified",
            created_at: "2025-01-10T10:30:00Z",
            last_active: "2025-01-15T14:20:00Z",
            total_assets: 3,
            total_value: 1250000,
            is_active: true,
            risk_score: 2,
            country: "United States",
          },
          {
            id: "2",
            wallet_address: "0x8ba1f109551bD432803012645Hac136c5c8b8b8b",
            email: "investor@company.com",
            kyc_status: "pending",
            created_at: "2025-01-12T09:15:00Z",
            last_active: "2025-01-15T11:45:00Z",
            total_assets: 1,
            total_value: 2500000,
            is_active: true,
            risk_score: 3,
            country: "Canada",
          },
          {
            id: "3",
            wallet_address: "0xa39643CF2F0B78107Ed786c8156C6de492Eec3c",
            kyc_status: "verified",
            created_at: "2025-01-08T16:45:00Z",
            last_active: "2025-01-14T09:30:00Z",
            total_assets: 2,
            total_value: 875000,
            is_active: true,
            risk_score: 1,
            country: "United Kingdom",
          },
          {
            id: "4",
            wallet_address: "0x1234567890123456789012345678901234567890",
            kyc_status: "rejected",
            created_at: "2025-01-05T12:20:00Z",
            last_active: "2025-01-13T15:10:00Z",
            total_assets: 0,
            total_value: 0,
            is_active: false,
            risk_score: 5,
            country: "Unknown",
          },
          {
            id: "5",
            wallet_address: "0x9876543210987654321098765432109876543210",
            kyc_status: "not_submitted",
            created_at: "2025-01-14T08:00:00Z",
            last_active: "2025-01-15T10:15:00Z",
            total_assets: 0,
            total_value: 0,
            is_active: true,
            risk_score: 3,
            country: "Germany",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Update local state
        setUsers(
          users.map((user) =>
            user.id === userId
              ? { ...user, is_active: action === "activate" }
              : user
          )
        );
        alert(`User ${action}d successfully`);
      } else {
        alert(`Error ${action}ing user`);
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      alert(`Error ${action}ing user`);
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "not_submitted":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 2) return "text-green-600";
    if (score <= 3) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.wallet_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.country?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || user.kyc_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getUserCounts = () => {
    return {
      total: users.length,
      verified: users.filter((u) => u.kyc_status === "verified").length,
      pending: users.filter((u) => u.kyc_status === "pending").length,
      rejected: users.filter((u) => u.kyc_status === "rejected").length,
      active: users.filter((u) => u.is_active).length,
    };
  };

  const counts = getUserCounts();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage user accounts and KYC verification
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {counts.total} Total Users
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-600">
                  {counts.total}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-green-600">
                  {counts.verified}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending KYC</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {counts.pending}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {counts.rejected}
                </p>
              </div>
              <UserX className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-purple-600">
                  {counts.active}
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by KYC status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="not_submitted">Not Submitted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Users ({filteredUsers.length})
            </CardTitle>
            <CardDescription>Click on a user to view details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {filteredUsers.map((user) => (
              <Card
                key={user.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedUser?.id === user.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${user.is_active ? "bg-green-500" : "bg-gray-400"}`}
                      />
                      <span className="font-mono text-sm font-medium">
                        {user.wallet_address.slice(0, 6)}...
                        {user.wallet_address.slice(-4)}
                      </span>
                    </div>
                    <Badge className={getKycStatusColor(user.kyc_status)}>
                      {user.kyc_status.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Assets:</span>
                      <span className="ml-1 font-medium">
                        {user.total_assets}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Value:</span>
                      <span className="ml-1 font-medium">
                        ${(user.total_value / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle
                        className={`w-4 h-4 ${getRiskColor(user.risk_score)}`}
                      />
                      <span
                        className={`text-sm font-medium ${getRiskColor(user.risk_score)}`}
                      >
                        Risk: {user.risk_score}/5
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {user.country}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* User Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              User Details
            </CardTitle>
            <CardDescription>
              {selectedUser
                ? "User information and management actions"
                : "Select a user to view details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedUser ? (
              <div className="space-y-6">
                {/* User Info */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Wallet Address
                    </label>
                    <p className="text-gray-900 font-mono text-sm">
                      {selectedUser.wallet_address}
                    </p>
                  </div>

                  {selectedUser.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Email
                      </label>
                      <p className="text-gray-900">{selectedUser.email}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        KYC Status
                      </label>
                      <div className="mt-1">
                        <Badge
                          className={getKycStatusColor(selectedUser.kyc_status)}
                        >
                          {selectedUser.kyc_status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Account Status
                      </label>
                      <div className="mt-1">
                        <Badge
                          className={
                            selectedUser.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {selectedUser.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Total Assets
                      </label>
                      <p className="text-gray-900 font-medium">
                        {selectedUser.total_assets}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Total Value
                      </label>
                      <p className="text-gray-900 font-medium">
                        ${selectedUser.total_value.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Risk Score
                      </label>
                      <p
                        className={`font-medium ${getRiskColor(selectedUser.risk_score)}`}
                      >
                        {selectedUser.risk_score}/5
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Country
                      </label>
                      <p className="text-gray-900 font-medium">
                        {selectedUser.country || "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Joined
                      </label>
                      <p className="text-gray-900">
                        {new Date(selectedUser.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Last Active
                      </label>
                      <p className="text-gray-900">
                        {new Date(
                          selectedUser.last_active
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  {selectedUser.is_active ? (
                    <Button
                      onClick={() =>
                        handleUserAction(selectedUser.id, "deactivate")
                      }
                      variant="destructive"
                      className="flex-1"
                    >
                      <UserX className="w-4 h-4 mr-2" />
                      Deactivate User
                    </Button>
                  ) : (
                    <Button
                      onClick={() =>
                        handleUserAction(selectedUser.id, "activate")
                      }
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Activate User
                    </Button>
                  )}

                  <Button variant="outline" className="flex-1">
                    <Shield className="w-4 h-4 mr-2" />
                    View KYC Documents
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Select a user from the list to view details
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
