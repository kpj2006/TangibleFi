"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../supabase/client";
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
import {
  CreditCard,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Wallet,
  Plus,
  ArrowRight,
  Banknote,
  Target,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { User } from "@supabase/supabase-js";
import { SubmitButton } from "@/components/submit-button";

interface Payment {
  id: string;
  loan_id: string;
  amount: number;
  currency: string;
  crypto_currency?: string;
  exchange_rate?: number;
  transaction_hash?: string;
  blockchain?: string;
  payment_status: "pending" | "completed" | "failed";
  payment_date: string;
  created_at: string;
  loans?: {
    id: string;
    loan_amount: number;
    outstanding_balance: number;
    monthly_payment: number;
    assets: {
      name: string;
      asset_type: string;
    };
  };
}

interface Loan {
  id: string;
  loan_amount: number;
  outstanding_balance: number;
  monthly_payment: number;
  next_payment_date: string;
  loan_status: string;
  assets: {
    id: string;
    name: string;
    asset_type: string;
  };
}

// Get real payments data from database with optimized query
const getPayments = async (
  userId: string,
  supabase: any
): Promise<Payment[]> => {
  const { data: payments } = await supabase
    .from("payments")
    .select(
      `
      id,
      loan_id,
      amount,
      currency,
      crypto_currency,
      exchange_rate,
      transaction_hash,
      blockchain,
      payment_status,
      payment_date,
      created_at,
      loans!payments_loan_id_fkey (
        id,
        loan_amount,
        outstanding_balance,
        monthly_payment,
        assets!loans_asset_id_fkey (
          name,
          asset_type
        )
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50); // Limit results for better performance

  return payments || [];
};

function getStatusBadge(status: string) {
  const colors = {
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    failed: "bg-red-50 text-red-700 border-red-200",
  };

  const icons = {
    completed: CheckCircle,
    pending: Clock,
    failed: AlertTriangle,
  };

  const Icon = icons[status as keyof typeof icons] || Clock;

  return (
    <Badge
      variant="outline"
      className={`${colors[status as keyof typeof colors] || "bg-gray-50 text-gray-700 border-gray-200"} font-medium flex items-center gap-1`}
    >
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

const cryptoCurrencies = [
  { symbol: "USDC", name: "USD Coin", rate: 1.0 },
  { symbol: "USDT", name: "Tether", rate: 1.0 },
  { symbol: "ETH", name: "Ethereum", rate: 0.0004 },
  { symbol: "BTC", name: "Bitcoin", rate: 0.000023 },
  { symbol: "MATIC", name: "Polygon", rate: 1.25 },
];

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [selectedLoanId, setSelectedLoanId] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      setUser(user);

      // Load real payments data
      const userPayments = await getPayments(user.id, supabase);
      setPayments(userPayments);

      // Load user's loans for payment selection (optimized query)
      const { data: userLoans, error: loansLoadError } = await supabase
        .from("loans")
        .select(
          `
          id,
          loan_amount,
          outstanding_balance,
          monthly_payment,
          next_payment_date,
          loan_status,
          assets!loans_asset_id_fkey (
            id,
            name,
            asset_type
          )
        `
        )
        .eq("user_id", user.id)
        .in("loan_status", ["active", "completed"])
        .order("created_at", { ascending: false })
        .limit(20); // Limit for better performance

      if (loansLoadError) {
        console.error("Error loading loans:", loansLoadError);
      }

      setLoans(userLoans || []);

      // Check if there's a specific loan ID in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const loanParam = urlParams.get("loan");
      if (loanParam && userLoans?.find((loan) => loan.id === loanParam)) {
        setSelectedLoanId(loanParam);
      }

      setLoading(false);
    };

    loadData();
  }, [router]);

  const handlePayment = async (formData: FormData) => {
    if (!user) return;

    const supabase = createClient();
    const loanId = formData.get("loan_id") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const cryptoCurrency = formData.get("crypto_currency") as string;
    const blockchain = formData.get("blockchain") as string;

    // Find the selected crypto rate
    const selectedCrypto = cryptoCurrencies.find(
      (c) => c.symbol === cryptoCurrency
    );
    const exchangeRate = selectedCrypto?.rate || 1.0;

    // Generate a mock transaction hash (in real implementation, this would come from blockchain)
    const transactionHash = "0x" + Math.random().toString(16).substring(2, 66);

    try {
      // Insert payment record
      const { data: paymentData, error: paymentError } = await supabase
        .from("payments")
        .insert({
          user_id: user.id,
          loan_id: loanId,
          amount: amount,
          currency: "USD",
          crypto_currency: cryptoCurrency,
          exchange_rate: exchangeRate,
          transaction_hash: transactionHash,
          blockchain: blockchain,
          payment_status: "completed",
          payment_date: new Date().toISOString(),
        })
        .select();

      if (paymentError) {
        console.error("Payment error:", paymentError);
        console.error("Payment details:", {
          userId: user.id,
          loanId,
          amount,
          cryptoCurrency,
          blockchain,
        });
        toast({
          title: "Payment Failed",
          description: "There was an error processing your payment.",
          variant: "destructive",
        });
        return;
      }

      // Update loan outstanding balance
      const selectedLoan = loans.find((loan) => loan.id === loanId);
      if (!selectedLoan) {
        console.error("Selected loan not found:", loanId);
        toast({
          title: "Payment Failed",
          description: "Selected loan not found.",
          variant: "destructive",
        });
        return;
      }

      const newBalance = Math.max(0, selectedLoan.outstanding_balance - amount);
      const newStatus = newBalance === 0 ? "completed" : "active";

      // Calculate next payment date (30 days from now)
      const nextPaymentDate = new Date();
      nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);

      const { data: loanUpdateData, error: loanError } = await supabase
        .from("loans")
        .update({
          outstanding_balance: newBalance,
          loan_status: newStatus,
          next_payment_date:
            newBalance > 0 ? nextPaymentDate.toISOString().split("T")[0] : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", loanId)
        .eq("user_id", user.id)
        .select();

      if (loanError) {
        console.error("Loan update error:", loanError);
        console.error("Loan update details:", {
          loanId,
          userId: user.id,
          newBalance,
          newStatus,
          nextPaymentDate:
            newBalance > 0 ? nextPaymentDate.toISOString().split("T")[0] : null,
        });
      }

      toast({
        title: "Payment Processed Successfully!",
        description: `Payment of $${amount.toLocaleString()} has been processed using ${cryptoCurrency}.`,
      });

      // Refresh data
      const userPayments = await getPayments(user.id, supabase);
      setPayments(userPayments);

      // Reload loans to get updated balances (optimized query)
      const { data: updatedLoans, error: loansQueryError } = await supabase
        .from("loans")
        .select(
          `
          id,
          loan_amount,
          outstanding_balance,
          monthly_payment,
          next_payment_date,
          loan_status,
          assets!loans_asset_id_fkey (
            id,
            name,
            asset_type
          )
        `
        )
        .eq("user_id", user.id)
        .in("loan_status", ["active", "completed"])
        .order("created_at", { ascending: false })
        .limit(20);

      if (loansQueryError) {
        console.error("Error reloading loans:", loansQueryError);
      }

      setLoans(updatedLoans || []);
    } catch (error) {
      console.error("Payment processing error:", error);
      toast({
        title: "Payment Failed",
        description: "There was an unexpected error processing your payment.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 animate-fadeIn">
        <div className="space-y-8">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payments...</p>
          </div>
        </div>
      </main>
    );
  }

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const completedPayments = payments.filter(
    (payment) => payment.payment_status === "completed"
  ).length;
  const pendingPayments = payments.filter(
    (payment) => payment.payment_status === "pending"
  ).length;
  const totalMonthlyDue = loans.reduce(
    (sum, loan) => sum + loan.monthly_payment,
    0
  );

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 animate-fadeIn">
        <div className="space-y-8">
          {/* Header */}
          <div className="px-6 py-8">
            <div className="w-full">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                      Payment Center
                    </h1>
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Process loan payments in various cryptocurrencies
                  </p>
                  <div className="flex items-center gap-4 pt-2">
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {completedPayments} Completed
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-blue-700 border-blue-200"
                    >
                      <DollarSign className="h-3 w-3 mr-1" />$
                      {totalPaid.toLocaleString()} Total Paid
                    </Badge>
                    {pendingPayments > 0 && (
                      <Badge
                        variant="outline"
                        className="text-yellow-700 border-yellow-200"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {pendingPayments} Pending
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 space-y-8">
            <div className="w-full space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-blue-600 flex items-center gap-2 uppercase tracking-wide">
                      <DollarSign className="h-4 w-4" />
                      Total Paid
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                      ${totalPaid.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 text-blue-600 mt-2">
                      <Activity className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Lifetime Total
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-emerald-600 flex items-center gap-2 uppercase tracking-wide">
                      <CheckCircle className="h-4 w-4" />
                      Completed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                      {completedPayments}
                    </p>
                    <div className="flex items-center gap-1 text-emerald-600 mt-2">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Successful Payments
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-yellow-600 flex items-center gap-2 uppercase tracking-wide">
                      <Clock className="h-4 w-4" />
                      Pending
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                      {pendingPayments}
                    </p>
                    <div className="flex items-center gap-1 text-yellow-600 mt-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Processing</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-purple-600 flex items-center gap-2 uppercase tracking-wide">
                      <CreditCard className="h-4 w-4" />
                      This Month
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                      ${totalPaid.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 text-purple-600 mt-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm font-medium">Current Month</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Make Payment Form */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Wallet className="h-6 w-6 text-blue-600" />
                      Make Payment
                    </CardTitle>
                    <CardDescription className="text-base">
                      Process a loan payment using cryptocurrency
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <form action={handlePayment} className="space-y-6">
                      <div className="space-y-3">
                        <Label
                          htmlFor="loan_id"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Select Loan *
                        </Label>
                        <Select
                          name="loan_id"
                          required
                          value={selectedLoanId}
                          onValueChange={setSelectedLoanId}
                        >
                          <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                            <SelectValue placeholder="Choose a loan to pay" />
                          </SelectTrigger>
                          <SelectContent>
                            {loans.map((loan) => (
                              <SelectItem key={loan.id} value={loan.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span className="font-medium">
                                    {loan.assets.name}
                                  </span>
                                  <span className="text-sm text-muted-foreground ml-4">
                                    ${loan.monthly_payment.toLocaleString()}{" "}
                                    monthly
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <Label
                            htmlFor="amount"
                            className="text-sm font-semibold text-gray-700"
                          >
                            Payment Amount *
                          </Label>
                          <Input
                            id="amount"
                            name="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="2500.00"
                            required
                            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-gray-700">
                            Currency
                          </Label>
                          <Select defaultValue="USD" disabled>
                            <SelectTrigger className="h-12 border-gray-200 bg-gray-50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label
                          htmlFor="crypto_currency"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Pay with Cryptocurrency *
                        </Label>
                        <Select name="crypto_currency" required>
                          <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                            <SelectValue placeholder="Select cryptocurrency" />
                          </SelectTrigger>
                          <SelectContent>
                            {cryptoCurrencies.map((crypto) => (
                              <SelectItem
                                key={crypto.symbol}
                                value={crypto.symbol}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className="font-medium">
                                    {crypto.symbol} - {crypto.name}
                                  </span>
                                  <span className="text-sm text-muted-foreground ml-4">
                                    Rate: {crypto.rate}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label
                          htmlFor="blockchain"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Blockchain Network *
                        </Label>
                        <Select name="blockchain" required>
                          <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                            <SelectValue placeholder="Select network" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ethereum">Ethereum</SelectItem>
                            <SelectItem value="polygon">Polygon</SelectItem>
                            <SelectItem value="arbitrum">Arbitrum</SelectItem>
                            <SelectItem value="optimism">Optimism</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="border border-gray-200 bg-gray-50/30 rounded-lg p-6 space-y-3">
                        <h3 className="font-semibold text-gray-900 mb-4">
                          Payment Summary
                        </h3>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Payment Amount:
                          </span>
                          <span className="font-medium">$2,500.00</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Exchange Rate:
                          </span>
                          <span className="font-medium">1 USDC = $1.00</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Network Fee:
                          </span>
                          <span className="font-medium">~$2.50</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold text-base">
                          <span>Total Required:</span>
                          <span className="text-blue-600">2,502.50 USDC</span>
                        </div>
                      </div>

                      <SubmitButton
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                        size="lg"
                        pendingText="Processing Payment..."
                      >
                        <ArrowUpRight className="h-4 w-4 mr-2" />
                        Process Payment
                      </SubmitButton>
                    </form>
                  </CardContent>
                </Card>

                {/* Upcoming Payments */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Calendar className="h-6 w-6 text-emerald-600" />
                      Upcoming Payments
                    </CardTitle>
                    <CardDescription className="text-base">
                      Your scheduled loan payments
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    {loans && loans.length > 0 ? (
                      <div className="space-y-6">
                        {loans.slice(0, 5).map((loan) => {
                          const daysUntil = Math.ceil(
                            (new Date(loan.next_payment_date).getTime() -
                              new Date().getTime()) /
                              (1000 * 60 * 60 * 24)
                          );
                          const isOverdue = daysUntil < 0;
                          const isDueSoon = daysUntil <= 7 && daysUntil >= 0;

                          return (
                            <div
                              key={loan.id}
                              className={`p-6 rounded-xl border transition-all duration-200 ${
                                isOverdue
                                  ? "border-red-200 bg-red-50/30 shadow-md"
                                  : isDueSoon
                                    ? "border-yellow-200 bg-yellow-50/30 shadow-md"
                                    : "border-gray-200 bg-gray-50/30"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <p className="font-semibold text-lg text-gray-900">
                                    {loan.assets.name}
                                  </p>
                                  <p className="text-base text-muted-foreground">
                                    Due:{" "}
                                    {new Date(
                                      loan.next_payment_date
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-2xl text-gray-900">
                                    ${loan.monthly_payment.toLocaleString()}
                                  </p>
                                  <p
                                    className={`text-sm font-medium ${
                                      isOverdue
                                        ? "text-red-600"
                                        : isDueSoon
                                          ? "text-yellow-600"
                                          : "text-muted-foreground"
                                    }`}
                                  >
                                    {isOverdue
                                      ? `${Math.abs(daysUntil)} days overdue`
                                      : isDueSoon
                                        ? `Due in ${daysUntil} days`
                                        : `Due in ${daysUntil} days`}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="lg"
                                className="w-full"
                                variant="outline"
                                asChild
                              >
                                <a href={`/dashboard/payments?loan=${loan.id}`}>
                                  {isOverdue ? "Pay Now (Overdue)" : "Pay Now"}
                                </a>
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Calendar className="h-16 w-16 mx-auto mb-4 opacity-40" />
                        <h3 className="text-xl font-semibold mb-2 text-gray-900">
                          No upcoming payments
                        </h3>
                        <p className="text-lg">
                          All your loans are up to date!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Payment History */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-xl">Payment History</CardTitle>
                  <CardDescription className="text-base">
                    Your recent payment transactions
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  {payments && payments.length > 0 ? (
                    <div className="space-y-6">
                      {payments.map((payment) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between p-6 border border-gray-200 rounded-xl bg-gray-50/30 hover:shadow-md transition-all duration-200"
                        >
                          <div className="space-y-2">
                            <p className="font-semibold text-lg text-gray-900">
                              {payment.loans?.assets?.name || "Loan Payment"}
                            </p>
                            <p className="text-base text-muted-foreground">
                              {new Date(
                                payment.payment_date
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}{" "}
                              • {payment.crypto_currency || payment.currency}
                            </p>
                          </div>
                          <div className="text-right space-y-2">
                            <p className="font-bold text-2xl text-gray-900">
                              ${payment.amount.toLocaleString()}
                            </p>
                            <div className="flex items-center gap-3">
                              {getStatusBadge(payment.payment_status)}
                              {payment.transaction_hash && (
                                <Badge variant="outline" className="text-xs">
                                  {payment.blockchain}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <DollarSign className="h-20 w-20 mx-auto mb-6 text-muted-foreground opacity-40" />
                      <h3 className="text-2xl font-bold mb-3 text-gray-900">
                        No payment history
                      </h3>
                      <p className="text-muted-foreground text-lg">
                        Your payment transactions will appear here
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
