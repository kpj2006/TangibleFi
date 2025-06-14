"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Shield,
  TrendingUp,
  Activity,
  Calendar,
  Wallet,
  DollarSign,
  Building2,
} from "lucide-react";

interface UserManagementSectionProps {
  onBack: () => void;
}

export default function UserManagementSection({
  onBack,
}: UserManagementSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage user accounts, permissions, and analytics
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">2,384</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Active Today
                </p>
                <p className="text-3xl font-bold text-gray-900">892</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  New This Month
                </p>
                <p className="text-3xl font-bold text-gray-900">127</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Premium Users
                </p>
                <p className="text-3xl font-bold text-gray-900">156</p>
              </div>
              <Shield className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by wallet address, name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="new">New Users</option>
              <option value="premium">Premium</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* User List */}
          <div className="space-y-4">
            {/* Mock user data */}
            {[
              {
                id: 1,
                wallet: "0x742d35cc6cbf4532b4661e5f5e2c2d1b5a8f1234",
                name: "John Doe",
                email: "john@example.com",
                joinDate: "2025-01-15",
                status: "active",
                totalValue: "$125,000",
                assetsCount: 3,
                lastActivity: "2 hours ago",
              },
              {
                id: 2,
                wallet: "0x1234567890abcdef1234567890abcdef12345678",
                name: "Alice Smith",
                email: "alice@example.com",
                joinDate: "2025-01-10",
                status: "premium",
                totalValue: "$850,000",
                assetsCount: 7,
                lastActivity: "1 hour ago",
              },
              {
                id: 3,
                wallet: "0xabcdef1234567890abcdef1234567890abcdef12",
                name: "Bob Johnson",
                email: "bob@example.com",
                joinDate: "2025-01-12",
                status: "active",
                totalValue: "$45,000",
                assetsCount: 1,
                lastActivity: "5 minutes ago",
              },
            ].map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{user.name}</h4>
                    <p className="text-sm text-gray-500 font-mono">
                      {user.wallet.slice(0, 6)}...{user.wallet.slice(-4)}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">
                      {user.totalValue}
                    </p>
                    <p className="text-xs text-gray-500">Total Value</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">
                      {user.assetsCount}
                    </p>
                    <p className="text-xs text-gray-500">Assets</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">
                      {user.lastActivity}
                    </p>
                    <p className="text-xs text-gray-500">Last Active</p>
                  </div>
                  <Badge
                    className={
                      user.status === "premium"
                        ? "bg-yellow-100 text-yellow-700 border-0"
                        : user.status === "active"
                          ? "bg-green-100 text-green-700 border-0"
                          : "bg-gray-100 text-gray-700 border-0"
                    }
                  >
                    {user.status}
                  </Badge>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
