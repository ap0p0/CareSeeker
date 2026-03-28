export const queryKeys = {
  presignups: {
    all: ["presignups"] as const,
    seeker: () => [...queryKeys.presignups.all, "seeker"] as const,
    provider: () => [...queryKeys.presignups.all, "provider"] as const,
  },
} as const;
