"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../../../supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Navbar from "@/components/navbar";
import WalletGuard from "@/components/wallet-guard";
import EnhancedSidebar from "@/components/enhanced-sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  Calendar,
  Percent,
  Building,
  Shield,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Landmark,
  ArrowLeft,
  Calculator,
  Clock,
  Globe,
  Zap,
  Star,
  Award,
  Crown,
} from "lucide-react";

export default function NewLoanPage() {
  return (
    <WalletGuard requiresTransaction={true}>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50">
        <EnhancedSidebar />
        <NewLoanContent />
      </div>
    </WalletGuard>
  );
}

function NewLoanContent() {
  const [selectedAsset, setSelectedAsset] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [selectedTier, setSelectedTier] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchUserAssets();
  }, []);

  const fetchUserAssets = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      const { data: assetsData, error } = await supabase
        .from("assets")
        .select("*")
        .eq("user_id", user.id)
        .eq("verification_status", "verified")
        .eq("collateralization_status", "available");

      if (error) {
        console.error("Error fetching assets:", error);
        toast.error("Failed to load assets");
      } else {
        setAssets(assetsData || []);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !selectedAsset ||
      !loanAmount ||
      !loanTerm ||
      !selectedTier ||
      !selectedNetwork
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      // Get interest rate based on selected tier
      const interestRates = {
        standard: 5.25,
        premium: 4.75,
        institutional: 4.25,
      };

      const interestRate =
        interestRates[selectedTier as keyof typeof interestRates];
      const loanAmountNum = parseFloat(loanAmount);
      const loanTermMonths = parseInt(loanTerm);

      // Calculate monthly payment
      const monthlyInterestRate = interestRate / 100 / 12;
      const monthlyPayment =
        (loanAmountNum *
          (monthlyInterestRate *
            Math.pow(1 + monthlyInterestRate, loanTermMonths))) /
        (Math.pow(1 + monthlyInterestRate, loanTermMonths) - 1);

      const nextPaymentDate = new Date();
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

      const { error } = await supabase.from("loans").insert({
        user_id: user.id,
        asset_id: selectedAsset,
        loan_amount: loanAmountNum,
        outstanding_balance: loanAmountNum,
        interest_rate: interestRate,
        loan_term_months: loanTermMonths,
        monthly_payment: monthlyPayment,
        next_payment_date: nextPaymentDate.toISOString().split("T")[0],
        loan_status: "pending",
        blockchain: selectedNetwork,
      });

      if (error) {
        console.error("Error creating loan:", error);
        toast.error("Failed to create loan application");
      } else {
        toast.success("Loan application submitted successfully!");
        router.push("/dashboard/loans");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to submit loan application");
    } finally {
      setSubmitting(false);
    }
  };

  const loanTypes = [
    { value: "standard", label: "Standard Loan", rate: "5.25%", ltv: "80%" },
    { value: "premium", label: "Premium Loan", rate: "4.75%", ltv: "85%" },
    {
      value: "institutional",
      label: "Institutional",
      rate: "4.25%",
      ltv: "90%",
    },
  ];

  if (loading) {
    return (
      <main className="flex-1 ml-16 lg:ml-64 transition-all duration-300 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your assets...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 ml-16 lg:ml-64 transition-all duration-300 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 animate-fadeIn">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Header with Back Button */}
        <div className="mb-8 animate-slideDown">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Link href="/dashboard/loans" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Loans
              </Link>
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Estimated time: 3-5 minutes</span>
            </div>
          </div>
          <div className="text-center space-y-3">
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Apply for Asset Loan
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Unlock liquidity from your tokenized assets with competitive rates
              and flexible terms
            </p>
          </div>
        </div>

        {assets.length === 0 && !loading && (
          <Alert className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You don't have any verified assets available for collateral.
              <Link href="/dashboard/assets" className="underline ml-1">
                Add an asset first
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 animate-slideUp">
          {/* Main Form - Takes 3 columns */}
          <div className="xl:col-span-3">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  Loan Application
                </CardTitle>
                <CardDescription className="text-lg">
                  Use your verified assets as collateral to access instant
                  liquidity with competitive interest rates
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Collateral Selection Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">
                          1
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Select Collateral Asset
                      </h3>
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="asset_id"
                        className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                      >
                        <Building className="h-4 w-4" />
                        Choose Asset for Collateral *
                      </Label>
                      <Select
                        value={selectedAsset}
                        onValueChange={setSelectedAsset}
                      >
                        <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                          <SelectValue placeholder="Select an asset" />
                        </SelectTrigger>
                        <SelectContent>
                          {assets.map((asset) => (
                            <SelectItem key={asset.id} value={asset.id}>
                              <div className="flex items-center justify-between w-full">
                                <div>
                                  <span className="font-medium">
                                    {asset.name}
                                  </span>
                                  <span className="text-sm text-gray-500 ml-2">
                                    ${asset.current_value?.toLocaleString()}
                                  </span>
                                </div>
                                <Badge variant="outline" className="ml-2">
                                  {asset.asset_type}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Loan Configuration */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-purple-600">
                          2
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Loan Configuration
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label
                          htmlFor="loan_amount"
                          className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                        >
                          <DollarSign className="h-4 w-4" />
                          Loan Amount (USD) *
                        </Label>
                        <Input
                          id="loan_amount"
                          type="number"
                          placeholder="25000"
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(e.target.value)}
                          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          required
                        />
                      </div>

                      <div className="space-y-3">
                        <Label
                          htmlFor="loan_term_months"
                          className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                        >
                          <Calendar className="h-4 w-4" />
                          Loan Term (Months) *
                        </Label>
                        <Select value={loanTerm} onValueChange={setLoanTerm}>
                          <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                            <SelectValue placeholder="Select term" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12">12 months</SelectItem>
                            <SelectItem value="24">24 months</SelectItem>
                            <SelectItem value="36">36 months</SelectItem>
                            <SelectItem value="60">60 months</SelectItem>
                            <SelectItem value="120">120 months</SelectItem>
                            <SelectItem value="360">360 months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Interest Rate Tiers */}
                    <div className="space-y-4">
                      <Label className="text-sm font-semibold text-gray-700">
                        Select Interest Rate Tier *
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {loanTypes.map((type) => (
                          <div
                            key={type.value}
                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                              selectedTier === type.value
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => setSelectedTier(type.value)}
                          >
                            <div className="text-center">
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {type.label}
                              </h4>
                              <div className="text-2xl font-bold text-blue-600 mb-1">
                                {type.rate}
                              </div>
                              <div className="text-sm text-gray-500">
                                Up to {type.ltv} LTV
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Network Selection */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-purple-600">
                          3
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Payment Network
                      </h3>
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="blockchain"
                        className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                      >
                        <Globe className="h-4 w-4" />
                        Select Payment Blockchain *
                      </Label>
                      <Select
                        value={selectedNetwork}
                        onValueChange={setSelectedNetwork}
                      >
                        <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                          <SelectValue placeholder="Choose payment network" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ethereum">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                              Ethereum - USDC, DAI, ETH
                            </div>
                          </SelectItem>
                          <SelectItem value="polygon">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                              Polygon - Low fees, fast payments
                            </div>
                          </SelectItem>
                          <SelectItem value="arbitrum">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-cyan-500 rounded-full"></div>
                              Arbitrum - Layer 2 efficiency
                            </div>
                          </SelectItem>
                          <SelectItem value="bsc">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                              BNB Chain - BUSD, USDT payments
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        Network for loan disbursement and monthly payments
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="border-t border-gray-200 pt-8">
                    <Button
                      type="submit"
                      disabled={submitting || assets.length === 0}
                      className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-200 rounded-xl disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing Loan Application...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-5 w-5 mr-2" />
                          Submit Loan Application
                        </>
                      )}
                    </Button>
                    <p className="text-center text-sm text-gray-500 mt-3">
                      Wallet verification required • Applications typically
                      reviewed within 24-48 hours
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Takes 1 column */}
          <div className="xl:col-span-1 space-y-6">
            {/* Loan Process Timeline */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  Loan Process
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 border-2 border-blue-500 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900">
                        Wallet Verification
                      </h4>
                      <p className="text-sm text-gray-600">
                        Verify wallet ownership and identity
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 border-2 border-gray-300 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-gray-500">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-500">
                        Smart Contract Setup
                      </h4>
                      <p className="text-sm text-gray-400">
                        Automated loan agreement deployment
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 border-2 border-gray-300 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-gray-500">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-500">
                        Fund Disbursement
                      </h4>
                      <p className="text-sm text-gray-400">
                        Instant transfer to your wallet
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loan Benefits */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-emerald-800">
                  <Landmark className="h-5 w-5" />
                  Loan Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm text-emerald-800">
                    Wallet-based authentication
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm text-emerald-800">
                    Instant liquidity access
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm text-emerald-800">
                    Competitive interest rates
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm text-emerald-800">
                    Keep asset ownership
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Risk Warning */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-amber-800">
                  <Shield className="h-5 w-5" />
                  Important Notice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-amber-800">
                  Your asset serves as collateral. Always use the same wallet
                  address for all transactions.
                </p>
                <p className="text-sm text-amber-700">
                  Interest rates are variable and may change based on market
                  conditions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
