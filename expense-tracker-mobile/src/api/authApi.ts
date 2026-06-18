import apiClient from './client';
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  UserProfile,
} from '../types';

// ── POST /auth/v1/login ──────────────────────────────────────────
export const loginApi = async (data: LoginRequest): Promise<LoginResponse> => {
  const res = await apiClient.post<LoginResponse>('/auth/v1/login', data);
  return res.data;
};

// ── POST /auth/v1/signup ─────────────────────────────────────────
// Returns the new userId as a plain string ("Already Exist" on conflict)
export const registerApi = async (data: RegisterRequest): Promise<string> => {
  const res = await apiClient.post<string>('/auth/v1/signup', data);
  return res.data;
};

// ── POST /user/v1/createUpdate ────────────────────────────────────
// Called after signup to populate the user profile service
export const createUserProfileApi = async (
  profile: UserProfile,
): Promise<UserProfile> => {
  const res = await apiClient.post<UserProfile>(
    '/user/v1/createUpdate',
    profile,
  );
  return res.data;
};

// ── POST /auth/v1/refreshToken ───────────────────────────────────
export const refreshTokenApi = async (
  data: RefreshTokenRequest,
): Promise<RefreshTokenResponse> => {
  const res = await apiClient.post<RefreshTokenResponse>(
    '/auth/v1/refreshToken',
    data,
  );
  return res.data;
};

// ── POST /auth/v1/logout ─────────────────────────────────────────
export const logoutApi = async (): Promise<void> => {
  await apiClient.post('/auth/v1/logout');
};
