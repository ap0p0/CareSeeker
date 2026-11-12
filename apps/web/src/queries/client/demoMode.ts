/**
 * Demo mode ("Explore with sample data" on the login page): a signed-in
 * session that lives only in the browser and shows the sample data, for
 * presentations. Nothing in it talks to the API — no account, no backend
 * needed — and nothing is saved to a real account.
 *
 * The flag is kept in `localStorage` so a demo survives reloads and job
 * links opened in new tabs; logging out ends it.
 */
const DEMO_SESSION_KEY = "careseeker.demoSession";

export const isDemoSession = (): boolean => {
  try {
    return localStorage.getItem(DEMO_SESSION_KEY) === "1";
  } catch {
    return false;
  }
};

export const startDemoSession = (): void => {
  try {
    localStorage.setItem(DEMO_SESSION_KEY, "1");
  } catch {
    // Storage unavailable: the demo lasts until the page is reloaded.
  }
};

export const endDemoSession = (): void => {
  try {
    localStorage.removeItem(DEMO_SESSION_KEY);
  } catch {
    // Nothing stored.
  }
};

/** The seeker of a demo session. */
export const DEMO_SEEKER = {
  id: "demo-seeker",
  role: "seeker" as const,
  providerVerificationStatus: null,
};
