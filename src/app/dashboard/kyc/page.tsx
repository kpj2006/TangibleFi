"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  FileCheck,
  UserCheck,
  Bell,
  CheckCircle,
  Zap,
  Lock,
  Globe,
  AlertCircle,
  Camera,
  Upload,
  Clock,
  Award,
  Smartphone,
} from "lucide-react";

export default function KYCPage() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNotifyMe = () => {
    if (email) {
      setSubscribed(true);
    }
  };

  const features = [
    {
      icon: FileCheck,
      title: "Document Verification",
      description:
        "AI-powered document scanning and verification for government IDs, passports, and utility bills",
      status: "In Development",
      color: "blue",
    },
    {
      icon: Camera,
      title: "Biometric Authentication",
      description:
        "Facial recognition and liveness detection for secure identity verification",
      status: "Planned",
      color: "green",
    },
    {
      icon: Shield,
      title: "Privacy-First Approach",
      description:
        "Zero-knowledge proofs and encrypted data storage to protect your personal information",
      status: "In Development",
      color: "purple",
    },
    {
      icon: Globe,
      title: "Global Compliance",
      description:
        "Support for international KYC standards and regulatory requirements across jurisdictions",
      status: "Coming Soon",
      color: "orange",
    },
    {
      icon: Zap,
      title: "Instant Verification",
      description:
        "Real-time identity verification with automated approval for eligible users",
      status: "Planned",
      color: "indigo",
    },
    {
      icon: Award,
      title: "Verification Levels",
      description:
        "Tiered verification system with different access levels based on verification completeness",
      status: "Coming Soon",
      color: "red",
    },
  ];

  const benefits = [
    {
      title: "Higher Loan Limits",
      description:
        "Verified users can access larger loan amounts and better terms",
      icon: UserCheck,
      example: "Increase loan limits from $50K to $1M+ with full verification",
    },
    {
      title: "Reduced Interest Rates",
      description: "Lower risk profile leads to preferential interest rates",
      icon: Shield,
      example: "Get 1-3% lower APR with completed KYC verification",
    },
    {
      title: "Priority Support",
      description:
        "Verified users receive priority customer support and faster processing",
      icon: Zap,
      example: "24/7 dedicated support line for verified users",
    },
    {
      title: "Advanced Features",
      description: "Access to premium features and institutional-grade tools",
      icon: Lock,
      example: "Unlock advanced trading, bulk operations, and API access",
    },
  ];

  const verificationSteps = [
    {
      step: 1,
      title: "Basic Information",
      description: "Provide your personal details and contact information",
      icon: UserCheck,
      time: "2 minutes",
    },
    {
      step: 2,
      title: "Document Upload",
      description: "Upload government-issued ID and proof of address",
      icon: Upload,
      time: "5 minutes",
    },
    {
      step: 3,
      title: "Biometric Verification",
      description: "Complete facial recognition and liveness check",
      icon: Camera,
      time: "3 minutes",
    },
    {
      step: 4,
      title: "Review & Approval",
      description: "Our team reviews your submission for final approval",
      icon: FileCheck,
      time: "24-48 hours",
    },
  ];

  return (
    <div className="w-full px-6 py-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Badge className="bg-orange-100 text-orange-800 text-sm">
          Coming Soon
        </Badge>
        <h1 className="text-4xl font-bold text-gray-900">KYC Verification</h1>
        <p className="text-lg text-gray-600">
          Secure, privacy-first identity verification to unlock the full
          potential of TangibleFi's lending platform.
        </p>
      </div>

      {/* Main Coming Soon Card */}
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Advanced KYC System Coming Soon
          </h2>

          <p className="text-gray-600 mb-6 max-w-lg mx-auto">
            Our comprehensive KYC verification system will provide secure,
            compliant identity verification while protecting your privacy with
            cutting-edge technology.
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
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Bell className="w-4 h-4" />
                  Notify Me
                </Button>
              </>
            ) : (
              <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                <CheckCircle className="w-5 h-5" />
                You'll be notified when KYC Verification is available!
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Expected Q2 2025
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Privacy-First
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Process */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Simple Verification Process
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {verificationSteps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                    {step.step}
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {step.description}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    ~{step.time}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Features Grid */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Advanced Verification Features
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
          Verification Benefits
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
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

      {/* Security & Privacy */}
      <Card className="bg-gradient-to-r from-gray-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            Security & Privacy Commitment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Bank-Grade Security
              </h4>
              <p className="text-sm text-gray-600">
                Military-grade encryption and secure data storage
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Zero-Knowledge Proofs
              </h4>
              <p className="text-sm text-gray-600">
                Verify identity without exposing personal data
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Global Compliance
              </h4>
              <p className="text-sm text-gray-600">
                GDPR, CCPA, and international privacy standards
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
