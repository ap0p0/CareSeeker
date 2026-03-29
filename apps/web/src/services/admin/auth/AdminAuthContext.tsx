import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { supabase } from "../../../supabase/supabase";
import {
  ADMIN_ACCESS_DENIED_MESSAGE,
  fetchAdminMe,
  type AdminAppUser,
} from "./adminMe";

export type AdminGateOutcome =
  | "admin"
  | "forbidden"
  | "unauthorized"
  | "error"
  | "no_session";

type AdminAuthContextValue = {
  initialized: boolean;
  adminUser: AdminAppUser | null;
  /** Set when a signed-in user failed the admin check (after sign-out). */
  accessDeniedMessage: string | null;
  clearAccessDeniedMessage: () => void;
  signOut: () => Promise<void>;
  /**
   * Loads the current Supabase session and validates admin via GET /admin/me.
   * Updates context state. Used after password login and by the auth listener.
   */
  verifyAdminGateFromSession: () => Promise<AdminGateOutcome>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

type AdminAuthState = {
  initialized: boolean;
  adminUser: AdminAppUser | null;
  accessDeniedMessage: string | null;
};

/** Serialize admin gate work so parallel onAuthStateChange + login verify don’t interleave. */
let adminGateChain: Promise<void> = Promise.resolve();

function queueAdminGate(fn: () => Promise<void>): Promise<void> {
  const run = adminGateChain.then(fn);
  adminGateChain = run.catch(() => {});
  return run;
}

/**
 * Single pipeline: session token → GET /admin/me → state + sign-out when not allowed.
 * All admin authorization flows go through here (auth listener + post-login verify).
 */
async function applyAdminSession(
  session: Session | null,
  setState: Dispatch<SetStateAction<AdminAuthState>>,
): Promise<AdminGateOutcome> {
  // Callback sometimes delivers null briefly while storage still has a session (race / Strict Mode).
  let effective = session;
  if (!effective?.access_token) {
    const { data } = await supabase.auth.getSession();
    effective = data.session ?? null;
  }

  if (!effective?.access_token) {
    setState((prev) => ({
      initialized: true,
      adminUser: null,
      accessDeniedMessage: prev.accessDeniedMessage,
    }));
    return "no_session";
  }

  const result = await fetchAdminMe(effective.access_token);

  if (result.status === "ok") {
    setState({
      initialized: true,
      adminUser: result.user,
      accessDeniedMessage: null,
    });
    return "admin";
  }

  if (result.status === "forbidden") {
    await supabase.auth.signOut();
    setState({
      initialized: true,
      adminUser: null,
      accessDeniedMessage: ADMIN_ACCESS_DENIED_MESSAGE,
    });
    return "forbidden";
  }

  if (result.status === "unauthorized") {
    await supabase.auth.signOut();
    setState({
      initialized: true,
      adminUser: null,
      accessDeniedMessage: null,
    });
    return "unauthorized";
  }

  await supabase.auth.signOut();
  setState({
    initialized: true,
    adminUser: null,
    accessDeniedMessage:
      "Could not verify administrator access. Please try signing in again.",
  });
  return "error";
}

const initialState: AdminAuthState = {
  initialized: false,
  adminUser: null,
  accessDeniedMessage: null,
};

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminAuthState>(initialState);

  const clearAccessDeniedMessage = useCallback(() => {
    setState((s) => ({ ...s, accessDeniedMessage: null }));
  }, []);

  const verifyAdminGateFromSession = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    let outcome: AdminGateOutcome = "no_session";
    await queueAdminGate(async () => {
      outcome = await applyAdminSession(data.session ?? null, setState);
    });
    return outcome;
  }, []);

  const signOut = useCallback(async () => {
    setState((s) => ({
      ...s,
      accessDeniedMessage: null,
    }));
    await supabase.auth.signOut();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = (session: Session | null) => {
      void queueAdminGate(async () => {
        const guardedSetState: Dispatch<SetStateAction<AdminAuthState>> = (
          next,
        ) => {
          if (!cancelled) setState(next);
        };
        await applyAdminSession(session, guardedSetState);
      });
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      run(session);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      initialized: state.initialized,
      adminUser: state.adminUser,
      accessDeniedMessage: state.accessDeniedMessage,
      clearAccessDeniedMessage,
      signOut,
      verifyAdminGateFromSession,
    }),
    [
      state.initialized,
      state.adminUser,
      state.accessDeniedMessage,
      clearAccessDeniedMessage,
      signOut,
      verifyAdminGateFromSession,
    ],
  );

  return (
    <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
}
