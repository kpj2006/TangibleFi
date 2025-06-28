"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../../supabase/client";
import { Button } from "./ui/button";
import {
  BarChart3,
  Wallet,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Sparkles,
  TrendingUp,
  Shield,
  Users,
  Building2,
  Coins,
  Truck,
} from "lucide-react";
import UserProfile from "./user-profile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
  const supabase = createClient();
  const {
    data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.warn("Supabase connection failed in navbar:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  return (
    <>
      {/* Top announcement bar */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="relative flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-semibold">
            🚀 Live: $2.5B+ Assets Tokenized • 12.5% APY Available
          </span>
          <Link
            href="/dashboard"
            className="ml-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium hover:bg-white/30 transition-all duration-300"
          >
            Start Now →
          </Link>
        </div>
      </div>

      <nav className="sticky top-0 z-[100] w-full border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Left: Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center group-hover:scale-105 transition-all duration-300 shadow-md">
                  <span className="text-2xl font-extrabold text-white">Tf</span>
                </div>
              </Link>
            </div>

            {/* Center: Navigation */}
            <div className="hidden lg:flex items-center space-x-12">
              <div className="hidden lg:flex items-center space-x-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 h-10 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Features
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-80 bg-white border border-gray-200 shadow-xl rounded-xl"
                  >
                    <div className="p-4">
                      <div className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        Platform Features
                      </div>
                      <div className="grid gap-3">
                        <DropdownMenuItem asChild>
                          <Link
                            href="#asset-tokenization"
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-blue-50 transition-all duration-300 group"
                          >
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                              <BarChart3 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 text-sm">
                                Asset Tokenization
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Convert real assets to blockchain tokens
                                instantly
                              </div>
                            </div>
                            <div className="text-xs text-blue-600 font-semibold">
                              Live
                            </div>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href="#lending"
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-purple-50 transition-all duration-300 group"
                          >
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                              <Wallet className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 text-sm">
                                DeFi Lending
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Access instant liquidity up to 80% LTV
                              </div>
                            </div>
                            <div className="text-xs text-green-600 font-semibold">
                              12.5% APY
                            </div>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href="#security"
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-emerald-50 transition-all duration-300 group"
                          >
                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                              <Shield className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 text-sm">
                                Security Features
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Advanced security and protection
                              </div>
                            </div>
                            <div className="text-xs text-emerald-600 font-semibold">
                              5 Chains
                            </div>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="my-2" />

                        <DropdownMenuItem asChild>
            <Link
                            href="#analytics"
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-all duration-300"
            >
                            <BarChart3 className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-700">
                              Advanced Analytics
                            </span>
            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
            <Link
                            href="#api"
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-all duration-300"
                          >
                            <Shield className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-700">
                              API Access
                            </span>
                          </Link>
                        </DropdownMenuItem>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 h-10 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300"
            >
                      <Users className="w-4 h-4" />
              Solutions
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-80 bg-white border border-gray-200 shadow-xl rounded-xl"
                  >
                    <div className="p-4">
                      <div className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                        Asset Classes & Use Cases
                      </div>
                      <div className="grid gap-3">
                        <DropdownMenuItem asChild>
                          <Link
                            href="#real-estate"
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-orange-50 transition-all duration-300 group"
                          >
                            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                              <Building2 className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 text-sm">
                                Real Estate
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Commercial & residential property tokenization
                              </div>
                            </div>
                            <div className="text-xs text-orange-600 font-semibold">
                              $2.1B+
                            </div>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href="#commodities"
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-yellow-50 transition-all duration-300 group"
                          >
                            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                              <Coins className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 text-sm">
                                Precious Metals
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Gold, silver, platinum tokenization & trading
                              </div>
                            </div>
                            <div className="text-xs text-yellow-600 font-semibold">
                              $1,987/oz
                            </div>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href="#equipment"
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-emerald-50 transition-all duration-300 group"
                          >
                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                              <Truck className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 text-sm">
                                Industrial Equipment
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Heavy machinery, vehicles & equipment finance
                              </div>
                            </div>
                            <div className="text-xs text-emerald-600 font-semibold">
                              4.5% APR
                            </div>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="my-2" />

                        <div className="text-xs font-semibold text-gray-500 mb-2 px-3">
                          ENTERPRISE SOLUTIONS
                        </div>

                        <DropdownMenuItem asChild>
                          <Link
                            href="#institutional"
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-all duration-300"
                          >
                            <Building2 className="w-4 h-4 text-gray-600" />
                            <div className="flex-1">
                              <span className="text-sm text-gray-700 font-medium">
                                Institutional Partners
                              </span>
                              <div className="text-xs text-gray-500">
                                White-label solutions
                              </div>
                            </div>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href="#portfolio"
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-all duration-300"
                          >
                            <BarChart3 className="w-4 h-4 text-gray-600" />
                            <div className="flex-1">
                              <span className="text-sm text-gray-700 font-medium">
                                Portfolio Management
                              </span>
                              <div className="text-xs text-gray-500">
                                Advanced analytics & reporting
                              </div>
                            </div>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href="#custody"
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-all duration-300"
                          >
                            <Shield className="w-4 h-4 text-gray-600" />
                            <div className="flex-1">
                              <span className="text-sm text-gray-700 font-medium">
                                Secure Custody
                              </span>
                              <div className="text-xs text-gray-500">
                                Bank-grade asset protection
                              </div>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 h-10 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300"
                    >
                      <Shield className="w-4 h-4" />
                      Docs
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-72 bg-white border border-gray-200 shadow-xl rounded-xl"
                  >
                    <div className="p-4">
                      <div className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                        Documentation
                      </div>
                      <div className="grid gap-2">
                        <DropdownMenuItem asChild>
                          <Link
                            href="#getting-started"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-all duration-300"
                          >
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm">
                                Getting Started
                              </div>
                              <div className="text-xs text-gray-500">
                                Quick setup guide
                              </div>
                            </div>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href="#api-reference"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-all duration-300"
                          >
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm">
                                API Reference
                              </div>
                              <div className="text-xs text-gray-500">
                                Complete API documentation
                              </div>
                            </div>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href="#tutorials"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50 transition-all duration-300"
                          >
                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                              <Coins className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm">
                                Tutorials
                              </div>
                              <div className="text-xs text-gray-500">
                                Step-by-step guides
                              </div>
                            </div>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="my-2" />

                        <DropdownMenuItem asChild>
                          <Link
                            href="#sdk"
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-all duration-300"
                          >
                            <Truck className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-700">
                              SDK Downloads
                            </span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href="#changelog"
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-all duration-300"
                          >
                            <Sparkles className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-700">
                              Changelog
                            </span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href="#support"
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-all duration-300"
                          >
                            <Users className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-700">
                              Support Center
                            </span>
                          </Link>
                        </DropdownMenuItem>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 h-10 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300"
                    >
                      <Building2 className="w-4 h-4" />
                      About
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-72 bg-white border border-gray-200 shadow-xl rounded-xl"
                  >
                    <div className="p-4">
                      <div className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-purple-600" />
                        Company
                      </div>
                      <div className="grid gap-2">
                        <DropdownMenuItem asChild>
                          <Link
                            href="#our-story"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-all duration-300"
                          >
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm">
                                Our Story
                              </div>
                              <div className="text-xs text-gray-500">
                                How we started
                              </div>
                            </div>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href="#team"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-all duration-300"
                          >
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Users className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm">
                                Team
                              </div>
                              <div className="text-xs text-gray-500">
                                Meet our experts
                              </div>
                            </div>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href="#careers"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50 transition-all duration-300"
                          >
                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                              <TrendingUp className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm">
                                Careers
                              </div>
                              <div className="text-xs text-gray-500">
                                Join our team
                              </div>
                            </div>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="my-2" />

                        <DropdownMenuItem asChild>
                          <Link
                            href="#press"
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-all duration-300"
                          >
                            <Sparkles className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-700">
                              Press & Media
                            </span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href="#investors"
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-all duration-300"
                          >
                            <TrendingUp className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-700">
                              Investors
                            </span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href="#contact"
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-all duration-300"
                          >
                            <Shield className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-700">
                              Contact Us
                            </span>
            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
            <Link
                            href="#blog"
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-all duration-300"
            >
                            <Coins className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-700">Blog</span>
            </Link>
                        </DropdownMenuItem>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
          </div>
        </div>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              {/* Search - Desktop only */}
              <div className="hidden md:flex">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-64 justify-start text-gray-500 border-gray-300 bg-gray-50 hover:bg-gray-100 transition-all duration-300"
              >
                  <Search className="w-4 h-4 mr-2" />
                  Search docs, features...
                </Button>
              </div>

              {/* User Profile */}
              <UserProfile />

              {/* Right: Auth Buttons */}
              <div className="flex items-center space-x-4">
              <Link
                  href="/wallet-connect"
                  className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-lg border border-orange-200 hover:border-orange-300 transition-all duration-200"
              >
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
              </Link>
              </div>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
        </div>
      </div>
    </nav>
    </>
  );
}
