/**
 * HarvestHub Authentication & User Models
 * Matches the backend Login entity (Login_id, name, password)
 */

export interface LoginUser {
  login_id?: number;
  Login_id?: number; // In case backend serializes Java Login_id as PascalCase
  name: string;
  password?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: LoginUser | null;
  loginId: number | null;
}

