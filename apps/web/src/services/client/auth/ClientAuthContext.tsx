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
import { SEEKER_ACCESS_DENIED_MESSAGE, type ClientAppUser } from "./seekerMe";
import { useVerifySeekerAccessMutation } from "../../../queries/client";

export type ClientGateOutcome =
  | "seeker"
  | "forbidden"
  | "unauthorized"
  | "error"
  | "no_session";

type ClientAuthContextValue = {
  initialized: boolean;
  seekerUser: ClientAppUser | null;
  accessDeniedMessage: string | null;
  clearAccessDeniedMessage: () => void;
  signOut: () => Promise<void>;
  verifySeekerGateFromSession: () => Promise<ClientGateOutcome>;
};

const ClientAuthContext = createContext<ClientAuthContextValue | null>(null);

type ClientAuthState = {
  initialized: boolean;
  seekerUser: ClientAppUser | null;
  accessDeniedMessage: string | null;
};

let clientGateChain: Promise<void> = Promise.resolve();

function queueClientGate(fn: () => Promise<void>): Promise<void> {
  const run = clientGateChain.then(fn);
  clientGateChain = run.catch(() => {});
  return run;
}

async function applyClientSession(
  session: Session | null,
  setState: Dispatch<SetStateAction<ClientAuthState>>,
  verifySeekerAccess: (accessToken: string) => Promise<{
    status: "ok" | "forbidden" | "unauthorized" | "error";
    user?: ClientAppUser;
  }>,
): Promise<ClientGateOutcome> {
  let effective = session;

  if (!effective?.access_token) {
    const { data } = await supabase.auth.getSession();
    effective = data.session ?? null;
  }

  if (!effective?.access_token) {
    setState((prev) => ({
      initialized: true,
      seekerUser: null,
      accessDeniedMessage: prev.accessDeniedMessage,
    }));
    return "no_session";
  }

  const result = await verifySeekerAccess(effective.access_token);

  if (result.status === "ok") {
    setState({
      initialized: true,
      seekerUser: result.user ?? null,
      accessDeniedMessage: null,
    });
    return "seeker";
  }

  if (result.status === "forbidden") {
    await supabase.auth.signOut();
    setState({
      initialized: true,
      seekerUser: null,
      accessDeniedMessage: SEEKER_ACCESS_DENIED_MESSAGE,
    });
    return "forbidden";
  }

  if (result.status === "unauthorized") {
    await supabase.auth.signOut();
    setState({
      initialized: true,
      seekerUser: null,
      accessDeniedMessage: null,
    });
    return "unauthorized";
  }

  await supabase.auth.signOut();
  setState({
    initialized: true,
    seekerUser: null,
    accessDeniedMessage:
      "Could not verify client access. Please try signing in again.",
  });
  return "error";
}

const initialState: ClientAuthState = {
  initialized: false,
  seekerUser: null,
  accessDeniedMessage: null,
};

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ClientAuthState>(initialState);
  const { mutateAsync: verifySeekerAccess } = useVerifySeekerAccessMutation();

  const clearAccessDeniedMessage = useCallback(() => {
    setState((prev) => ({ ...prev, accessDeniedMessage: null }));
  }, []);

  const verifySeekerGateFromSession = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    let outcome: ClientGateOutcome = "no_session";

    await queueClientGate(async () => {
      outcome = await applyClientSession(
        data.session ?? null,
        setState,
        verifySeekerAccess,
      );
    });

    return outcome;
  }, [verifySeekerAccess]);

  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, accessDeniedMessage: null }));
    await supabase.auth.signOut();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = (session: Session | null) => {
      void queueClientGate(async () => {
        const guardedSetState: Dispatch<SetStateAction<ClientAuthState>> = (
          next,
        ) => {
          if (!cancelled) setState(next);
        };

        await applyClientSession(session, guardedSetState, verifySeekerAccess);
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
  }, [verifySeekerAccess]);

  const value = useMemo<ClientAuthContextValue>(
    () => ({
      initialized: state.initialized,
      seekerUser: state.seekerUser,
      accessDeniedMessage: state.accessDeniedMessage,
      clearAccessDeniedMessage,
      signOut,
      verifySeekerGateFromSession,
    }),
    [
      state.initialized,
      state.seekerUser,
      state.accessDeniedMessage,
      clearAccessDeniedMessage,
      signOut,
      verifySeekerGateFromSession,
    ],
  );

  return (
    <ClientAuthContext.Provider value={value}>
      {children}
    </ClientAuthContext.Provider>
  );
}

export function useClientAuth(): ClientAuthContextValue {
  const ctx = useContext(ClientAuthContext);

  if (!ctx) {
    throw new Error("useClientAuth must be used within ClientAuthProvider");
  }

  return ctx;
}
