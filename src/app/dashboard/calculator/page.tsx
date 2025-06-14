"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
  DollarSign,
  Percent,
  Calendar,
  TrendingUp,
  Bell,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Shield,
  RefreshCw,
  Eye,
  ArrowRight,
  Sparkles,
  Brain,
  Globe,
  Lock,
} from "lucide-react";

export default function LoanCalculatorPage() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNotifyMe = () => {
    if (email.trim()) {
      setIsSubscribed(true);
      // Here you would typically send the email to your backend
      console.log("Subscribed email:", email);
    }
  };

  const features = [
    {
      icon: Calculator,
      title: "Advanced Loan Calculator",
      description: "Calculate loan amounts, payments, and terms with precision",
      status: "Coming Soon",
      color: "blue",
    },
    {
      icon: BarChart3,
      title: "Amortization Schedules",
      description: "Detailed payment breakdowns and interest calculations",
      status: "Coming Soon",
      color: "green",
    },
    {
      icon: PieChart,
      title: "Risk Assessment",
      description: "AI-powered risk analysis for your loan applications",
      status: "Coming Soon",
      color: "purple",
    },
    {
      icon: Target,
      title: "LTV Optimization",
      description: "Optimize loan-to-value ratios for better terms",
      status: "Coming Soon",
      color: "orange",
    },
    {
      icon: Brain,
      title: "Smart Recommendations",
      description: "AI-driven loan product recommendations",
      status: "Coming Soon",
      color: "indigo",
    },
    {
      icon: Globe,
      title: "Multi-Currency Support",
      description: "Calculate loans in multiple currencies and regions",
      status: "Coming Soon",
      color: "teal",
    },
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Instant Calculations",
      description: "Get loan calculations in real-time with dynamic updates",
      example: "Calculate monthly payments for a $500K property loan instantly",
    },
    {
      icon: Shield,
      title: "Accurate Projections",
      description: "Bank-grade accuracy for all financial calculations",
      example: "Precise amortization schedules with compound interest",
    },
    {
      icon: TrendingUp,
      title: "Scenario Planning",
      description: "Compare multiple loan scenarios side-by-side",
      example: "Compare 15-year vs 30-year mortgage options",
    },
    {
      icon: Eye,
      title: "Visual Analytics",
      description: "Interactive charts and graphs for better understanding",
      example: "Visual payment breakdown and interest vs principal charts",
    },
  ];

  const calculatorTypes = [
    {
      title: "Mortgage Calculator",
      description: "Calculate home loan payments and amortization",
      icon: "🏠",
      features: ["Monthly payments", "Total interest", "Amortization schedule"],
    },
    {
      title: "Auto Loan Calculator",
      description: "Vehicle financing calculations and comparisons",
      icon: "🚗",
      features: ["Payment calculator", "Trade-in value", "Lease vs buy"],
    },
    {
      title: "Personal Loan Calculator",
      description: "Unsecured loan calculations and planning",
      icon: "💰",
      features: ["Payment schedules", "Rate comparisons", "Debt consolidation"],
    },
    {
      title: "Investment Calculator",
      description: "ROI calculations for real estate investments",
      icon: "📈",
      features: [
        "Cash flow analysis",
        "Cap rate calculator",
        "IRR calculations",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <div className="px-6 py-8">
        <div className="w-full">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                  Loan Calculator
                </h1>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                Advanced loan calculations and financial planning tools coming
                soon
              </p>
              <div className="flex items-center gap-4 pt-2">
                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Coming Soon
                </Badge>
                <Badge
                  variant="outline"
                  className="text-blue-700 border-blue-200"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI-Powered
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 space-y-8">
        <div className="w-full space-y-8">
          {/* Coming Soon Banner */}
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Calculator className="w-6 h-6" />
                Advanced Loan Calculator Suite
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-100 mb-6 text-lg">
                Get notified when our comprehensive loan calculator with
                AI-powered recommendations and advanced analytics becomes
                available.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {!isSubscribed ? (
                  <>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-blue-200"
                    />
                    <Button
                      onClick={handleNotifyMe}
                      className="bg-white text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                    >
                      <Bell className="w-4 h-4" />
                      Notify Me
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-white font-medium">
                    <CheckCircle className="w-5 h-5" />
                    You'll be notified when the Loan Calculator is available!
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-center gap-6 text-sm text-blue-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Expected Q2 2025
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Bank-Grade Accuracy
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calculator Types */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Calculator Types
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {calculatorTypes.map((calc, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{calc.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {calc.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          {calc.description}
                        </p>
                        <div className="space-y-1">
                          {calc.features.map((feature, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-xs text-gray-500"
                            >
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Upcoming Features
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card
                    key={index}
                    className="hover:shadow-md transition-shadow"
                  >
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
              Why Use Our Calculator?
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <Card
                    key={index}
                    className="hover:shadow-md transition-shadow"
                  >
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

          {/* Security & Accuracy */}
          <Card className="bg-gradient-to-r from-gray-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                Security & Accuracy Commitment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Bank-Grade Calculations
                  </h4>
                  <p className="text-sm text-gray-600">
                    Industry-standard formulas and precision calculations
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Verified Accuracy
                  </h4>
                  <p className="text-sm text-gray-600">
                    All calculations verified against industry standards
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    AI-Enhanced
                  </h4>
                  <p className="text-sm text-gray-600">
                    Smart recommendations and scenario analysis
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
