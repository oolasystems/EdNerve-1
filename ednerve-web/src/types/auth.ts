// =====================================================
// Authentication Types
// =====================================================

export type AccountType = "platform" | "institution";

export type UserStatus = "active" | "inactive";

// =====================================================
// Authenticated User
// =====================================================

export interface AuthUser {
  id: number;
  account_type: AccountType;
  tenant_id: number | null;
  name: string;
  email: string;
  phone?: string | null;
  status: UserStatus;
  last_login_at?: string | null;
  tenant?: Record<string, unknown> | null;
}

// =====================================================
// Login
// =====================================================

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  token_type: string;
  user: AuthUser;
}

// =====================================================
// Current Authenticated User
// =====================================================

export interface CurrentUserResponse {
  user: AuthUser;
}

// =====================================================
// Logout
// =====================================================

export interface LogoutResponse {
  message: string;
}