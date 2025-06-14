"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../../supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  TrendingUp,
  Calendar,
  DollarSign,
  Shield,
  Zap,
  Activity,
  CheckCircle,
  AlertTriangle,
  Info,
  Plus,
  ArrowUpRight,
  History,
  Target,
  Award,
  Clock,
  XCircle,
  TrendingDown,
  Star,
  Wallet,
  Building,
  Percent,
  BarChart3,
  Bell,
} from "lucide-react";
import { User } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";

interface UserCredit {
  available: number;
  total: number;
  used: number;
  level: "Bronze" | "Silver" | "Gold" | "Platinum";
  nextTierAmount: number;
  monthlySpent: number;
  paymentHistory: "Excellent" | "Good" | "Fair" | "Poor";
  creditScore: number;
}

interface PaymentHistoryItem {
  id: string;
  amount: number;
  dueDate: string;
  paidDate: string;
  status: "on_time" | "late" | "missed";
  loanId: string;
  assetName: string;
  daysLate?: number;
}

interface CreditScoreFactors {
  paymentHistory: number; // 35%
  creditUtilization: number; // 30%
  creditLength: number; // 15%
  loanDiversity: number; // 10%
  newCredit: number; // 10%
}

export default function CreditScorePage() {
  const [user, setUser] = useState<User | null>(null);
  const [userCredit, setUserCredit] = useState<UserCredit | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>(
    []
  );
  const [creditFactors, setCreditFactors] = useState<CreditScoreFactors | null>(
    null
  );
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await fetchUserCredit(user.id);
        await fetchPaymentHistory(user.id);
        await fetchCreditFactors(user.id);
      }
    };

    getUser();
  }, []);

  const fetchUserCredit = async (userId: string) => {
    // This would fetch real credit data from your database
    // For now, return default values until real data is available
    const defaultCredit: UserCredit = {
      available: 0,
      total: 0,
      used: 0,
      level: "Bronze",
      nextTierAmount: 50000,
      monthlySpent: 0,
      paymentHistory: "Fair",
      creditScore: 650,
    };

    setUserCredit(defaultCredit);
  };

  const fetchPaymentHistory = async (userId: string) => {
    // This would fetch real payment history from your database
    // For now, return empty array until real data is available
    const history: PaymentHistoryItem[] = [];
    setPaymentHistory(history);
  };

  const fetchCreditFactors = async (userId: string) => {
    // This would calculate real credit score factors from your database
    // For now, return default values until real data is available
    const factors: CreditScoreFactors = {
      paymentHistory: 65, // Default fair payment history
      creditUtilization: 70, // Default utilization
      creditLength: 60, // Default credit history length
      loanDiversity: 50, // Default loan diversity
      newCredit: 75, // Default new credit usage
    };

    setCreditFactors(factors);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const getCreditScoreColor = (score: number) => {
    if (score >= 750)
      return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 700) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 650) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (score >= 600) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getCreditScoreRating = (score: number) => {
    if (score >= 750) return "Excellent";
    if (score >= 700) return "Good";
    if (score >= 650) return "Fair";
    if (score >= 600) return "Poor";
    return "Very Poor";
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case "on_time":
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case "late":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "missed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "on_time":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "late":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "missed":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getCreditUsagePercentage = () => {
    if (!userCredit) return 0;
    return (userCredit.used / userCredit.total) * 100;
  };

  const getLoanEligibility = (creditScore: number) => {
    if (creditScore >= 750) {
      return {
        maxAmount: 500000,
        interestRate: 4.5,
        status: "Pre-approved",
        color: "emerald",
      };
    } else if (creditScore >= 700) {
      return {
        maxAmount: 350000,
        interestRate: 5.5,
        status: "Excellent",
        color: "blue",
      };
    } else if (creditScore >= 650) {
      return {
        maxAmount: 200000,
        interestRate: 7.0,
        status: "Good",
        color: "yellow",
      };
    } else if (creditScore >= 600) {
      return {
        maxAmount: 100000,
        interestRate: 9.0,
        status: "Fair",
        color: "orange",
      };
    } else {
      return {
        maxAmount: 50000,
        interestRate: 12.0,
        status: "Limited",
        color: "red",
      };
    }
  };

  const handleNotifyMe = () => {
    if (email) {
      setSubscribed(true);
    }
  };

  const features = [
    {
      icon: BarChart3,
      title: "Real-Time Credit Scoring",
      description:
        "Dynamic credit assessment based on your asset portfolio, payment history, and DeFi activity",
      status: "In Development",
      color: "blue",
    },
    {
      icon: Shield,
      title: "Blockchain-Based Verification",
      description:
        "Immutable credit history stored on-chain with privacy-preserving technology",
      status: "Planned",
      color: "green",
    },
    {
      icon: Target,
      title: "Multi-Asset Collateral",
      description:
        "Credit scoring that considers your entire tokenized asset portfolio",
      status: "In Development",
      color: "purple",
    },
    {
      icon: TrendingUp,
      title: "Credit Improvement Tools",
      description:
        "AI-powered recommendations to improve your credit score and borrowing capacity",
      status: "Coming Soon",
      color: "orange",
    },
    {
      icon: Award,
      title: "Credit Rewards Program",
      description:
        "Earn rewards and better rates for maintaining excellent credit history",
      status: "Planned",
      color: "indigo",
    },
    {
      icon: Bell,
      title: "Score Monitoring",
      description:
        "Real-time alerts for credit score changes and improvement opportunities",
      status: "Coming Soon",
      color: "red",
    },
  ];

  const benefits = [
    {
      title: "Better Loan Terms",
      description:
        "Higher credit scores unlock lower interest rates and higher loan amounts",
      icon: CreditCard,
      example: "Get 2-4% lower APR with excellent credit score",
    },
    {
      title: "Instant Approvals",
      description:
        "Pre-approved credit lines based on your verified credit score",
      icon: Zap,
      example: "Instant approval for loans up to $500K with 750+ score",
    },
    {
      title: "Portfolio Optimization",
      description: "Credit-aware asset allocation recommendations",
      icon: Target,
      example: "Optimize asset mix to maximize borrowing capacity",
    },
    {
      title: "Cross-Platform Recognition",
      description:
        "Your TangibleFi credit score recognized across DeFi protocols",
      icon: Star,
      example: "Use your score on Compound, Aave, and other platforms",
    },
  ];

  if (!userCredit || !creditFactors) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading credit information...</p>
        </div>
      </div>
    );
  }

  const eligibility = getLoanEligibility(userCredit.creditScore);
  const onTimePayments = paymentHistory.filter(
    (p) => p.status === "on_time"
  ).length;
  const totalPayments = paymentHistory.length;
  const onTimePercentage =
    totalPayments > 0 ? (onTimePayments / totalPayments) * 100 : 0;

  return (
    <div className="w-full px-6 py-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Badge className="bg-orange-100 text-orange-800 text-sm">
          Coming Soon
        </Badge>
        <h1 className="text-4xl font-bold text-gray-900">
          Credit Score & Rating
        </h1>
        <p className="text-lg text-gray-600">
          Build your on-chain credit history and unlock better borrowing terms
          with our comprehensive credit scoring system.
        </p>
      </div>

      {/* Main Coming Soon Card */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-8 h-8 text-blue-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Revolutionary On-Chain Credit Scoring
          </h2>

          <p className="text-gray-600 mb-6 max-w-lg mx-auto">
            Our advanced credit scoring system analyzes your asset portfolio,
            payment history, and DeFi activity to provide accurate, real-time
            credit assessments.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            {!subscribed ? (
              <>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleNotifyMe}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Bell className="w-4 h-4" />
                  Notify Me
                </Button>
              </>
            ) : (
              <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                <CheckCircle className="w-5 h-5" />
                You'll be notified when Credit Scoring is available!
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Expected Q2 2025
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Privacy-First
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Advanced Credit Features
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 bg-${feature.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}
                    >
                      <IconComponent
                        className={`w-5 h-5 text-${feature.color}-600`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {feature.title}
                        </h4>
                        <Badge
                          variant="outline"
                          className={`text-xs bg-${feature.color}-50 text-${feature.color}-700 border-${feature.color}-200`}
                        >
                          {feature.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Benefits Section */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Credit Score Benefits
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {benefit.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {benefit.description}
                      </p>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 font-medium">
                          Example: {benefit.example}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <Card className="bg-gradient-to-r from-gray-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Development Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">
                  Q1 2025 - Foundation
                </p>
                <p className="text-sm text-gray-600">
                  Basic credit scoring algorithm and data collection
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">
                  Q2 2025 - Beta Launch
                </p>
                <p className="text-sm text-gray-600">
                  Limited beta with select users and basic features
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">
                  Q3 2025 - Full Release
                </p>
                <p className="text-sm text-gray-600">
                  Complete credit scoring system with all features
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
