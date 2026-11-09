export type ClientAuthApiErrorCode =
  | "DUPLICATE_EMAIL"
  | "VALIDATION_ERROR"
  | "AUTH_SIGNUP_FAILED"
  | "UNKNOWN_ERROR";

export class ClientAuthApiError extends Error {
  code: ClientAuthApiErrorCode;

  constructor(message: string, code: ClientAuthApiErrorCode = "UNKNOWN_ERROR") {
    super(message);
    this.name = "ClientAuthApiError";
    this.code = code;
  }
}
