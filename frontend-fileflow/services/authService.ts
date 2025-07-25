import { LoginCredentials, AuthResponse, AuthData, RegisterData, UserData, ApiResponse } from '@/types/types';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore, User } from '@/store/authStore';

// Updated to match backend port
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088/api';

const authAPI = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});
// === Refresh Token Logic ===
// Flag pour éviter les boucles infinies
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (error: any) => void;
  config: AxiosRequestConfig;
}[] = [];

// Fonction pour traiter la file des requêtes en attente après refresh
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      if (token && prom.config.headers) {
        prom.config.headers['Authorization'] = `Bearer ${token}`;
      }
      prom.resolve(authAPI(prom.config));
    }
  });
  failedQueue = [];
};
// === Response Interceptor ===
// Interceptor pour les réponses
authAPI.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean } | undefined;

    if (!originalRequest) {
      // Pas de config => on rejette l'erreur directement
      return Promise.reject(error);
    }

    // Si erreur 401 et qu’on n’a pas déjà essayé de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        useAuthStore.getState().login(useAuthStore.getState().user!, newToken);
        if (originalRequest.headers)
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return authAPI(originalRequest);
      } catch (err) {
        processQueue(err, null);
        useAuthStore.getState().logout();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
// === Request Interceptor ===
authAPI.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});
// === Refresh Access Token ==
// Fonction de refresh token, exportée séparément
export async function refreshAccessToken(): Promise<string> {
  try {
    const response = await authAPI.post('/refresh-token');
    if (response.data.success) {
      const newAccessToken = response.data.data.accessToken;
      return newAccessToken;
    } else {
      throw new Error('Échec du rafraîchissement du token');
    }
  } catch (error) {
    console.error('Erreur lors du refresh token:', error);
    throw error;
  }
}
// === Auth Service ===
export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await authAPI.post<ApiResponse<AuthData>>('/login', credentials);
    if (response.data.success) {
      const { user, accessToken } = response.data.data;
      useAuthStore.getState().login(user, accessToken);
      return { user , accessToken};
    } else {
      throw new Error(response.data.message);
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await authAPI.post<ApiResponse<AuthData>>('/register', data);
    if (response.data.success) {
      const { user, accessToken } = response.data.data;
      useAuthStore.getState().login(user, accessToken);
      return { user, accessToken };
    } else {
      throw new Error(response.data.message);
    }
  },

  async logout(): Promise<void> {
    try {
      await authAPI.post('/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
    } finally {
      useAuthStore.getState().logout();
    }
  },

  getUser(): User | null {
    return useAuthStore.getState().user;
  },
};