export type CreateReviewPayload = {
  careSeekerId: string;
  rating: number;
  comment?: string;
};

export type UpdateReviewPayload = {
  rating?: number;
  comment?: string;
};
