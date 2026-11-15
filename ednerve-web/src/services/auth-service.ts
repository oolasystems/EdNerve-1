import apiClient from "../lib/api-client";
import { authToken } from "../lib/auth-token";

import type {
  AuthUser,
  LoginPayload,
  LoginResponse,
  CurrentUserResponse,
  LogoutResponse,
} from "../types/auth";

export const authService = {

  // Login
  async login(payload: LoginPayload): Promise<AuthUser> {
    const response = await apiClient.post<LoginResponse>(
      "/auth/login",
      {
        ...payload,
        device_name: "ednerve-web",
      }
    );

    const { token, user } = response.data;

    // Accept only Platform Admin accounts.
    if (
      user.account_type !== "platform" ||
      user.tenant_id !== null
    ) {
      throw new Error(
        "Access denied. Platform Admin account required."
      );
    }

    authToken.set(token);

    return user;
  },

  // Get authenticated user
  async getCurrentUser(): Promise<AuthUser> {
    const response = await apiClient.get<CurrentUserResponse>(
      "/auth/me"
    );

    const user = response.data.user;

    if (
      user.account_type !== "platform" ||
      user.tenant_id !== null
    ) {
      throw new Error(
        "Access denied. Platform Admin account required."
      );
    }

    return user;
  },

  // Logout
  async logout(): Promise<string> {
    try {
      const response = await apiClient.post<LogoutResponse>(
        "/auth/logout"
      );

      return response.data.message;
    } finally {
      authToken.clear();
    }
  },

  // Check authentication
  isAuthenticated(): boolean {
    return authToken.exists();
  },

};