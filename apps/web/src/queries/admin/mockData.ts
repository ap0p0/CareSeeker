import type {
  AdminCareProviderRow,
  AdminCareseekerRow,
  AdminDashboardSummary,
  AdminOpenJobRow,
  AdminPaymentRow,
  AdminRecentActivityItem,
  AdminReportRow,
} from "./types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchMockDashboard(): Promise<{
  summary: AdminDashboardSummary;
  recentActivity: AdminRecentActivityItem[];
}> {
  await delay(200);
  return {
    summary: {
      totalUsers: 12840,
      totalCareseekers: 8420,
      totalCareProviders: 4420,
      openJobs: 312,
      paymentsTotalCents: 4_820_500_00,
      pendingProviderVerifications: 47,
      activeSubscriptions: 2103,
      needsAttentionCount: 12,
    },
    recentActivity: [
      {
        id: "a1",
        at: "2026-03-29T10:12:00Z",
        message: "New care provider registration — pending verification",
      },
      {
        id: "a2",
        at: "2026-03-29T09:40:00Z",
        message: "Payment completed for job #JOB-2048",
      },
      {
        id: "a3",
        at: "2026-03-29T08:05:00Z",
        message: "Open job posted — overnight care (72h)",
      },
      {
        id: "a4",
        at: "2026-03-28T17:22:00Z",
        message: "Subscription renewed — Careseeker Plus",
      },
    ],
  };
}

export async function fetchMockCareseekers(): Promise<AdminCareseekerRow[]> {
  await delay(180);
  return [
    {
      id: "cs-001",
      name: "Jordan Lee",
      email: "jordan.lee@example.com",
      status: "active",
      joinedAt: "2025-11-02",
      city: "Austin",
    },
    {
      id: "cs-002",
      name: "Sam Rivera",
      email: "sam.r@example.com",
      status: "pending",
      joinedAt: "2026-03-20",
      city: "Denver",
    },
    {
      id: "cs-003",
      name: "Taylor Kim",
      email: "t.kim@example.com",
      status: "active",
      joinedAt: "2025-08-14",
      city: "Seattle",
    },
    {
      id: "cs-004",
      name: "Riley Chen",
      email: "riley.c@example.com",
      status: "inactive",
      joinedAt: "2024-12-01",
      city: "Chicago",
    },
    {
      id: "cs-005",
      name: "Morgan Patel",
      email: "morgan.p@example.com",
      status: "active",
      joinedAt: "2026-01-09",
      city: "Miami",
    },
  ];
}

export async function fetchMockCareProviders(): Promise<
  AdminCareProviderRow[]
> {
  await delay(180);
  return [
    {
      id: "cp-101",
      name: "Alex Johnson",
      email: "alex.j@example.com",
      verificationStatus: "verified",
      specialty: "RN — home health",
      joinedAt: "2025-06-11",
    },
    {
      id: "cp-102",
      name: "Casey Brown",
      email: "casey.b@example.com",
      verificationStatus: "pending",
      specialty: "CNA",
      joinedAt: "2026-03-25",
    },
    {
      id: "cp-103",
      name: "Drew Martinez",
      email: "drew.m@example.com",
      verificationStatus: "verified",
      specialty: "Physical therapy aide",
      joinedAt: "2025-02-28",
    },
    {
      id: "cp-104",
      name: "Jamie Wilson",
      email: "jamie.w@example.com",
      verificationStatus: "rejected",
      specialty: "Companion care",
      joinedAt: "2026-02-02",
    },
  ];
}

export async function fetchMockOpenJobs(): Promise<AdminOpenJobRow[]> {
  await delay(180);
  return [
    {
      id: "job-5001",
      title: "Overnight support — 2 nights",
      careseeker: "Jordan Lee",
      status: "open",
      postedAt: "2026-03-28",
      budgetLabel: "$420–$520",
    },
    {
      id: "job-5002",
      title: "Weekday daytime — dementia care",
      careseeker: "Taylor Kim",
      status: "open",
      postedAt: "2026-03-27",
      budgetLabel: "$35/hr",
    },
    {
      id: "job-5003",
      title: "Post-op check-ins (3 visits)",
      careseeker: "Morgan Patel",
      status: "filled",
      postedAt: "2026-03-10",
      budgetLabel: "$280 flat",
    },
    {
      id: "job-5004",
      title: "Weekend respite",
      careseeker: "Sam Rivera",
      status: "cancelled",
      postedAt: "2026-03-05",
      budgetLabel: "$400–$480",
    },
  ];
}

export async function fetchMockPayments(): Promise<AdminPaymentRow[]> {
  await delay(180);
  return [
    {
      id: "pay-9001",
      paidAt: "2026-03-29T09:40:00Z",
      amountCents: 12500,
      currency: "USD",
      payer: "Jordan Lee",
      payee: "Alex Johnson",
      status: "completed",
    },
    {
      id: "pay-9002",
      paidAt: "2026-03-28T14:10:00Z",
      amountCents: 8800,
      currency: "USD",
      payer: "Taylor Kim",
      payee: "Drew Martinez",
      status: "completed",
    },
    {
      id: "pay-9003",
      paidAt: "2026-03-28T11:00:00Z",
      amountCents: 15000,
      currency: "USD",
      payer: "Morgan Patel",
      payee: "Platform fee",
      status: "pending",
    },
    {
      id: "pay-9004",
      paidAt: "2026-03-27T08:55:00Z",
      amountCents: 4200,
      currency: "USD",
      payer: "Riley Chen",
      payee: "Casey Brown",
      status: "failed",
    },
  ];
}

export async function fetchMockReports(): Promise<AdminReportRow[]> {
  await delay(180);
  return [
    {
      id: "rep-01",
      name: "Monthly revenue summary",
      category: "Finance",
      generatedAt: "2026-03-01T07:00:00Z",
      status: "ready",
    },
    {
      id: "rep-02",
      name: "Provider verification backlog",
      category: "Compliance",
      generatedAt: "2026-03-28T16:30:00Z",
      status: "ready",
    },
    {
      id: "rep-03",
      name: "Job fill rate — Q1",
      category: "Operations",
      generatedAt: "2026-03-29T00:00:00Z",
      status: "scheduled",
    },
    {
      id: "rep-04",
      name: "Churn risk — subscriptions",
      category: "Growth",
      generatedAt: "2026-03-15T12:00:00Z",
      status: "failed",
    },
  ];
}
