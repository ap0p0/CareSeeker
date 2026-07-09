const MOCK_SESSION_KEY = "careseeker.provider.mockSession";

export type ProviderMockSession = {
  email: string;
  name: string;
};

export const isProviderDevMockEnabled = import.meta.env.DEV;

export function getProviderMockSession(): ProviderMockSession | null {
  if (!isProviderDevMockEnabled) return null;

  try {
    const raw = sessionStorage.getItem(MOCK_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ProviderMockSession;
  } catch {
    return null;
  }
}

export function setProviderMockSession(
  session: ProviderMockSession = {
    email: "provider.demo@careseeker.local",
    name: "Demo Provider",
  }
): void {
  if (!isProviderDevMockEnabled) return;
  sessionStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session));
}

export function clearProviderMockSession(): void {
  sessionStorage.removeItem(MOCK_SESSION_KEY);
}

export function hasProviderMockSession(): boolean {
  return getProviderMockSession() !== null;
}
