"use client";

import Link from "next/link";
import { createClient } from "../../supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  UserCircle,
  BarChart3,
  FileCheck,
  Landmark,
  Coins,
  Wallet,
  Settings,
  LogOut,
  Bell,
  Search,
  Plus,
  Menu,
  Home,
  HelpCircle,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  TrendingUp,
  Activity,
  DollarSign,
  ChevronDown,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";

const navigationItems = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: BarChart3,
    exact: true,
  },
  {
    name: "Assets",
    href: "/dashboard/assets",
    icon: FileCheck,
    badge: "12",
    badgeColor: "bg-blue-500",
    badgeLabel: "Active NFTs",
  },
  {
    name: "Loans",
    href: "/dashboard/loans",
    icon: Landmark,
    badge: "5",
    badgeColor: "bg-orange-500",
    badgeLabel: "Active Loans",
  },
  {
    name: "Payments",
    href: "/dashboard/payments",
    icon: Coins,
    badge: "3",
    badgeColor: "bg-emerald-500",
    badgeLabel: "Due Soon",
  },
];

interface Notification {
  id: string;
  type:
    | "payment_due"
    | "asset_verified"
    | "loan_approved"
    | "price_alert"
    | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: "low" | "medium" | "high";
}

export default function DashboardNavbar() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    // Get user data
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Fetch user's notifications
        await fetchNotifications(user.id);
      }
    };

    getUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchNotifications(session.user.id);
      } else {
        setUser(null);
        setNotifications([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchNotifications = async (userId: string) => {
    // Mock notifications - in a real app, these would come from your database
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "payment_due",
        title: "EMI Payment Due Soon",
        message: `Your loan payment of ${formatCurrency(2500)} is due in 3 days`,
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        read: false,
        priority: "high",
      },
      {
        id: "2",
        type: "asset_verified",
        title: "Asset NFT Verified",
        message: `Your Downtown Office Building (${formatCurrency(850000)}) has been successfully verified and minted`,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        read: false,
        priority: "medium",
      },
      {
        id: "3",
        type: "price_alert",
        title: "Portfolio Alert",
        message: `ETH price increased +5.2% - Portfolio value up ${formatCurrency(45200)}`,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
        read: true,
        priority: "low",
      },
      {
        id: "4",
        type: "loan_approved",
        title: "USDC Loan Approved",
        message: `Your ${formatCurrency(400000)} stablecoin loan has been approved at 4.2% APR`,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        read: false,
        priority: "high",
      },
      {
        id: "5",
        type: "system",
        title: "Platform Update",
        message: `Platform improvements: Enhanced performance and ${formatNumber(150)} new assets supported`,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        read: true,
        priority: "low",
      },
    ];

    setNotifications(mockNotifications);
  };

  const isActive = (href: string, exact = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/dashboard?search=${encodeURIComponent(searchQuery.trim())}`
      );
      setIsSearchOpen(false);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "payment_due":
        return <Clock className="h-4 w-4 text-orange-600" />;
      case "asset_verified":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "loan_approved":
        return <DollarSign className="h-4 w-4 text-blue-600" />;
      case "price_alert":
        return <TrendingUp className="h-4 w-4 text-purple-600" />;
      case "system":
        return <Activity className="h-4 w-4 text-gray-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatNotificationTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const highPriorityUnread = notifications.filter(
    (n) => !n.read && n.priority === "high"
  ).length;

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(" ")[0];
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "User";
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.slice(0, 1).toUpperCase();
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  // Mock portfolio data - in real app, this would come from your database
  const portfolioMetrics = {
    totalValue: 2847500, // $2.84M
    activeAssets: 12,
    activeLoans: 5,
    healthRatio: 3.47,
    monthlyReturn: 8.2,
  };

  return (
    <nav className="sticky top-0 z-[100] w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform shadow-md ring-1 ring-inset ring-white/20">
                <span className="text-2xl font-extrabold text-white">Tf</span>
              </div>
            </Link>
          </div>

          {/* Center: Navigation */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 shadow-sm">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                    {item.badge && (
                      <div
                        className={cn(
                          "h-5 px-2 rounded-full text-xs font-bold text-white flex items-center justify-center shadow-sm",
                          item.badgeColor || "bg-gray-500",
                          "transition-all duration-200 hover:scale-110"
                        )}
                        title={item.badgeLabel}
                      >
                        {item.badge}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Enhanced Search */}
            <div className="relative">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search portfolio..."
                    className="pl-10 pr-4 w-48 lg:w-64 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hidden lg:block"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchOpen(true)}
                    onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                  />
                </div>
              </form>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className="w-4 h-4" />
              </Button>

              {/* Search suggestions dropdown */}
              {isSearchOpen && searchQuery && (
                <div className="absolute top-full mt-2 w-full lg:w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-700">
                      Search suggestions
                    </p>
                  </div>
                  <div className="py-2">
                    <Link
                      href={`/dashboard/assets?search=${searchQuery}`}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <FileCheck className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Search in Assets</span>
                    </Link>
                    <Link
                      href={`/dashboard/loans?search=${searchQuery}`}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <Landmark className="h-4 w-4 text-orange-600" />
                      <span className="text-sm">Search in Loans</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Add Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="z-[9999] w-56 shadow-lg border-0 bg-white"
              >
                <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Quick Actions
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link
                    href="/dashboard/assets/new"
                    className="flex items-center gap-3 p-3"
                  >
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <FileCheck className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Mint Asset NFT
                      </p>
                      <p className="text-xs text-gray-500">
                        Convert real-world assets to NFTs
                      </p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link
                    href="/dashboard/loans/new"
                    className="flex items-center gap-3 p-3"
                  >
                    <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                      <Landmark className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Borrow Stablecoins
                      </p>
                      <p className="text-xs text-gray-500">
                        Use NFTs as collateral for USDC loans
                      </p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link
                    href="/dashboard/payments"
                    className="flex items-center gap-3 p-3"
                  >
                    <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                      <Coins className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Setup Auto-EMI
                      </p>
                      <p className="text-xs text-gray-500">
                        Automated stablecoin repayments
                      </p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Enhanced Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-gray-50 group"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 flex items-center justify-center">
                      {/* Main notification badge */}
                      <div
                        className={cn(
                          "relative w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg",
                          highPriorityUnread > 0
                            ? "bg-gradient-to-r from-red-500 to-red-600 shadow-red-200"
                            : "bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-200"
                        )}
                        title={`${unreadCount} unread notifications${highPriorityUnread > 0 ? ` (${highPriorityUnread} high priority)` : ""}`}
                      >
                        {unreadCount > 99
                          ? "99+"
                          : unreadCount > 9
                            ? "9+"
                            : unreadCount}
                      </div>

                      {/* High priority indicator */}
                      {highPriorityUnread > 0 && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white shadow-sm">
                          <div className="w-full h-full bg-yellow-300 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="z-[9999] w-80 shadow-lg border-0 bg-white max-h-96 overflow-y-auto"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                          {unreadCount} new
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* {highPriorityUnread > 0 && (
                      <div className="flex items-center gap-1 bg-red-100 px-2 py-1 rounded-full">
                        <AlertTriangle className="h-3 w-3 text-red-600" />
                        <span className="text-xs font-bold text-red-600">
                          {highPriorityUnread} urgent
                        </span>
                      </div>
                    )} */}
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100 px-2 py-1"
                        onClick={markAllAsRead}
                      >
                        Mark all read
                      </Button>
                    )}
                  </div>
                </div>

                {notifications.length > 0 ? (
                  <div className="py-1">
                    {notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 mx-1 my-1 rounded-r-md",
                          notification.read
                            ? "border-l-transparent"
                            : notification.priority === "high"
                              ? "border-l-red-500 bg-red-50/30"
                              : notification.priority === "medium"
                                ? "border-l-yellow-500 bg-yellow-50/30"
                                : "border-l-blue-500 bg-blue-50/30"
                        )}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between">
                              <p
                                className={cn(
                                  "text-sm font-medium truncate",
                                  notification.read
                                    ? "text-gray-600"
                                    : "text-gray-900"
                                )}
                              >
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-3" />
                              )}
                            </div>
                            <p
                              className={cn(
                                "text-sm leading-relaxed",
                                notification.read
                                  ? "text-gray-500"
                                  : "text-gray-700"
                              )}
                            >
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {formatNotificationTime(notification.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {notifications.length > 5 && (
                      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-2"
                        >
                          View all notifications
                          <ArrowUpRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <Bell className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      No notifications yet
                    </p>
                    <p className="text-xs text-gray-500">
                      We'll notify you when something important happens
                    </p>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Enhanced User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg group"
                >
                  {/* User Avatar with Active Status */}
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white text-sm font-bold">
                        {getUserInitials()}
                      </span>
                    </div>
                    {/* Active Status Indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm">
                      <div className="w-full h-full bg-emerald-400 rounded-full"></div>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-semibold text-gray-900 leading-tight">
                      {getUserDisplayName()}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      <span className="text-xs text-emerald-600 font-medium">
                        Active now
                      </span>
                    </div>
                  </div>

                  {/* Dropdown Arrow */}
                  <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="z-[9999] w-80 shadow-lg border-0 bg-white"
              >
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">
                      {getUserDisplayName()}
                    </span>
                    <span className="text-xs text-gray-500 font-normal">
                      {user?.email || "user@example.com"}
                    </span>
                  </div>
                </DropdownMenuLabel>

                {/* Portfolio Summary */}
                <div className="px-2 py-3 border-b border-gray-100">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Portfolio Value
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(portfolioMetrics.totalValue)}
                        </span>
                        <div className="flex items-center gap-1 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                          <TrendingUp className="h-3 w-3 text-emerald-600" />
                          <span className="text-xs font-bold text-emerald-600">
                            +{portfolioMetrics.monthlyReturn}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-white/70 rounded-md p-2">
                        <div className="text-lg font-bold text-blue-600">
                          {portfolioMetrics.activeAssets}
                        </div>
                        <div className="text-xs text-gray-600">NFTs</div>
                      </div>
                      <div className="bg-white/70 rounded-md p-2">
                        <div className="text-lg font-bold text-orange-600">
                          {portfolioMetrics.activeLoans}
                        </div>
                        <div className="text-xs text-gray-600">Loans</div>
                      </div>
                      <div className="bg-white/70 rounded-md p-2">
                        <div className="text-lg font-bold text-emerald-600">
                          {portfolioMetrics.healthRatio}
                        </div>
                        <div className="text-xs text-gray-600">Health</div>
                      </div>
                    </div>
                  </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 p-2"
                  >
                    <UserCircle className="w-4 h-4 text-gray-600" />
                    <span>Profile & Settings</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link
                    href="/dashboard/security"
                    className="flex items-center gap-3 p-2"
                  >
                    <Shield className="w-4 h-4 text-gray-600" />
                    <span>Security</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/help" className="flex items-center gap-3 p-2">
                    <HelpCircle className="w-4 h-4 text-gray-600" />
                    <span>Help & Support</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/" className="flex items-center gap-3 p-2">
                    <Home className="w-4 h-4 text-gray-600" />
                    <span>Back to Home</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-600 cursor-pointer flex items-center gap-3 p-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
