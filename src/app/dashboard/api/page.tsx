"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Clock,
  Bell,
  CheckCircle,
  Code,
  Shield,
  Zap,
} from "lucide-react";

export default function APIPage() {
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
          <h1 className="text-4xl font-bold text-gray-900">API Access</h1>
          <p className="text-lg text-gray-600 mt-3">
            Developer API and integration tools
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
            <Database className="w-10 h-10 text-blue-600" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Developer API Coming Soon
          </h2>

          <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
            We're building a comprehensive API that will give developers full access to TangibleFi's platform. Get notified when it's ready for early access testing.
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
                You'll be notified when API access is available!
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
              Secure Access
            </div>
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              RESTful API
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Portfolio Data</h3>
            <p className="text-sm text-gray-600">Access your portfolio data and transactions programmatically</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Real-time Updates</h3>
            <p className="text-sm text-gray-600">Get real-time updates on asset prices and portfolio changes</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Secure Authentication</h3>
            <p className="text-sm text-gray-600">OAuth 2.0 and API key authentication with granular permissions</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
