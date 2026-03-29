export type AdminDashboardSummary = {
  totalUsers: number;
  totalCareseekers: number;
  totalCareProviders: number;
  openJobs: number;
  paymentsTotalCents: number;
  pendingProviderVerifications: number;
  activeSubscriptions: number;
  needsAttentionCount: number;
};

export type AdminRecentActivityItem = {
  id: string;
  at: string;
  message: string;
};

export type AdminCareseekerRow = {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive" | "pending";
  joinedAt: string;
  city: string;
};

export type AdminCareProviderRow = {
  id: string;
  name: string;
  email: string;
  verificationStatus: "verified" | "pending" | "rejected";
  specialty: string;
  joinedAt: string;
};

export type AdminOpenJobRow = {
  id: string;
  title: string;
  careseeker: string;
  status: "open" | "filled" | "cancelled";
  postedAt: string;
  budgetLabel: string;
};

export type AdminPaymentRow = {
  id: string;
  paidAt: string;
  amountCents: number;
  currency: string;
  payer: string;
  payee: string;
  status: "completed" | "pending" | "failed";
};

export type AdminReportRow = {
  id: string;
  name: string;
  category: string;
  generatedAt: string;
  status: "ready" | "scheduled" | "failed";
};
