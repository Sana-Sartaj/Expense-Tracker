import apiClient from './client';
import { UserProfile } from '../types';

// ── GET /user/v1/{userId} ─────────────────────────────────────────
export const getUserProfileApi = async (
  userId: string,
): Promise<UserProfile> => {
  const res = await apiClient.get<UserProfile>(`/user/v1/${userId}`);
  return res.data;
};

// ── POST /user/v1/createUpdate ────────────────────────────────────
export const updateUserProfileApi = async (
  profile: UserProfile,
): Promise<UserProfile> => {
  const res = await apiClient.post<UserProfile>(
    '/user/v1/createUpdate',
    profile,
  );
  return res.data;
};
