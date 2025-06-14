"use client";

import Link from "next/link";
import { createClient } from "../../supabase/client";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import {
  useState,
  useEffect,
  createContext,
  useContext,
  memo,
  useMemo,
  lazy,
  useCallback,
} from "react";
import { User } from "@supabase/supabase-js";
import { useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import icons to reduce initial bundle size
const Icons = {
  Home: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.Home })),
    { ssr: false }
  ),
  Building2: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.Building2 })),
    { ssr: false }
  ),
  CreditCard: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.CreditCard })),
    { ssr: false }
  ),
  PieChart: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.PieChart })),
    { ssr: false }
  ),
  Settings: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.Settings })),
    { ssr: false }
  ),
  TrendingUp: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.TrendingUp })),
    { ssr: false }
  ),
  Shield: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.Shield })),
    { ssr: false }
  ),
  Users: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.Users })),
    { ssr: false }
  ),
  ChevronLeft: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.ChevronLeft })),
    { ssr: false }
  ),
  ChevronRight: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.ChevronRight })),
    { ssr: false }
  ),
  Wallet: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.Wallet })),
    { ssr: false }
  ),
  Activity: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.Activity })),
    { ssr: false }
  ),
  DollarSign: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.DollarSign })),
    { ssr: false }
  ),
  BarChart3: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.BarChart3 })),
    { ssr: false }
  ),
  Clock: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.Clock })),
    { ssr: false }
  ),
  UserCircle: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.UserCircle })),
    { ssr: false }
  ),
  BookOpen: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.BookOpen })),
    { ssr: false }
  ),
  Github: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.Github })),
    { ssr: false }
  ),
  HelpCircle: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.HelpCircle })),
    { ssr: false }
  ),
  Star: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.Star })),
    { ssr: false }
  ),
  Zap: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.Zap })),
    { ssr: false }
  ),
  Target: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.Target })),
    { ssr: false }
  ),
  Database: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.Database })),
    { ssr: false }
  ),
  Smartphone: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.Smartphone })),
    { ssr: false }
  ),
  ArrowLeftRight: dynamic(
    () =>
      import("lucide-react").then((mod) => ({ default: mod.ArrowLeftRight })),
    { ssr: false }
  ),
  User: dynamic(
    () => import("lucide-react").then((mod) => ({ default: mod.User })),
    { ssr: false }
  ),
};

// Dynamically import Card components
const Card = dynamic(
  () => import("@/components/ui/card").then((mod) => ({ default: mod.Card })),
  { ssr: false }
);
const CardContent = dynamic(
  () =>
    import("@/components/ui/card").then((mod) => ({
      default: mod.CardContent,
    })),
  { ssr: false }
);

