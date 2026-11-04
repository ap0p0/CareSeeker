import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

/**
 * The slice of the Supabase auth API the web apps actually use. Both the real
 * Supabase client and the offline local client satisfy it, so call sites keep
 * using `supabase.auth.*` regardless of `env.authMode`.
 */
export type AuthError = { message: string };

export type PasswordCredentials = { email: string; password: string };

export type AuthStateCallback = (
  event: AuthChangeEvent,
  session: Session | null,
) => void;

export type AuthClient = {
  auth: {
    getSession(): Promise<{ data: { session: Session | null } }>;
    signInWithPassword(
      credentials: PasswordCredentials,
    ): Promise<{ error: AuthError | null }>;
    signOut(): Promise<{ error: AuthError | null }>;
    onAuthStateChange(callback: AuthStateCallback): {
      data: { subscription: { unsubscribe: () => void } };
    };
  };
};
