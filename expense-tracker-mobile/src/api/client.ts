import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.198.232.23:8000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ── Request interceptor: attach JWT ──────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Read token directly from Zustand store (works outside React components)
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: normalize errors ───────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (!error.response) {
      // Network / timeout error
      return Promise.reject(new Error('Network error — check your connection.'));
    }

    const { status, data } = error.response as { status: number; data: any };

    // Use the message from GlobalExceptionHandler if available
    const serverMessage: string =
      data?.message ?? data?.error ?? 'Something went wrong.';

    const appError = new Error(serverMessage) as Error & {
      status: number;
      fieldErrors?: Record<string, string>;
    };
    appError.status = status;
    if (data?.fieldErrors) {
      appError.fieldErrors = data.fieldErrors;
    }

    return Promise.reject(appError);
  },
);

export default apiClient;