// Context for sidebar state
const SidebarContext = createContext<{
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobile: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({
  isCollapsed: false,
  setIsCollapsed: () => {},
  isMobile: false,
  isOpen: false,
  setIsOpen: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: keyof typeof Icons;
  badge?: string;
  badgeColor?: string;
  category?: string;
}

// Static sidebar items data
const sidebarItems: SidebarItem[] = [
  // Main Navigation
  {
    id: "dashboard",
    label: "My Dashboard",
    href: "/dashboard",
    icon: "Home",
    category: "main",
  },
  {
    id: "assets",
    label: "My Assets",
    href: "/dashboard/assets",
    icon: "Building2",
    badge: "New",
    badgeColor: "bg-blue-500",
    category: "main",
  },
  {
    id: "loans",
    label: "Borrow StableCoin",
    href: "/dashboard/loans",
    icon: "CreditCard",
    badge: "4.25%",
    badgeColor: "bg-green-500",
    category: "main",
  },
  {
    id: "payments",
    label: "EMI Status",
    href: "/dashboard/payments",
    icon: "DollarSign",
    category: "main",
  },
  {
    id: "cross-chain",
    label: "Cross-Chain Bridge",
    href: "/dashboard/cross-chain",
    icon: "ArrowLeftRight",
    badge: "5 Chains",
    badgeColor: "bg-purple-500",
    category: "main",
  },

  // Portfolio & Analytics
  {
    id: "portfolio",
    label: "Portfolio Overview",
    href: "/dashboard/portfolio",
    icon: "PieChart",
    category: "portfolio",
  },
  {
    id: "analytics",
    label: "Market Status",
    href: "/dashboard/market",
    icon: "TrendingUp",
    badge: "Live",
    badgeColor: "bg-red-500",
    category: "portfolio",
  },
  {
    id: "transactions",
    label: "Transaction History",
    href: "/dashboard/transactions",
    icon: "Activity",
    category: "portfolio",
  },
  {
    id: "performance",
    label: "Performance Metrics",
    href: "/dashboard/performance",
    icon: "BarChart3",
    category: "portfolio",
  },

  // Account & Profile
  {
    id: "profile",
    label: "Profile",
    href: "/dashboard/profile",
    icon: "User",
    category: "account",
  },
  {
    id: "kyc",
    label: "KYC Verification",
    href: "/dashboard/kyc",
    icon: "Shield",
    category: "account",
  },

  // Tools & Services
  {
    id: "tokenize",
    label: "Tokenize your RWA",
    href: "/dashboard/assets/new",
    icon: "Zap",
    badge: "Hot",
    badgeColor: "bg-yellow-500",
    category: "tools",
  },
  {
    id: "calculator",
    label: "Loan Calculator",
    href: "/dashboard/calculator",
    icon: "Target",
    category: "tools",
  },
  {
    id: "scheduler",
    label: "Payment Scheduler",
    href: "/dashboard/scheduler",
    icon: "Clock",
    category: "tools",
  },
  {
    id: "api",
    label: "API Access",
    href: "/dashboard/api",
    icon: "Database",
    badge: "Dev",
    badgeColor: "bg-indigo-500",
    category: "tools",
  },

  // Resources & Support
  {
    id: "documentation",
    label: "Documentation",
    href: "/docs",
    icon: "BookOpen",
    category: "support",
  },
  {
    id: "community",
    label: "Community",
    href: "/community",
    icon: "Users",
    category: "support",
  },
  {
    id: "support",
    label: "Help & Support",
    href: "/support",
    icon: "HelpCircle",
    category: "support",
  },
  {
    id: "github",
    label: "Github",
    href: "https://github.com/AmrendraTheCoder/TengibleFi",
    icon: "Github",
    category: "support",
  },

  // Settings & Admin
  {
    id: "settings",
    label: "Settings",
    href: "/dashboard/settings",
    icon: "Settings",
    category: "admin",
  },
  {
    id: "mobile",
    label: "Mobile App",
    href: "/mobile",
    icon: "Smartphone",
    badge: "Soon",
    badgeColor: "bg-gray-500",
    category: "admin",
  },
];

const categoryLabels = {
  main: "Main",
  portfolio: "Portfolio",
  account: "Account",
  tools: "Tools",
  support: "Support",
  admin: "Settings",
} as const;

interface SidebarProviderProps {
  children: React.ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Auto-collapse on mobile
      if (mobile) {
        setIsCollapsed(true);
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle escape key to close mobile sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobile && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobile, isOpen]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobile, isOpen]);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed,
        isMobile,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

// Memoized sidebar component
const EnhancedSidebar = memo(function EnhancedSidebar() {
  const { isCollapsed, setIsCollapsed, isMobile, isOpen, setIsOpen } =
    useSidebar();
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Move useMemo before any potential early returns to maintain hooks order
  const groupedItems = useMemo(() => {
    return Object.entries(categoryLabels).map(([category, label]) => ({
      category,
      label,
      items: sidebarItems.filter((item) => item.category === category),
    }));
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await createClient().auth.getUser();
      setUser(user);
    };

    getUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = createClient().auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [createClient().auth]);

  // Prevent hydration issues
  if (!mounted) {
    return (
      <aside className="bg-white border-r border-gray-200 w-16 lg:w-64 flex flex-col fixed left-0 top-0 h-full z-40 shadow-lg">
        <div className="p-4 border-b border-gray-200 flex items-center justify-center lg:justify-between">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-xl font-extrabold text-white">Tf</span>
          </div>
        </div>
        <div className="flex-1"></div>
      </aside>
    );
  }

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
    return name.slice(0, 2).toUpperCase();
  };

  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleToggle = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const handleOverlayClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={handleOverlayClick}
        />
      )}

      {/* Mobile Toggle Button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className="fixed top-4 left-4 z-50 md:hidden bg-white shadow-lg border border-gray-200 hover:bg-gray-50"
        >
          <Icons.ChevronRight
            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </Button>
      )}

      <aside
        className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
          isMobile
            ? `fixed left-0 top-0 h-full z-40 shadow-xl ${isOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full"}`
            : `fixed left-0 top-0 h-full z-40 shadow-lg ${isCollapsed ? "w-16" : "w-64"}`
        } flex flex-col`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b border-gray-200 flex items-center ${
            isCollapsed && !isMobile ? "justify-center" : "justify-between"
          }`}
        >
          {!isCollapsed || isMobile ? (
            <>
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center group-hover:scale-105 transition-all duration-300 shadow-lg">
                  <span className="text-xl font-extrabold text-white">Tf</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    TangibleFi
                  </h1>
                  <p className="text-xs text-gray-500">Real World Assets</p>
                </div>
              </Link>

              {/* Toggle Button - Only when expanded or mobile */}
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggle}
                  className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-all duration-300"
                >
                  <Icons.ChevronLeft className="h-4 w-4 text-gray-600" />
                </Button>
              )}
            </>
          ) : (
            /* Toggle Button replaces logo when collapsed on desktop */
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggle}
              className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
            >
              <Icons.ChevronRight className="h-5 w-5 text-white" />
            </Button>
          )}
        </div>

        {/* User Profile Section - Only when expanded */}
        {(!isCollapsed || isMobile) && user && (
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-bold">
                    {getUserInitials()}
                  </span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {getUserDisplayName()}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span className="text-xs text-emerald-600 font-medium">
                    Active
                  </span>
                </div>
                {/* Wallet Address - if connected */}
                {user?.user_metadata?.wallet_address && (
                  <div className="text-xs text-gray-500 font-mono">
                    {truncateAddress(user.user_metadata.wallet_address)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 sidebar-scroll">
          <div className="space-y-6">
            {groupedItems.map(({ category, label, items }) => (
              <div key={category}>
                {(!isCollapsed || isMobile) && (
                  <div className="px-3 mb-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {label}
                    </h3>
                  </div>
                )}

                <div className="space-y-1">
                  {items.map((item) => (
                    <SidebarItemComponent
                      key={item.id}
                      item={item}
                      isCollapsed={isCollapsed && !isMobile}
                      pathname={pathname}
                      onClick={() => {
                        if (isMobile) {
                          setIsOpen(false);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div
          className={`border-t border-gray-200 p-4 ${isCollapsed && !isMobile ? "px-2" : "px-4"}`}
        >
          {!isCollapsed || isMobile ? (
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">TangibleFi v2.0</p>
              <div className="flex justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 font-medium">
                  All Systems Operational
                </span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
});

// Memoized sidebar item component
const SidebarItemComponent = memo(function SidebarItemComponent({
  item,
  isCollapsed,
  pathname,
  onClick,
}: {
  item: SidebarItem;
  isCollapsed: boolean;
  pathname: string;
  onClick: () => void;
}) {
  const isActive = pathname === item.href;
  const isExternal = item.href.startsWith("http");

  const IconComponent = Icons[item.icon];

  const className = `group relative flex items-center w-full px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
    isActive
      ? "bg-blue-50 border border-blue-200 text-blue-600 shadow-sm"
      : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
  } ${isCollapsed ? "justify-center" : "justify-start"}`;

  const content = (
    <>
      <div
        className={`flex items-center ${isCollapsed ? "justify-center" : "justify-start"} w-full`}
      >
        <IconComponent
          className={`h-5 w-5 ${
            isActive
              ? "text-blue-600"
              : "text-gray-600 group-hover:text-blue-600"
          } transition-colors flex-shrink-0`}
        />

        {!isCollapsed && (
          <>
            <span
              className={`ml-3 font-medium ${
                isActive
                  ? "text-blue-600"
                  : "text-gray-700 group-hover:text-blue-600"
              } transition-colors truncate`}
            >
              {item.label}
            </span>

            {item.badge && (
              <Badge
                className={`ml-auto text-xs ${item.badgeColor} text-white border-0 flex-shrink-0`}
              >
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </div>

      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {item.label}
          {item.badge && (
            <span
              className={`ml-2 px-1.5 py-0.5 rounded text-xs ${item.badgeColor} text-white`}
            >
              {item.badge}
            </span>
          )}
        </div>
      )}
    </>
  );

  if (isExternal) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        title={isCollapsed ? item.label : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      className={className}
      title={isCollapsed ? item.label : undefined}
      onClick={onClick}
    >
      {content}
    </Link>
  );
});

export default EnhancedSidebar;
