
const AUTH_TOKEN_KEY = "ednerve_auth_token";

export const authToken = {
  get(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  set(token: string): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  },

  clear(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  exists(): boolean {
    return Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
  },
};
