export type AvailabilityPayload = {
  dayOfWeek?: number;
  date?: string;
  startTime: string;
  endTime: string;
};

export type AvailabilityUpdatePayload = Partial<AvailabilityPayload>;
