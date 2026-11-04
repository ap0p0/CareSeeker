import { supabase } from "./supabase";

/** Current access token for authenticated API calls, or `null` when signed out. */
export const getAccessToken = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
};
