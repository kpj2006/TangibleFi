"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Bell,
  CheckCircle,
  Zap,
  Shield,
  Repeat,
  DollarSign,
  BarChart3,
} from "lucide-react";

export default function PaymentSchedulerPage() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNotifyMe = () => {
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <div className="w-full px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Payment Scheduler</h1>
          <p className="text-lg text-gray-600 mt-3">
            Automated payment scheduling and management
          </p>
        </div>
        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
          <Clock className="h-3 w-3 mr-1" />
          Coming Soon
        </Badge>
      </div>

      {/* Coming Soon Card */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-blue-600" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Scheduler Coming Soon
          </h2>

          <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
            We're building an intelligent payment scheduling system that will revolutionize how you manage recurring transactions, loan payments, and investment schedules.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-8">
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
                You'll be notified when Payment Scheduler is available!
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Expected Q2 2025
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Secure Processing
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              AI-Powered
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Repeat className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Automated Scheduling</h3>
            <p className="text-sm text-gray-600">Set up recurring payments with flexible scheduling options</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Payment Analytics</h3>
            <p className="text-sm text-gray-600">Track payment history and optimize cash flow</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Secure Processing</h3>
            <p className="text-sm text-gray-600">Bank-grade security with encrypted transaction processing</p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Preview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">$2.5M+</div>
            <div className="text-sm text-gray-600">Payments Processed</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">10K+</div>
            <div className="text-sm text-gray-600">Scheduled Payments</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">99.9%</div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">24/7</div>
            <div className="text-sm text-gray-600">Automated Processing</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
