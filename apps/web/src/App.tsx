import { useEffect, useState } from "react";
import { supabase } from "./supabase/supabase";
import type { Session } from "@supabase/supabase-js";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) =>
      setSession(s)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "test@careseeker.com",
      password: "test",
    });
    console.log("signIn data:", data);
    console.log("signIn error:", error);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div style={{ padding: 24 }}>
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <button onClick={signIn}>Sign in</button>
      <button onClick={signOut}>Sign out</button>
    </div>
  );
}
