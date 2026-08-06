import axios, { AxiosError, type AxiosInstance } from "axios";
import { env } from "../config/env";

export type ApiErrorBody = {
  code?: string;
  message?: string | string[] | { code?: string; message?: string | string[] };
  errors?: string[];
};

export const httpClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export const isAxiosError = axios.isAxiosError;

export const getApiErrorStatus = (error: unknown): number | undefined => {
  if (!axios.isAxiosError(error)) {
    return undefined;
  }

  return error.response?.status;
};

export const getApiErrorBody = (error: unknown): ApiErrorBody | null => {
  if (!axios.isAxiosError(error)) {
    return null;
  }

  const data = error.response?.data;
  if (!data || typeof data !== "object") {
    return null;
  }

  return data as ApiErrorBody;
};

export const getApiErrorCode = (error: unknown): string | undefined => {
  const body = getApiErrorBody(error);
  if (!body) {
    return undefined;
  }

  if (typeof body.code === "string" && body.code.trim().length > 0) {
    return body.code;
  }

  if (
    body.message &&
    typeof body.message === "object" &&
    !Array.isArray(body.message) &&
    typeof body.message.code === "string"
  ) {
    return body.message.code;
  }

  return undefined;
};

const normalizeMessage = (
  message: ApiErrorBody["message"],
): string | undefined => {
  if (typeof message === "string" && message.trim().length > 0) {
    return message;
  }

  if (Array.isArray(message) && message.length > 0) {
    return message.join(", ");
  }

  if (message && typeof message === "object" && !Array.isArray(message)) {
    const nested = message.message;

    if (typeof nested === "string" && nested.trim().length > 0) {
      return nested;
    }

    if (Array.isArray(nested) && nested.length > 0) {
      return nested.join(", ");
    }
  }

  return undefined;
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string => {
  const body = getApiErrorBody(error);

  if (Array.isArray(body?.errors) && body.errors.length > 0) {
    return body.errors.join(", ");
  }

  const fromBody = normalizeMessage(body?.message);
  if (fromBody) {
    return fromBody;
  }

  if (error instanceof AxiosError && error.message) {
    return error.message;
  }

  return fallback;
};
