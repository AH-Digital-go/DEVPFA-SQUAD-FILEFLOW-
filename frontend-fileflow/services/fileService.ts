import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from '@/store/authStore';
import {
  FileMetadata,
  ApiResponse,
  ShareFileRequest,
  FileShare,
  SharedFileInfo,
  FolderInfo,
  FolderUpdateRequest,
  shareNotification,
} from '@/types/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088/api';

// === AXIOS INSTANCES ===
const fileAPI = axios.create({
  baseURL: `${API_BASE_URL}/files`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const favoritesAPI = axios.create({
  baseURL: `${API_BASE_URL}/favourites`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const sharingAPI = axios.create({
  baseURL: `${API_BASE_URL}/file`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const foldersAPI = axios.create({
  baseURL: `${API_BASE_URL}/folders`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// === INTERCEPTOR ===
const addAuthInterceptor = (apiInstance: AxiosInstance): void => {
  apiInstance.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

// === Apply to all instances ===
[fileAPI, favoritesAPI, sharingAPI, foldersAPI].forEach(addAuthInterceptor);

// === FILE SERVICE ===
export const fileService = {
  async getFiles(page?: number, size?: number, search?: string): Promise<FileMetadata[]> {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (size) params.append('size', size.toString());
    if (search) params.append('search', search);

    const response = await fileAPI.get<ApiResponse<FileMetadata[]>>(`/?${params.toString()}`);
    console.log("response :", response);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message);
  },

  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<FileMetadata> {
    if (!file || file.size === 0) throw new Error('Fichier invalide');

    const formData = new FormData();
    formData.append('file', file);

    const response = await fileAPI.post<ApiResponse<FileMetadata>>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          const percent = Math.round((e.loaded * 100) / e.total);
          onProgress(percent);
        }
      },
    });

    if (response.data.success) return response.data.data;
    throw new Error(response.data.message);
  },

  async deleteFile(id: number): Promise<void> {
    const response = await fileAPI.delete<ApiResponse<void>>(`/${id}`);
    if (!response.data.success) throw new Error(response.data.message);
  },

  async renameFile(id: number, fileName: string): Promise<FileMetadata> {
    const response = await fileAPI.put<ApiResponse<FileMetadata>>(`/${id}/rename`, { fileName });
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message);
  },

  async toggleFavorite(id: number): Promise<FileMetadata> {
    const response = await favoritesAPI.post<ApiResponse<FileMetadata>>(`/${id}`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message);
  },

  async getFavorites(): Promise<FileMetadata[]> {
    const response = await favoritesAPI.get<ApiResponse<FileMetadata[]>>('/');
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message);
  },

  async downloadFile(id: number, fileName: string): Promise<Blob> {
    console.log("fileId:",id);
    const response = await fileAPI.get(`/${id}/download`, { responseType: 'blob' });
    console.log(response);
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return response.data;
  },

  // === SHARING ===
  async shareFile(fileId: number,userEmail:string): Promise<void> {
    const response = await sharingAPI.post(
      `/share/${fileId}`,null,{
        params:{
          userEmail,
        }
      });
    console.log(response);
      if(response.status!=200)
    throw new Error(response.data.message);
  },

  async getShareNotfications(userId:number):Promise<shareNotification[]>{
    const response = await sharingAPI.get("/share/requests",{
      params:{userId,},
    });
    console.log(response);
    if(response.status==200)
      return response.data;
    throw new Error(response.data.message);
  },

  async shareResponse(shareFileId: number, shareresponse: boolean): Promise<unknown> {
    const response = await sharingAPI.post(
      `/share/response/${shareFileId}`, null,
      {
        params:{response:shareresponse,},
      }
    );
    
    if (response.status==200) return response.data;
    throw new Error(response.data.message);
  },
  async getFileUsersEmails(fileId: number): Promise<string[]> {
    const response = await sharingAPI.get(
      `/shared/${fileId}/with`
    );
    console.log(response);
    return response.data;
  },

  async getSharedFilesWithMe(userId: number): Promise<FileMetadata[]> {
    const response = await sharingAPI.get(
      `/shared`, {
      params: { userId }
    }

    );
    console.log(response);
    return response.data;
  },
  async getSharedFilesByMe(userId: number): Promise<FileMetadata[]> {
    const response = await sharingAPI.get<FileMetadata[]>("/shared/by-me", {
      params: { userId },
    });
    console.log(response);
    return response.data;
  },
  async unshareFile(fileId: number, userEmail: string): Promise<void> {
    
    const response = await sharingAPI.delete(`/${fileId}/share`, {
      params: { userEmail },
    });
    
    if (response.status !== 200) {
      throw new Error("Failed to unshare file.");
    }
  },
////////////////////////////////////////////////////////
///////////////////////////////////////////////////////

  async getFileShares(fileId: number): Promise<FileShare[]> {
    const response = await sharingAPI.get<ApiResponse<FileShare[]>>(`/${fileId}/shares`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message);
  },

  async getSharedFile(shareToken: string, password?: string): Promise<SharedFileInfo> {
    const params = password ? `?password=${encodeURIComponent(password)}` : '';
    const response = await sharingAPI.get<ApiResponse<SharedFileInfo>>(`/shared/${shareToken}${params}`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message);
  },

  async revokeShare(shareId: number): Promise<void> {
    const response = await sharingAPI.delete<ApiResponse<void>>(`/shares/${shareId}`);
    if (!response.data.success) throw new Error(response.data.message);
  },

  async getMyShares(): Promise<FileShare[]> {
    const response = await sharingAPI.get<ApiResponse<FileShare[]>>(`/my-shares`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message);
  },

  // === FOLDERS ===
  async createFolder(name: string, parentId?: number, description?: string, color?: string): Promise<FolderInfo> {
    const body = { name, parentId, description, color };
    const response = await foldersAPI.post<ApiResponse<FolderInfo>>('', body);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message);
  },

  async getFolders(): Promise<FolderInfo[]> {
    const response = await foldersAPI.get<ApiResponse<FolderInfo[]>>('');
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message);
  },

  async getFolderDetails(folderId: number): Promise<FolderInfo> {
    const response = await foldersAPI.get<ApiResponse<FolderInfo>>(`/${folderId}`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message);
  },

  async updateFolder(folderId: number, updates: Partial<FolderUpdateRequest>): Promise<FolderInfo> {
    const response = await foldersAPI.put<ApiResponse<FolderInfo>>(`/${folderId}`, updates);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message);
  },

  async toggleFolderFavorite(folderId: number): Promise<FolderInfo> {
    const response = await foldersAPI.post<ApiResponse<FolderInfo>>(`/${folderId}/favorite`, {});
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message);
  },

  async deleteFolder(folderId: number): Promise<void> {
    const response = await foldersAPI.delete<ApiResponse<void>>(`/${folderId}`);
    if (!response.data.success) throw new Error(response.data.message);
  },

  async getFavoriteFolders(): Promise<FolderInfo[]> {
    const response = await foldersAPI.get<ApiResponse<FolderInfo[]>>('/favorites');
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message);
  },

  async searchFolders(query: string): Promise<FolderInfo[]> {
    const response = await foldersAPI.get<ApiResponse<FolderInfo[]>>(`/search?query=${encodeURIComponent(query)}`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message);
  },
};
