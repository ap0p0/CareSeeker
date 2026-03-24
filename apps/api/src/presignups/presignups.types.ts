export type SeekerPresignupRequest = {
  name: string;
  surname: string;
  email: string;
  accepted: boolean;
};

export type ProviderPresignupRequest = {
  name: string;
  surname: string;
  email: string;
  state: string;
  city: string;
  phone?: string;
  accepted: boolean;
};

export type PresignupValidationResult<T> =
  | { isValid: true; value: T }
  | { isValid: false; errors: string[] };
