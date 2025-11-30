// Simple session management using localStorage
export const AUTH_KEY = 'ostomy_auth_session';

export interface AuthSession {
  userId: string;
  email: string;
  loginTime: number;
}

export function setAuthSession(session: AuthSession): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  }
}

export function getAuthSession(): AuthSession | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function clearAuthSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_KEY);
  }
}

export function isAuthenticated(): boolean {
  return getAuthSession() !== null;
}

// Simple credential validation (replace with real authentication)
export function validateCredentials(email: string, password: string): boolean {
  // TODO: Replace with actual API call to your backend
  // For now, using a simple check for demo purposes
  return email === 'admin@ostomy.com' && password === 'admin123';
}
