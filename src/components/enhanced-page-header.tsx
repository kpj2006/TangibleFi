"use client";

import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Zap,
  CheckCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  Activity,
  Shield,
  Globe,
} from "lucide-react";

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: ReactNode;
  badges?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
    icon?: ReactNode;
    className?: string;
  }[];
  actions?: ReactNode;
  breadcrumbs?: {
    label: string;
    href?: string;
  }[];
  lastUpdated?: Date;
  isLoading?: boolean;
  className?: string;
}

export default function EnhancedPageHeader({
  title,
  description,
  icon,
  badges = [],
  actions,
  breadcrumbs,
  lastUpdated,
  isLoading = false,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`${className}`}>
      <div className="px-6 py-8">
        <div className="w-full">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-4">
              {/* Breadcrumbs */}
              {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center space-x-2 text-sm text-gray-500">
                  {breadcrumbs.map((crumb, index) => (
                    <div key={index} className="flex items-center">
                      {index > 0 && <span className="mx-2">/</span>}
                      {crumb.href ? (
                        <a
                          href={crumb.href}
                          className="hover:text-gray-700 transition-colors"
                        >
                          {crumb.label}
                        </a>
                      ) : (
                        <span className="text-gray-900 font-medium">
                          {crumb.label}
                        </span>
                      )}
                    </div>
                  ))}
                </nav>
              )}

              {/* Title Section */}
              <div className="flex items-center gap-4">
                {icon && (
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                )}
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                  {title}
                </h1>
              </div>

              {/* Description */}
              <p className="text-lg text-gray-600 leading-relaxed">
                {description}
              </p>

              {/* Badges and Status */}
              <div className="flex items-center gap-4 pt-2 flex-wrap">
                {badges.map((badge, index) => (
                  <Badge
                    key={index}
                    variant={badge.variant || "outline"}
                    className={`${badge.className || ""} ${
                      badge.variant === "default"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : badge.variant === "outline"
                          ? "text-blue-700 border-blue-200"
                          : ""
                    }`}
                  >
                    {badge.icon && <span className="mr-1">{badge.icon}</span>}
                    {badge.text}
                  </Badge>
                ))}

                {/* Real-time indicator */}
                <Badge
                  variant="outline"
                  className="text-blue-700 border-blue-200"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Real-time
                </Badge>

                {/* Last updated */}
                {lastUpdated && (
                  <Badge variant="outline" className="text-gray-600">
                    <Clock className="h-3 w-3 mr-1" />
                    Updated {lastUpdated.toLocaleTimeString()}
                  </Badge>
                )}

                {/* Loading indicator */}
                {isLoading && (
                  <Badge
                    variant="outline"
                    className="text-orange-600 border-orange-200"
                  >
                    <div className="w-3 h-3 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                    Loading...
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            {actions && (
              <div className="flex items-center gap-3 flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Predefined badge configurations for common use cases
export const commonBadges = {
  active: {
    text: "Active",
    variant: "default" as const,
    icon: <CheckCircle className="h-3 w-3" />,
    className: "bg-green-100 text-green-800 border-green-200",
  },
  verified: {
    text: "Verified",
    variant: "default" as const,
    icon: <CheckCircle className="h-3 w-3" />,
    className: "bg-green-100 text-green-800 border-green-200",
  },
  pending: {
    text: "Pending",
    variant: "outline" as const,
    icon: <Clock className="h-3 w-3" />,
    className: "text-yellow-700 border-yellow-200",
  },
  warning: {
    text: "Warning",
    variant: "outline" as const,
    icon: <AlertTriangle className="h-3 w-3" />,
    className: "text-orange-700 border-orange-200",
  },
  error: {
    text: "Error",
    variant: "destructive" as const,
    icon: <AlertTriangle className="h-3 w-3" />,
  },
  info: {
    text: "Info",
    variant: "outline" as const,
    icon: <Info className="h-3 w-3" />,
    className: "text-blue-700 border-blue-200",
  },
  trending: {
    text: "Trending Up",
    variant: "outline" as const,
    icon: <TrendingUp className="h-3 w-3" />,
    className: "text-emerald-700 border-emerald-200",
  },
  secure: {
    text: "Secure",
    variant: "outline" as const,
    icon: <Shield className="h-3 w-3" />,
    className: "text-blue-700 border-blue-200",
  },
  global: {
    text: "Multi-Chain",
    variant: "outline" as const,
    icon: <Globe className="h-3 w-3" />,
    className: "text-purple-700 border-purple-200",
  },
  live: {
    text: "Live",
    variant: "outline" as const,
    icon: <Activity className="h-3 w-3" />,
    className: "text-red-700 border-red-200",
  },
};
