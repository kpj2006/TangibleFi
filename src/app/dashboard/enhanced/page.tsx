import { Metadata } from "next";
import EnhancedDashboard from "@/components/dashboard/EnhancedDashboard";

export const metadata: Metadata = {
  title: "Enhanced Dashboard - TangibleFi",
  description:
    "Advanced portfolio analytics, DeFi opportunities, and real-time market insights for tokenized real-world assets.",
};

export default function EnhancedDashboardPage() {
  return <EnhancedDashboard />;
}
