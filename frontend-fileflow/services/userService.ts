import { ApiResponse, UserData, UserStorageInfo, UserUpdateRequest } from '@/types/types';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

// Updated to match backend port
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const userAPI = axios.create({
  baseURL: `${API_BASE_URL}/user`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

userAPI.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken; 
    // depuis Zustand, pas localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


export const userService = {
  async getCurrentUser(): Promise<UserData> {
    const response = await userAPI.get<ApiResponse<UserData>>('/me');
    if (response.data.success) {
      useAuthStore.getState().updateUser(response.data.data);
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  },

  async  deleteAccountRequest(): Promise<ApiResponse<null>> {
    try {
      const res = await userAPI.delete<ApiResponse<null>>('/me/delete');
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete account');
    }
  },

  async updateUserProfile(data: UserUpdateRequest): Promise<UserData> {
    
    const response = await userAPI.patch<ApiResponse<UserData>>('/update', data);

    if (response.data.success) {
      const updatedUser = response.data.data;
      useAuthStore.getState().updateUser(updatedUser)
      return updatedUser;
    } else {
      throw new Error(response.data.message);
    }
  },
  
  async getUserStorageInfo(): Promise<UserStorageInfo> {
      const response = await userAPI.get<ApiResponse<UserStorageInfo>>('/storage');
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message);
      }
  }
};