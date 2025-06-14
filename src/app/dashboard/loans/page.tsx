import { createClient } from "../../../../supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  Landmark,
  Activity,
  Plus,
  Building,
  CreditCard,
  Percent,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface Loan {
  id: string;
  loan_amount: number;
  outstanding_balance: number;
  interest_rate: number;
  loan_term_months: number;
  monthly_payment: number;
  next_payment_date: string;
  loan_status: string;
  blockchain: string;
  created_at: string;
}

interface Asset {
  id: string;
  name: string;
  asset_type: string;
}

function getStatusBadge(status: string) {
  const colors = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    completed: "bg-blue-50 text-blue-700 border-blue-200",
    defaulted: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <Badge
      variant="outline"
      className={`${colors[status as keyof typeof colors] || "bg-gray-50 text-gray-700 border-gray-200"} font-medium`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function getDaysUntilPayment(dateString: string): number {
  const paymentDate = new Date(dateString);
  const today = new Date();
  const diffTime = paymentDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export default async function LoansPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: loans } = await supabase
    .from("loans")
    .select(
      `
      id,
      loan_amount,
      outstanding_balance,
      interest_rate,
      loan_term_months,
      monthly_payment,
      next_payment_date,
      loan_status,
      blockchain,
      created_at,
      assets!loans_asset_id_fkey (
        id,
        name,
        asset_type
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  const totalLoanAmount =
    loans?.reduce((sum, loan) => sum + loan.loan_amount, 0) || 0;
  const totalOutstanding =
    loans?.reduce((sum, loan) => sum + loan.outstanding_balance, 0) || 0;
  const totalMonthlyPayments =
    loans?.reduce((sum, loan) => sum + loan.monthly_payment, 0) || 0;
  const activeLoans =
    loans?.filter((loan) => loan.loan_status === "active").length || 0;

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
                      Loan Management
                    </h1>
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Track your loans and payment schedules
                  </p>
                  <div className="flex items-center gap-4 pt-2">
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {activeLoans} Active
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-blue-700 border-blue-200"
                    >
                      <DollarSign className="h-3 w-3 mr-1" />$
                      {totalOutstanding.toLocaleString()} Outstanding
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    asChild
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Link href="/dashboard/loans/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Request Loan
                    </Link>
                  </Button>
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
                      <Landmark className="h-4 w-4" />
                      Active Loans
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                      {activeLoans}
                    </p>
                    <div className="flex items-center gap-1 text-blue-600 mt-2">
                      <Activity className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Currently Active
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-emerald-600 flex items-center gap-2 uppercase tracking-wide">
                      <DollarSign className="h-4 w-4" />
                      Total Borrowed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                      ${totalLoanAmount.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 text-emerald-600 mt-2">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">Total Amount</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-purple-600 flex items-center gap-2 uppercase tracking-wide">
                      <CreditCard className="h-4 w-4" />
                      Outstanding
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                      ${totalOutstanding.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 text-purple-600 mt-2">
                      <Building className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Remaining Balance
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-orange-600 flex items-center gap-2 uppercase tracking-wide">
                      <Calendar className="h-4 w-4" />
                      Monthly Payments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                      ${totalMonthlyPayments.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 text-orange-600 mt-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">Per Month</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Loans List */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-xl">Your Loans</CardTitle>
                  <CardDescription className="text-base">
                    All your active and completed loans
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  {loans && loans.length > 0 ? (
                    <div className="space-y-8">
                      {loans.map((loan: Loan & { assets: Asset }) => {
                        const paymentProgress =
                          ((loan.loan_amount - loan.outstanding_balance) /
                            loan.loan_amount) *
                          100;
                        const daysUntilPayment = getDaysUntilPayment(
                          loan.next_payment_date
                        );
                        const isPaymentDue = daysUntilPayment <= 7;

                        return (
                          <Card
                            key={loan.id}
                            className={`border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200 ${
                              isPaymentDue
                                ? "ring-2 ring-yellow-200 bg-yellow-50/30"
                                : ""
                            }`}
                          >
                            <CardHeader className="pb-4 border-b border-gray-100">
                              <div className="flex items-start justify-between">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-3">
                                    <CardTitle className="text-2xl bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                                      ${loan.loan_amount.toLocaleString()} Loan
                                    </CardTitle>
                                    {getStatusBadge(loan.loan_status)}
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-gray-50/80 text-gray-700 border-gray-200"
                                    >
                                      {loan.blockchain}
                                    </Badge>
                                  </div>
                                  <CardDescription className="flex items-center gap-2 text-base">
                                    <Landmark className="h-5 w-5" />
                                    Collateral: {loan.assets?.name || "Asset"} (
                                    {loan.assets?.asset_type || "Unknown"})
                                  </CardDescription>
                                </div>
                                {isPaymentDue && (
                                  <Badge
                                    variant="outline"
                                    className="bg-yellow-50 text-yellow-700 border-yellow-200"
                                  >
                                    <Clock className="h-4 w-4 mr-2" />
                                    Payment Due
                                  </Badge>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-8 p-8">
                              {/* Loan Details Grid */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="border border-purple-200 bg-purple-50/30 rounded-lg p-4">
                                  <p className="text-sm font-semibold text-purple-600 mb-2 uppercase tracking-wide">
                                    Outstanding Balance
                                  </p>
                                  <p className="font-bold text-xl text-gray-900">
                                    ${loan.outstanding_balance.toLocaleString()}
                                  </p>
                                </div>
                                <div className="border border-blue-200 bg-blue-50/30 rounded-lg p-4">
                                  <p className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide">
                                    Interest Rate
                                  </p>
                                  <p className="font-bold text-xl text-gray-900 flex items-center gap-1">
                                    <Percent className="h-4 w-4" />
                                    {loan.interest_rate}%
                                  </p>
                                </div>
                                <div className="border border-emerald-200 bg-emerald-50/30 rounded-lg p-4">
                                  <p className="text-sm font-semibold text-emerald-600 mb-2 uppercase tracking-wide">
                                    Monthly Payment
                                  </p>
                                  <p className="font-bold text-xl text-gray-900">
                                    ${loan.monthly_payment.toLocaleString()}
                                  </p>
                                </div>
                                <div className="border border-orange-200 bg-orange-50/30 rounded-lg p-4">
                                  <p className="text-sm font-semibold text-orange-600 mb-2 uppercase tracking-wide">
                                    Term
                                  </p>
                                  <p className="font-bold text-xl text-gray-900">
                                    {loan.loan_term_months} months
                                  </p>
                                </div>
                              </div>

                              {/* Payment Progress */}
                              <div className="space-y-4 border border-gray-200 bg-gray-50/30 rounded-lg p-6">
                                <div className="flex justify-between items-center">
                                  <span className="text-base font-semibold text-gray-700">
                                    Loan Progress
                                  </span>
                                  <span className="text-base font-bold text-emerald-600">
                                    {paymentProgress.toFixed(1)}% paid
                                  </span>
                                </div>
                                <Progress
                                  value={paymentProgress}
                                  className="h-4"
                                />
                                <div className="flex justify-between text-sm text-muted-foreground">
                                  <span>
                                    Paid: $
                                    {(
                                      loan.loan_amount -
                                      loan.outstanding_balance
                                    ).toLocaleString()}
                                  </span>
                                  <span>
                                    Remaining: $
                                    {loan.outstanding_balance.toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              {/* Next Payment Info */}
                              <div
                                className={`p-6 rounded-xl border transition-all duration-200 ${
                                  isPaymentDue
                                    ? "bg-yellow-50/50 border-yellow-200 shadow-md"
                                    : "bg-blue-50/30 border-blue-200"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="space-y-2">
                                    <p className="font-semibold text-lg flex items-center gap-2">
                                      <Calendar className="h-5 w-5" />
                                      Next Payment Due
                                    </p>
                                    <p className="text-base text-muted-foreground">
                                      {new Date(
                                        loan.next_payment_date
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })}{" "}
                                      (
                                      {daysUntilPayment > 0
                                        ? `${daysUntilPayment} days`
                                        : "Today"}
                                      )
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-2xl text-gray-900 mb-3">
                                      ${loan.monthly_payment.toLocaleString()}
                                    </p>
                                    <Button
                                      size="lg"
                                      variant="outline"
                                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 shadow-sm hover:shadow-md transition-all duration-200"
                                      asChild
                                    >
                                      <Link
                                        href={`/dashboard/payments?loan=${loan.id}`}
                                      >
                                        Make Payment
                                      </Link>
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              <div className="text-sm text-muted-foreground pt-2 border-t border-gray-200">
                                Loan originated{" "}
                                {new Date(loan.created_at).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Landmark className="h-20 w-20 mx-auto mb-6 text-muted-foreground opacity-40" />
                      <h3 className="text-2xl font-bold mb-3 text-gray-900">
                        No loans found
                      </h3>
                      <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
                        Use your tokenized assets as collateral to secure your
                        first loan and unlock liquidity
                      </p>
                      <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="border-blue-200 text-blue-700 hover:bg-blue-50 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <Link href="/dashboard/loans/new">
                          <Plus className="h-5 w-5 mr-2" />
                          Request Your First Loan
                        </Link>
                      </Button>
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
