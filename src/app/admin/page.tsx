"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Users,
  FileCheck,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
} from "lucide-react";

interface DashboardStats {
  totalAssets: number;
  pendingApprovals: number;
  totalUsers: number;
  totalValue: number;
  monthlyGrowth: number;
  activeContracts: number;
  emergencyStatus: boolean;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAssets: 0,
    pendingApprovals: 0,
    totalUsers: 0,
    totalValue: 0,
    monthlyGrowth: 0,
    activeContracts: 0,
    emergencyStatus: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // Set up real-time updates
    const interval = setInterval(fetchDashboardData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch real-time data from your API endpoints
      const [assetsRes, usersRes, contractsRes] = await Promise.all([
        fetch("/api/admin/assets/stats"),
        fetch("/api/admin/users/stats"),
        fetch("/api/admin/contracts/stats"),
      ]);

      // For now, using mock data until APIs are implemented
      setStats({
        totalAssets: 156,
        pendingApprovals: 12,
        totalUsers: 1247,
        totalValue: 45600000,
        monthlyGrowth: 12.5,
        activeContracts: 8,
        emergencyStatus: false,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const dashboardCards = [
    {
      title: "Total Assets",
      value: stats.totalAssets.toLocaleString(),
      icon: FileCheck,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Tokenized assets on platform",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals.toString(),
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      description: "Assets awaiting review",
    },
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Registered platform users",
    },
    {
      title: "Total Value Locked",
      value: `$${(stats.totalValue / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: "Total asset value",
    },
    {
      title: "Monthly Growth",
      value: `+${stats.monthlyGrowth}%`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      description: "Platform growth rate",
    },
    {
      title: "Active Contracts",
      value: stats.activeContracts.toString(),
      icon: Activity,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      description: "Smart contracts deployed",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="animate-pulse bg-gray-200 h-6 w-32 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-32 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Real-time platform overview and system status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={stats.emergencyStatus ? "destructive" : "secondary"}
            className={
              stats.emergencyStatus
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }
          >
            {stats.emergencyStatus ? (
              <>
                <AlertTriangle className="w-3 h-3 mr-1" />
                Emergency Mode
              </>
            ) : (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                System Normal
              </>
            )}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Last updated: {new Date().toLocaleTimeString()}
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {card.value}
                </div>
                <p className="text-xs text-gray-500 mt-1">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  action: "Asset Approved",
                  details: "Luxury Apartment #LA-001",
                  time: "2 minutes ago",
                  status: "success",
                },
                {
                  action: "New User Registration",
                  details: "0x742d...8b8b",
                  time: "5 minutes ago",
                  status: "info",
                },
                {
                  action: "Asset Submitted",
                  details: "Commercial Property #CP-045",
                  time: "12 minutes ago",
                  status: "pending",
                },
                {
                  action: "Fee Updated",
                  details: "Platform fee changed to 2.5%",
                  time: "1 hour ago",
                  status: "warning",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.status === "success"
                          ? "bg-green-500"
                          : activity.status === "warning"
                            ? "bg-yellow-500"
                            : activity.status === "pending"
                              ? "bg-orange-500"
                              : "bg-blue-500"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.details}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              System Alerts
            </CardTitle>
            <CardDescription>Important system notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.pendingApprovals > 10 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">
                      High Pending Approvals
                    </span>
                  </div>
                  <p className="text-xs text-orange-700 mt-1">
                    {stats.pendingApprovals} assets awaiting approval
                  </p>
                </div>
              )}

              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    All Systems Operational
                  </span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Smart contracts functioning normally
                </p>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Growth Milestone
                  </span>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  Platform reached $45M+ in total value locked
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
