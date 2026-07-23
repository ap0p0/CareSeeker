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
import { useVerifyProviderAccessMutation } from "../../../queries/provider";
import {
  hasProviderMockSession,
  isProviderDevMockEnabled,
} from "./providerDevAuth";
import {
  PROVIDER_ACCESS_DENIED_MESSAGE,
  type ProviderAppUser,
} from "./providerMe";

export type ProviderGateOutcome =
  | "provider"
  | "forbidden"
  | "unauthorized"
  | "error"
  | "no_session";

type ProviderAuthContextValue = {
  initialized: boolean;
  providerUser: ProviderAppUser | null;
  accessDeniedMessage: string | null;
  clearAccessDeniedMessage: () => void;
  signOut: () => Promise<void>;
  verifyProviderGateFromSession: () => Promise<ProviderGateOutcome>;
};

const ProviderAuthContext = createContext<ProviderAuthContextValue | null>(
  null
);

type ProviderAuthState = {
  initialized: boolean;
  providerUser: ProviderAppUser | null;
  accessDeniedMessage: string | null;
};

let providerGateChain: Promise<void> = Promise.resolve();

function queueProviderGate(fn: () => Promise<void>): Promise<void> {
  const run = providerGateChain.then(fn);
  providerGateChain = run.catch(() => {});
  return run;
}

function getDevMockProviderUser(): ProviderAppUser | null {
  if (!isProviderDevMockEnabled || !hasProviderMockSession()) {
    return null;
  }

  return {
    id: "mock-provider-user",
    role: "provider",
    providerVerificationStatus: "pending",
  };
}

async function applyProviderSession(
  session: Session | null,
  setState: Dispatch<SetStateAction<ProviderAuthState>>,
  verifyProviderAccess: (accessToken: string) => Promise<{
    status: "ok" | "forbidden" | "unauthorized" | "error";
    user?: ProviderAppUser;
  }>
): Promise<ProviderGateOutcome> {
  const devMockUser = getDevMockProviderUser();
  if (devMockUser) {
    setState({
      initialized: true,
      providerUser: devMockUser,
      accessDeniedMessage: null,
    });
    return "provider";
  }

  let effective = session;

  if (!effective?.access_token) {
    const { data } = await supabase.auth.getSession();
    effective = data.session ?? null;
  }

  if (!effective?.access_token) {
    setState((prev) => ({
      initialized: true,
      providerUser: null,
      accessDeniedMessage: prev.accessDeniedMessage,
    }));
    return "no_session";
  }

  const result = await verifyProviderAccess(effective.access_token);

  if (result.status === "ok") {
    setState({
      initialized: true,
      providerUser: result.user ?? null,
      accessDeniedMessage: null,
    });
    return "provider";
  }

  if (result.status === "forbidden") {
    await supabase.auth.signOut();
    setState({
      initialized: true,
      providerUser: null,
      accessDeniedMessage: PROVIDER_ACCESS_DENIED_MESSAGE,
    });
    return "forbidden";
  }

  if (result.status === "unauthorized") {
    await supabase.auth.signOut();
    setState({
      initialized: true,
      providerUser: null,
      accessDeniedMessage: null,
    });
    return "unauthorized";
  }

  await supabase.auth.signOut();
  setState({
    initialized: true,
    providerUser: null,
    accessDeniedMessage:
      "Could not verify provider access. Please try signing in again.",
  });
  return "error";
}

const initialState: ProviderAuthState = {
  initialized: false,
  providerUser: null,
  accessDeniedMessage: null,
};

export function ProviderAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProviderAuthState>(initialState);
  const { mutateAsync: verifyProviderAccess } =
    useVerifyProviderAccessMutation();

  const clearAccessDeniedMessage = useCallback(() => {
    setState((prev) => ({ ...prev, accessDeniedMessage: null }));
  }, []);

  const verifyProviderGateFromSession = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    let outcome: ProviderGateOutcome = "no_session";

    await queueProviderGate(async () => {
      outcome = await applyProviderSession(
        data.session ?? null,
        setState,
        verifyProviderAccess
      );
    });

    return outcome;
  }, [verifyProviderAccess]);

  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, accessDeniedMessage: null }));
    await supabase.auth.signOut();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = (session: Session | null) => {
      void queueProviderGate(async () => {
        const guardedSetState: Dispatch<SetStateAction<ProviderAuthState>> = (
          next
        ) => {
          if (!cancelled) setState(next);
        };

        await applyProviderSession(
          session,
          guardedSetState,
          verifyProviderAccess
        );
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
  }, [verifyProviderAccess]);

  const value = useMemo<ProviderAuthContextValue>(
    () => ({
      initialized: state.initialized,
      providerUser: state.providerUser,
      accessDeniedMessage: state.accessDeniedMessage,
      clearAccessDeniedMessage,
      signOut,
      verifyProviderGateFromSession,
    }),
    [
      state.initialized,
      state.providerUser,
      state.accessDeniedMessage,
      clearAccessDeniedMessage,
      signOut,
      verifyProviderGateFromSession,
    ]
  );

  return (
    <ProviderAuthContext.Provider value={value}>
      {children}
    </ProviderAuthContext.Provider>
  );
}

export function useProviderAuth(): ProviderAuthContextValue {
  const ctx = useContext(ProviderAuthContext);

  if (!ctx) {
    throw new Error("useProviderAuth must be used within ProviderAuthProvider");
  }

  return ctx;
}
