"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/navbar";
import {
  BookOpen,
  Search,
  Code,
  Zap,
  Shield,
  Play,
  Download,
  ExternalLink,
  CheckCircle,
  ArrowRight,
  FileText,
  Globe,
  Lock,
  Wallet,
  Building2,
  CreditCard,
  Settings,
  Home,
} from "lucide-react";

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("getting-started");

  const documentationSections = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: Play,
      description: "Quick start guide to begin using TangibleFi",
    },
    {
      id: "api-reference",
      title: "API Reference",
      icon: Code,
      description: "Complete API documentation and endpoints",
    },
    {
      id: "tutorials",
      title: "Tutorials",
      icon: BookOpen,
      description: "Step-by-step guides for common tasks",
    },
    {
      id: "security",
      title: "Security",
      icon: Shield,
      description: "Security best practices and protocols",
    },
    {
      id: "integrations",
      title: "Integrations",
      icon: Globe,
      description: "Third-party integrations and partnerships",
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      icon: Settings,
      description: "Common issues and solutions",
    },
  ];

  const quickLinks = [
    {
      title: "Asset Tokenization Guide",
      href: "#tokenization",
      time: "5 min read",
    },
    { title: "Loan Application Process", href: "#loans", time: "3 min read" },
    {
      title: "Cross-Chain Bridge Tutorial",
      href: "#bridge",
      time: "7 min read",
    },
    { title: "API Authentication", href: "#auth", time: "4 min read" },
    { title: "Wallet Integration", href: "#wallet", time: "6 min read" },
    { title: "KYC Verification", href: "#kyc", time: "2 min read" },
  ];

  const apiEndpoints = [
    {
      method: "POST",
      endpoint: "/api/v1/assets",
      description: "Create a new asset tokenization request",
      status: "Active",
    },
    {
      method: "GET",
      endpoint: "/api/v1/assets/{id}",
      description: "Retrieve asset details by ID",
      status: "Active",
    },
    {
      method: "POST",
      endpoint: "/api/v1/loans/apply",
      description: "Submit a new loan application",
      status: "Active",
    },
    {
      method: "GET",
      endpoint: "/api/v1/loans/{id}/status",
      description: "Check loan application status",
      status: "Active",
    },
    {
      method: "POST",
      endpoint: "/api/v1/cross-chain/bridge",
      description: "Initiate cross-chain asset transfer",
      status: "Beta",
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Documentation
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Everything you need to build with TangibleFi's real-world asset
              tokenization platform
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
              />
            </div>
          </div>

          {/* Quick Start Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-8 h-8 text-blue-600" />
                  <h3 className="text-xl font-bold text-blue-900">
                    Quick Start
                  </h3>
                </div>
                <p className="text-blue-700 mb-4">
                  Get up and running in minutes with our comprehensive setup
                  guide.
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Start Building
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Code className="w-8 h-8 text-emerald-600" />
                  <h3 className="text-xl font-bold text-emerald-900">
                    API Reference
                  </h3>
                </div>
                <p className="text-emerald-700 mb-4">
                  Complete API documentation with examples and interactive
                  testing.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                >
                  Explore APIs
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-8 h-8 text-purple-600" />
                  <h3 className="text-xl font-bold text-purple-900">
                    Tutorials
                  </h3>
                </div>
                <p className="text-purple-700 mb-4">
                  Step-by-step guides for common integration patterns and use
                  cases.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  View Tutorials
                  <Play className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {documentationSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                        activeSection === section.id
                          ? "bg-blue-50 border border-blue-200 text-blue-700"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <section.icon
                          className={`w-4 h-4 ${
                            activeSection === section.id
                              ? "text-blue-600"
                              : "text-gray-500"
                          }`}
                        />
                        <div>
                          <div className="font-medium text-sm">
                            {section.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {section.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-emerald-600" />
                    Quick Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {quickLinks.map((link, index) => (
                    <Link
                      key={index}
                      href={link.href}
                      className="block p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                          {link.title}
                        </div>
                        <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-blue-500" />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {link.time}
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              <Tabs
                value={activeSection}
                onValueChange={setActiveSection}
                className="space-y-6"
              >
                <TabsContent value="getting-started">
                  <iframe
                    src="https://gamma.app/embed/p9ndfrtjbaxz4mq"
                    style={{
                      width: "1000px",
                      maxWidth: "120%",
                      height: "650px",
                    }}
                    allow="fullscreen"
                    title="TangibleFi Protocol Documentation"
                  ></iframe>
                </TabsContent>

                <TabsContent value="api-reference">
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-emerald-50/50 to-emerald-100/50 border-b border-gray-100">
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <Code className="w-6 h-6 text-emerald-600" />
                        API Reference
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                      {/* Authentication */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-900">
                          Authentication
                        </h3>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                          <h4 className="font-semibold text-blue-900 mb-3">
                            API Key Authentication
                          </h4>
                          <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm mb-4">
                            <div>
                              curl -H "Authorization: Bearer YOUR_API_KEY" \
                            </div>
                            <div className="ml-4">
                              https://api.tangiblefi.com/v1/assets
                            </div>
                          </div>
                          <p className="text-blue-700 text-sm">
                            Get your API key from the dashboard settings page
                            after completing KYC verification.
                          </p>
                        </div>
                      </div>

                      {/* Endpoints */}
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-900">
                          Endpoints
                        </h3>
                        <div className="space-y-4">
                          {apiEndpoints.map((endpoint, index) => (
                            <div
                              key={index}
                              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <Badge
                                    className={`${
                                      endpoint.method === "POST"
                                        ? "bg-green-100 text-green-800"
                                        : endpoint.method === "GET"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-orange-100 text-orange-800"
                                    }`}
                                  >
                                    {endpoint.method}
                                  </Badge>
                                  <code className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm font-mono">
                                    {endpoint.endpoint}
                                  </code>
                                </div>
                                <Badge
                                  className={`${
                                    endpoint.status === "Active"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {endpoint.status}
                                </Badge>
                              </div>
                              <p className="text-gray-600">
                                {endpoint.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SDKs */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-900">
                          SDKs & Libraries
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            {
                              name: "JavaScript SDK",
                              version: "v2.1.0",
                              downloads: "12.5k",
                            },
                            {
                              name: "Python SDK",
                              version: "v1.8.0",
                              downloads: "8.2k",
                            },
                            {
                              name: "Go SDK",
                              version: "v1.5.0",
                              downloads: "4.1k",
                            },
                          ].map((sdk, index) => (
                            <div
                              key={index}
                              className="p-4 border border-gray-200 rounded-lg"
                            >
                              <h4 className="font-semibold text-gray-900">
                                {sdk.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {sdk.version}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {sdk.downloads} downloads
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full mt-3"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Install
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tutorials">
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-purple-50/50 to-purple-100/50 border-b border-gray-100">
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <BookOpen className="w-6 h-6 text-purple-600" />
                        Tutorials
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          {
                            title: "Asset Tokenization",
                            description:
                              "Learn how to tokenize real estate and other physical assets",
                            difficulty: "Beginner",
                            time: "15 min",
                            icon: Building2,
                          },
                          {
                            title: "Loan Application",
                            description:
                              "Step-by-step guide to applying for asset-backed loans",
                            difficulty: "Beginner",
                            time: "10 min",
                            icon: CreditCard,
                          },
                          {
                            title: "Cross-Chain Bridge",
                            description:
                              "Transfer assets across different blockchain networks",
                            difficulty: "Intermediate",
                            time: "20 min",
                            icon: Globe,
                          },
                          {
                            title: "Advanced API Usage",
                            description:
                              "Complex integrations and custom implementations",
                            difficulty: "Advanced",
                            time: "45 min",
                            icon: Code,
                          },
                        ].map((tutorial, index) => (
                          <Card
                            key={index}
                            className="border border-gray-200 hover:shadow-lg transition-all duration-300"
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                                  <tutorial.icon className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {tutorial.title}
                                  </h3>
                                  <p className="text-gray-600 text-sm mb-4">
                                    {tutorial.description}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {tutorial.difficulty}
                                      </Badge>
                                      <span className="text-xs text-gray-500">
                                        {tutorial.time}
                                      </span>
                                    </div>
                                    <Button size="sm">
                                      Start Tutorial
                                      <ArrowRight className="w-3 h-3 ml-1" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security">
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-red-50/50 to-red-100/50 border-b border-gray-100">
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <Shield className="w-6 h-6 text-red-600" />
                        Security
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                      {/* Security Features */}
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-900">
                          Security Features
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {[
                            {
                              title: "End-to-End Encryption",
                              description:
                                "All data is encrypted in transit and at rest using AES-256",
                              icon: Lock,
                            },
                            {
                              title: "Multi-Signature Wallets",
                              description:
                                "Assets secured with multi-signature smart contracts",
                              icon: Wallet,
                            },
                            {
                              title: "KYC/AML Compliance",
                              description:
                                "Full compliance with international regulations",
                              icon: CheckCircle,
                            },
                            {
                              title: "Regular Audits",
                              description:
                                "Smart contracts audited by leading security firms",
                              icon: Shield,
                            },
                          ].map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
                            >
                              <feature.icon className="w-6 h-6 text-red-600 mt-1" />
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {feature.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {feature.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Best Practices */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-900">
                          Security Best Practices
                        </h3>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                          <h4 className="font-semibold text-amber-900 mb-3">
                            Important Security Guidelines
                          </h4>
                          <ul className="space-y-2 text-amber-800">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 mt-0.5 text-amber-600" />
                              <span className="text-sm">
                                Never share your private keys or seed phrases
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 mt-0.5 text-amber-600" />
                              <span className="text-sm">
                                Always verify transaction details before signing
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 mt-0.5 text-amber-600" />
                              <span className="text-sm">
                                Use hardware wallets for large amounts
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 mt-0.5 text-amber-600" />
                              <span className="text-sm">
                                Enable 2FA on your account
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="integrations">
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-green-50/50 to-green-100/50 border-b border-gray-100">
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <Globe className="w-6 h-6 text-green-600" />
                        Integrations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="space-y-8">
                        {/* Blockchain Networks */}
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold text-gray-900">
                            Supported Networks
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                              {
                                name: "Ethereum",
                                status: "Live",
                                color: "blue",
                              },
                              {
                                name: "Polygon",
                                status: "Live",
                                color: "purple",
                              },
                              {
                                name: "Arbitrum",
                                status: "Live",
                                color: "cyan",
                              },
                              {
                                name: "Optimism",
                                status: "Coming Soon",
                                color: "red",
                              },
                              {
                                name: "Avalanche",
                                status: "Coming Soon",
                                color: "orange",
                              },
                              { name: "BSC", status: "Live", color: "yellow" },
                            ].map((network, index) => (
                              <div
                                key={index}
                                className="p-4 border border-gray-200 rounded-lg"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-gray-900">
                                    {network.name}
                                  </h4>
                                  <Badge
                                    className={`bg-${network.color}-100 text-${network.color}-800`}
                                  >
                                    {network.status}
                                  </Badge>
                                </div>
                                <div
                                  className={`w-4 h-4 bg-${network.color}-500 rounded-full`}
                                ></div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Partner Integrations */}
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold text-gray-900">
                            Partner Integrations
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                              {
                                name: "Chainlink Oracles",
                                description:
                                  "Real-time asset pricing and market data",
                                status: "Active",
                              },
                              {
                                name: "The Graph Protocol",
                                description:
                                  "Decentralized indexing for blockchain data",
                                status: "Active",
                              },
                              {
                                name: "IPFS Storage",
                                description:
                                  "Decentralized storage for asset metadata",
                                status: "Active",
                              },
                              {
                                name: "Gelato Network",
                                description: "Automated transaction execution",
                                status: "Beta",
                              },
                            ].map((integration, index) => (
                              <div
                                key={index}
                                className="p-6 border border-gray-200 rounded-lg"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-semibold text-gray-900">
                                    {integration.name}
                                  </h4>
                                  <Badge
                                    className={`${
                                      integration.status === "Active"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-amber-100 text-amber-800"
                                    }`}
                                  >
                                    {integration.status}
                                  </Badge>
                                </div>
                                <p className="text-gray-600 text-sm">
                                  {integration.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="troubleshooting">
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-orange-50/50 to-orange-100/50 border-b border-gray-100">
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <Settings className="w-6 h-6 text-orange-600" />
                        Troubleshooting
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                      {/* Common Issues */}
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-900">
                          Common Issues
                        </h3>
                        <div className="space-y-4">
                          {[
                            {
                              issue: "Wallet Connection Failed",
                              solution:
                                "Ensure MetaMask is installed and unlocked. Try refreshing the page.",
                              severity: "Medium",
                            },
                            {
                              issue: "Transaction Pending Too Long",
                              solution:
                                "Check network congestion. You may need to increase gas fees.",
                              severity: "Low",
                            },
                            {
                              issue: "Asset Verification Rejected",
                              solution:
                                "Ensure all documents are clear and meet our verification standards.",
                              severity: "High",
                            },
                            {
                              issue: "API Rate Limit Exceeded",
                              solution:
                                "Reduce request frequency or upgrade to a higher tier plan.",
                              severity: "Medium",
                            },
                          ].map((item, index) => (
                            <div
                              key={index}
                              className="border border-gray-200 rounded-lg p-6"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-gray-900">
                                  {item.issue}
                                </h4>
                                <Badge
                                  className={`${
                                    item.severity === "High"
                                      ? "bg-red-100 text-red-800"
                                      : item.severity === "Medium"
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {item.severity}
                                </Badge>
                              </div>
                              <p className="text-gray-600 text-sm">
                                {item.solution}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Contact Support */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h4 className="font-semibold text-blue-900 mb-3">
                          Need More Help?
                        </h4>
                        <p className="text-blue-700 mb-4">
                          If you can't find the solution to your problem, our
                          support team is here to help.
                        </p>
                        <div className="flex gap-3">
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            Contact Support
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                          <Button
                            variant="outline"
                            className="border-blue-300 text-blue-700"
                          >
                            Join Discord
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-8 border-t border-gray-200">
            <p className="text-gray-600">
              Last updated: June 28, 2025 • Version 2.1.0
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Home className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <Link
                href="/support"
                className="text-blue-600 hover:text-blue-700"
              >
                Support
              </Link>
              <Link
                href="/community"
                className="text-blue-600 hover:text-blue-700"
              >
                Community
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}