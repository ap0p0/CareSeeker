import {
  getApiErrorBody,
  getApiErrorMessage,
  getApiErrorStatus,
  httpClient,
} from "../../api/httpClient";

export type PresignupApiErrorCode =
  | "VALIDATION_ERROR"
  | "DUPLICATE_EMAIL"
  | "UNKNOWN_ERROR";

export class PresignupApiError extends Error {
  code: PresignupApiErrorCode;
  details?: string[];

  constructor(
    message: string,
    code: PresignupApiErrorCode,
    details?: string[],
  ) {
    super(message);
    this.name = "PresignupApiError";
    this.code = code;
    this.details = details;
  }
}

export const parsePresignupError = (error: unknown): PresignupApiError => {
  const status = getApiErrorStatus(error);
  const body = getApiErrorBody(error);
  const message = getApiErrorMessage(
    error,
    "Unable to submit presignup right now",
  );

  if (status === 409 || body?.code === "DUPLICATE_EMAIL") {
    return new PresignupApiError(
      "This email is already registered. You will be notified when we launch.",
      "DUPLICATE_EMAIL",
    );
  }

  if (status === 400 || body?.code === "VALIDATION_ERROR") {
    return new PresignupApiError(message, "VALIDATION_ERROR", body?.errors);
  }

  return new PresignupApiError(message, "UNKNOWN_ERROR");
};

export const postPresignup = async <TPayload>(
  path: string,
  payload: TPayload,
): Promise<void> => {
  try {
    await httpClient.post(path, payload);
  } catch (error) {
    throw parsePresignupError(error);
  }
};
