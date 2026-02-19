import { useEffect, useState } from "react";
import { supabase } from "../../../supabase/supabase";

const AUTH_TEST_EMAIL = "auth-test@careseeker.example.com";

const AuthTestPage = () => {
  const [session, setSession] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const supabaseInitialized =
    typeof supabase !== "undefined" && typeof supabase?.auth !== "undefined";

  useEffect(() => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY as
      | string
      | undefined;
    const keyPrefix = key ? key.slice(0, 8) : "(empty)";
    console.log("[AuthTest] VITE_SUPABASE_URL:", url);
    console.log(
      "[AuthTest] VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY (first 8):",
      keyPrefix
    );
  }, []);

  const handleGetSession = async () => {
    setError(null);
    try {
      const { data, error: err } = await supabase.auth.getSession();
      if (err) throw err;
      setSession(data);
    } catch (e) {
      setError(String(e));
      setSession(null);
    }
  };

  const handleMagicLink = async () => {
    setError(null);
    try {
      const { data, error: err } = await supabase.auth.signInWithOtp({
        email: AUTH_TEST_EMAIL,
      });
      if (err) throw err;
      setSession(data);
    } catch (e) {
      setError(String(e));
    }
  };

  const handleSignOut = async () => {
    setError(null);
    try {
      await supabase.auth.signOut();
      setSession(null);
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <div>
      <h1>Auth Test (Client Variant)</h1>
      <p>VITE_APP_VARIANT: {import.meta.env.VITE_APP_VARIANT ?? "(not set)"}</p>
      <p>
        Supabase client initialized successfully: {String(supabaseInitialized)}
      </p>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <div>
        <button type="button" onClick={handleGetSession}>
          Get Session
        </button>
        <button type="button" onClick={handleMagicLink}>
          Sign in with Magic Link
        </button>
        <button type="button" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
      {session !== null && <pre>{JSON.stringify(session, null, 2)}</pre>}
    </div>
  );
};

export default AuthTestPage;
