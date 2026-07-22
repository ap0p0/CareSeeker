export type UpdateProviderProfilePayload = {
  name?: string;
  phone?: string | null;
  bio?: string | null;
  profileImage?: string | null;
};

export type ProviderProfileResponse = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  profileImage: string | null;
  status: 'active' | 'blocked' | 'pending_verification';
  createdAt: Date;
  updatedAt: Date;
};
