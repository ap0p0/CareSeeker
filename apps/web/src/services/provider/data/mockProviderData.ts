export type ProviderDashboardData = {
  stats: {
    activeRequests: number;
    completedJobs: number;
    profileCompletion: number;
    weeklyHours: number;
  };
  recentRequests: {
    id: string;
    seekerName: string;
    serviceType: string;
    requestedAt: string;
    status: "pending" | "accepted";
  }[];
  verificationStatus: "pending" | "approved" | "rejected";
  availabilitySummary: string;
};

export type ProviderCareRequest = {
  id: string;
  seekerName: string;
  serviceType: string;
  location: string;
  schedule: string;
  status: "pending" | "active" | "completed" | "rejected";
  notes: string;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchProviderDashboardData(): Promise<ProviderDashboardData> {
  await delay(500);

  return {
    stats: {
      activeRequests: 3,
      completedJobs: 24,
      profileCompletion: 72,
      weeklyHours: 18,
    },
    recentRequests: [
      {
        id: "req-101",
        seekerName: "Maria Lopez",
        serviceType: "Elderly companionship",
        requestedAt: "2 hours ago",
        status: "pending",
      },
      {
        id: "req-102",
        seekerName: "James Carter",
        serviceType: "Post-surgery support",
        requestedAt: "Yesterday",
        status: "accepted",
      },
    ],
    verificationStatus: "pending",
    availabilitySummary: "Available Mon–Fri, 9:00 AM – 5:00 PM",
  };
}

export async function fetchProviderCareRequests(
  filter: "all" | "active" | "completed" = "all",
): Promise<ProviderCareRequest[]> {
  await delay(450);

  const requests: ProviderCareRequest[] = [
    {
      id: "req-101",
      seekerName: "Maria Lopez",
      serviceType: "Elderly companionship",
      location: "Downtown",
      schedule: "Mon, Wed, Fri · 10:00 AM – 2:00 PM",
      status: "pending",
      notes: "Looking for a warm and reliable caregiver.",
    },
    {
      id: "req-102",
      seekerName: "James Carter",
      serviceType: "Post-surgery support",
      location: "Westside",
      schedule: "Tue, Thu · 8:00 AM – 12:00 PM",
      status: "active",
      notes: "Needs mobility assistance during recovery.",
    },
    {
      id: "req-103",
      seekerName: "Elena Brooks",
      serviceType: "Child care",
      location: "North Park",
      schedule: "Completed last week",
      status: "completed",
      notes: "After-school support for two children.",
    },
  ];

  if (filter === "active") {
    return requests.filter((request) => request.status === "active");
  }

  if (filter === "completed") {
    return requests.filter((request) => request.status === "completed");
  }

  return requests;
}

export async function fetchProviderCareRequestById(
  requestId: string,
): Promise<ProviderCareRequest | null> {
  const requests = await fetchProviderCareRequests("all");
  return requests.find((request) => request.id === requestId) ?? null;
}
