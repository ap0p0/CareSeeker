export type ProviderAuthApiErrorCode =
  | "DUPLICATE_EMAIL"
  | "VALIDATION_ERROR"
  | "AUTH_SIGNUP_FAILED"
  | "UNKNOWN_ERROR";

export class ProviderAuthApiError extends Error {
  code: ProviderAuthApiErrorCode;

  constructor(
    message: string,
    code: ProviderAuthApiErrorCode = "UNKNOWN_ERROR",
  ) {
    super(message);
    this.name = "ProviderAuthApiError";
    this.code = code;
  }
}
