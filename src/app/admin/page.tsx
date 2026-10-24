import type { Metadata } from "next";
import { LeadsDashboard } from "@/components/admin/LeadsDashboard";

export const metadata: Metadata = { title: "Заявки — админка", robots: { index: false, follow: false } };

export default function AdminPage() {
  return <LeadsDashboard />;
}
