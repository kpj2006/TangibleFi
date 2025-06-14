"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  Settings,
  FileCheck,
  AlertTriangle,
  DollarSign,
  Zap,
  Users,
  BarChart3,
  Lock,
  Bell,
  Database,
  Home,
  LogOut,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const pathname = usePathname();

  // Get admin wallet addresses from environment variables
  const getAdminWallets = (): string[] => {
    const adminWalletsEnv =
      process.env.ADMIN_WALLETS || process.env.NEXT_PUBLIC_ADMIN_WALLETS;
    if (!adminWalletsEnv) {
      console.warn("No admin wallets configured in environment variables");
      return [];
    }
    return adminWalletsEnv
      .split(",")
      .map((wallet) => wallet.trim().toLowerCase());
  };

  const ADMIN_WALLETS = getAdminWallets();

  useEffect(() => {
    checkAdminAuthentication();
  }, []);

  const checkAdminAuthentication = async () => {
    try {
      // Check if wallet is connected
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (accounts.length > 0) {
          const connectedWallet = accounts[0].toLowerCase();
          setWalletAddress(connectedWallet);

          // Check if connected wallet is an admin wallet
          const isAdmin = ADMIN_WALLETS.some(
            (adminWallet) => adminWallet.toLowerCase() === connectedWallet
          );

          if (isAdmin) {
            setIsAuthenticated(true);
          }
        }
      }
    } catch (error) {
      console.error("Error checking admin authentication:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectAdminWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask is required for admin access");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        const connectedWallet = accounts[0].toLowerCase();
        setWalletAddress(connectedWallet);

        // Check if connected wallet is an admin wallet
        const isAdmin = ADMIN_WALLETS.some(
          (adminWallet) => adminWallet.toLowerCase() === connectedWallet
        );

        if (isAdmin) {
          setIsAuthenticated(true);
        } else {
          alert("This wallet does not have admin privileges");
        }
      }
    } catch (error) {
      console.error("Error connecting admin wallet:", error);
    }
  };

  const adminNavItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: BarChart3,
      description: "Overview and analytics",
    },
    {
      href: "/admin/assets",
      label: "Asset Management",
      icon: FileCheck,
      description: "Review and approve assets",
    },
    {
      href: "/admin/users",
      label: "User Management",
      icon: Users,
      description: "Manage user accounts",
    },
    {
      href: "/admin/contracts",
      label: "Smart Contracts",
      icon: Database,
      description: "Contract settings and monitoring",
    },
    {
      href: "/admin/fees",
      label: "Fee Management",
      icon: DollarSign,
      description: "Configure platform fees",
    },
    {
      href: "/admin/emergency",
      label: "Emergency Controls",
      icon: AlertTriangle,
      description: "Emergency pause and controls",
    },
    {
      href: "/admin/automation",
      label: "Automation",
      icon: Zap,
      description: "Automated processes",
    },
    {
      href: "/admin/settings",
      label: "System Settings",
      icon: Settings,
      description: "Platform configuration",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            Authenticating admin access...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-gray-200 shadow-xl max-w-md rounded-lg p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Admin Authentication Required
            </h1>
            <p className="text-gray-600 mb-6">
              {ADMIN_WALLETS.length === 0
                ? "No admin wallets configured. Please check your environment variables."
                : "Connect an authorized admin wallet to access the control panel"}
            </p>

            {ADMIN_WALLETS.length === 0 ? (
              <Alert className="border-red-200 bg-red-50 mb-4">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  <strong>Configuration Error:</strong> ADMIN_WALLETS or
                  NEXT_PUBLIC_ADMIN_WALLETS environment variable is not set.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <Button
                  onClick={connectAdminWallet}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Connect Admin Wallet
                </Button>

                {walletAddress && (
                  <div className="text-sm text-gray-500">
                    Connected: {walletAddress.slice(0, 6)}...
                    {walletAddress.slice(-4)}
                    <br />
                    <span className="text-red-600">
                      Not authorized for admin access
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">
                  TangibleFi Admin
                </span>
              </Link>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                Live System
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Admin: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </div>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Main App
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Admin Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-2">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div>
                    <div>{item.label}</div>
                    <div className="text-xs text-gray-500">
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
