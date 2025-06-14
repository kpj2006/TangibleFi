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
  Globe,
  Wallet,
  Settings,
  LogOut,
  Bell,
  Search,
  Plus,
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
  CreditCard,
  Zap,
  Award,
  Star,
  Target,
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
  {
    name: "Cross-Chain",
    href: "/dashboard/cross-chain",
    icon: Globe,
    badge: "8",
    badgeColor: "bg-purple-500",
    badgeLabel: "Networks",
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

interface UserCredit {
  available: number;
  total: number;
  used: number;
  level: "Bronze" | "Silver" | "Gold" | "Platinum";
  nextTierAmount: number;
}

export default function DashboardSidebar() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userCredit, setUserCredit] = useState<UserCredit | null>(null);
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
        // Fetch user's notifications and credit info
        await fetchNotifications(user.id);
        await fetchUserCredit(user.id);
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
        await fetchUserCredit(session.user.id);
      } else {
        setUser(null);
        setNotifications([]);
        setUserCredit(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchNotifications = async (userId: string) => {
    // Real notifications would be fetched from your database here
    // For now, we'll start with an empty array
    const notifications: Notification[] = [];
    setNotifications(notifications);
  };

  const fetchUserCredit = async (userId: string) => {
    // Real credit data would be fetched from your database here
    // Starting with basic credit profile
    const userCredit: UserCredit = {
      available: 0,
      total: 0,
      used: 0,
      level: "Bronze",
      nextTierAmount: 10000, // Amount needed to reach Silver
    };

    setUserCredit(userCredit);
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

  const getCreditLevelColor = (level: string) => {
    switch (level) {
      case "Bronze":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "Silver":
        return "text-gray-600 bg-gray-50 border-gray-200";
      case "Gold":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "Platinum":
        return "text-purple-600 bg-purple-50 border-purple-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getCreditUsagePercentage = () => {
    if (!userCredit) return 0;
    return (userCredit.used / userCredit.total) * 100;
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg flex flex-col z-50">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform shadow-md ring-1 ring-inset ring-white/20">
            <span className="text-xl font-extrabold text-white">Tf</span>
          </div>
          <span className="text-xl font-bold text-gray-900">TangibleFi</span>
        </Link>
      </div>

      {/* Search Section */}
      <div className="p-4 border-b border-gray-200">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search portfolio..."
              className="pl-10 pr-4 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  active
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <div
                    className={cn(
                      "h-5 px-2 rounded-full text-xs font-bold text-white flex items-center justify-center shadow-sm",
                      item.badgeColor || "bg-gray-500"
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
      </nav>

      {/* User Section with Credit */}
      <div className="border-t border-gray-200 p-4 space-y-4">
        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg group"
            >
              {/* User Avatar */}
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-md">
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
              <div className="flex-1 flex flex-col items-start">
                <span className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">
                  {getUserDisplayName()}
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span className="text-xs text-emerald-600 font-medium">
                    Active
                  </span>
                </div>
              </div>

              {/* Dropdown Arrow */}
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="z-[9999] w-72 shadow-lg border-0 bg-white"
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

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full relative justify-start"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="z-[9999] w-80 shadow-lg border-0 bg-white max-h-96 overflow-y-auto"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-blue-600 hover:text-blue-700"
                    onClick={markAllAsRead}
                  >
                    Mark all read
                  </Button>
                )}
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

          {/* Add Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Quick Add
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="z-[9999] w-56 shadow-lg border-0 bg-white"
            >
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link
                  href="/dashboard/assets/new"
                  className="flex items-center gap-3 p-3"
                >
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FileCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Mint Asset NFT</p>
                    <p className="text-xs text-gray-500">
                      Convert real-world assets
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
                      Use NFTs as collateral
                    </p>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
