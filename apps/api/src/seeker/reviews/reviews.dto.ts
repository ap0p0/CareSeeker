export type CreateReviewDto = {
  providerId: string;
  rating: number;
  comment?: string;
};

export type UpdateReviewDto = {
  rating?: number;
  comment?: string;
};