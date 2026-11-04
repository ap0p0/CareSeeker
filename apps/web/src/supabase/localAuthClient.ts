import type { Session } from "@supabase/supabase-js";
import type {
  AuthClient,
  AuthStateCallback,
  PasswordCredentials,
} from "./authClient";

/**
 * Offline replacement for Supabase auth (`env.authMode === "local"`).
 *
 * Signs in against the API's `POST /local-auth/sign-in` (available when the
 * API runs with `AUTH_MODE=local`), keeps the session in `localStorage` and
 * emits the same `onAuthStateChange` events the contexts already handle.
 * The session object is shaped like a Supabase `Session` so nothing else in
 * the app has to know which mode is active.
 */
const SESSION_STORAGE_KEY = "careseeker.localAuth.session";
const SIGN_IN_PATH = "/local-auth/sign-in";

type LocalSignInResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  user: { id: string; email: string };
};

const toSession = (payload: LocalSignInResponse): Session => ({
  access_token: payload.access_token,
  refresh_token: "",
  token_type: "bearer",
  expires_in: payload.expires_in,
  expires_at: payload.expires_at,
  user: {
    id: payload.user.id,
    email: payload.user.email,
    aud: "authenticated",
    role: "authenticated",
    app_metadata: {},
    user_metadata: {},
    created_at: new Date().toISOString(),
  },
});

const readStoredSession = (): Session | null => {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw) as Session;
    const expired =
      typeof session.expires_at === "number" &&
      session.expires_at * 1000 <= Date.now();

    if (!session.access_token || expired) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    return session;
  } catch {
    return null;
  }
};

const readErrorMessage = async (response: Response): Promise<string> => {
  try {
    const body = (await response.json()) as {
      message?: string | { message?: string };
    };
    const message =
      typeof body.message === "string" ? body.message : body.message?.message;
    if (message) return message;
  } catch {
    // fall through
  }

  return response.status === 404
    ? "Local sign-in is not available. Start the API with AUTH_MODE=local."
    : "Could not sign in. Please try again.";
};

export const createLocalAuthClient = (apiBaseUrl: string): AuthClient => {
  const listeners = new Set<AuthStateCallback>();

  const emit = (
    event: Parameters<AuthStateCallback>[0],
    session: Session | null,
  ) => {
    for (const listener of listeners) listener(event, session);
  };

  return {
    auth: {
      async getSession() {
        return { data: { session: readStoredSession() } };
      },

      async signInWithPassword({ email, password }: PasswordCredentials) {
        let response: Response;
        try {
          response = await fetch(`${apiBaseUrl}${SIGN_IN_PATH}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email.trim(), password }),
          });
        } catch {
          return {
            error: { message: "Could not reach the API. Is it running?" },
          };
        }

        if (!response.ok) {
          return { error: { message: await readErrorMessage(response) } };
        }

        const session = toSession(
          (await response.json()) as LocalSignInResponse,
        );
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        emit("SIGNED_IN", session);
        return { error: null };
      },

      async signOut() {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        emit("SIGNED_OUT", null);
        return { error: null };
      },

      onAuthStateChange(callback: AuthStateCallback) {
        listeners.add(callback);
        // Supabase delivers INITIAL_SESSION asynchronously; mirror that so the
        // auth contexts initialise the same way in both modes.
        const timer = setTimeout(
          () => callback("INITIAL_SESSION", readStoredSession()),
          0,
        );

        return {
          data: {
            subscription: {
              unsubscribe: () => {
                clearTimeout(timer);
                listeners.delete(callback);
              },
            },
          },
        };
      },
    },
  };
};
