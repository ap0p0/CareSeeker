export const queryKeys = {
  presignups: {
    all: ["presignups"] as const,
    seeker: () => [...queryKeys.presignups.all, "seeker"] as const,
    provider: () => [...queryKeys.presignups.all, "provider"] as const,
  },
  admin: {
    all: ["admin"] as const,
    dashboard: () => [...queryKeys.admin.all, "dashboard"] as const,
    careseekers: () => [...queryKeys.admin.all, "careseekers"] as const,
    careProviders: () => [...queryKeys.admin.all, "careProviders"] as const,
    openJobs: () => [...queryKeys.admin.all, "openJobs"] as const,
    paymentsHistory: () => [...queryKeys.admin.all, "paymentsHistory"] as const,
    reports: () => [...queryKeys.admin.all, "reports"] as const,
  },
} as const;
