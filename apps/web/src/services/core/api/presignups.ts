import { env } from "../../../config/env";

export type SeekerPresignupPayload = {
  name: string;
  surname: string;
  email: string;
  accepted: boolean;
};

export type ProviderPresignupPayload = {
  name: string;
  surname: string;
  email: string;
  state: string;
  city: string;
  phone?: string;
  accepted: boolean;
};

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
    details?: string[]
  ) {
    super(message);
    this.name = "PresignupApiError";
    this.code = code;
    this.details = details;
  }
}

const buildApiUrl = (path: string) => {
  const baseUrl = env.apiBaseUrl?.trim();
  if (!baseUrl) {
    throw new PresignupApiError(
      "API endpoint is not configured. Please set VITE_API_BASE_URL for this deployment.",
      "UNKNOWN_ERROR"
    );
  }

  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

const parseErrorResponse = async (
  response: Response
): Promise<PresignupApiError> => {
  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  const body = payload as {
    code?: string;
    message?: string | string[];
    errors?: string[];
  } | null;

  const rawMessage = body?.message;
  const message = Array.isArray(rawMessage)
    ? rawMessage.join(", ")
    : (rawMessage ?? "Unable to submit presignup right now");

  if (response.status === 409 || body?.code === "DUPLICATE_EMAIL") {
    return new PresignupApiError(
      "This email is already registered. You will be notified when we launch.",
      "DUPLICATE_EMAIL"
    );
  }

  if (response.status === 400 || body?.code === "VALIDATION_ERROR") {
    return new PresignupApiError(message, "VALIDATION_ERROR", body?.errors);
  }

  return new PresignupApiError(message, "UNKNOWN_ERROR");
};

const submitPresignup = async <TPayload>(
  path: string,
  payload: TPayload
): Promise<void> => {
  const response = await fetch(buildApiUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }
};

export const submitSeekerPresignup = (payload: SeekerPresignupPayload) =>
  submitPresignup("/presignups/seeker", payload);

export const submitProviderPresignup = (payload: ProviderPresignupPayload) =>
  submitPresignup("/presignups/provider", payload);
