import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from '@/store/authStore';
import {
  FileDTO,
  ApiResponse,
  ShareFileRequest,
  FileShare,
  SharedFileInfo,
  FolderInfo,
  FolderUpdateRequest,
  FileStatistics,
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
  baseURL: `${API_BASE_URL}/sharing`,
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
[ fileAPI, favoritesAPI, sharingAPI, foldersAPI ].forEach(addAuthInterceptor);

// === FILE SERVICE ===
export const fileService = {
  async getFiles(page?: number, size?: number, search?: string): Promise<FileDTO[]> {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (size) params.append('size', size.toString());
    if (search) params.append('search', search);

    const response = await fileAPI.get<ApiResponse<FileDTO[]>>(`/?${params.toString()}`);
    console.log("response :", response);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message);
  },

  async uploadFile(file: File, onProgress?: (progress: number) => void, folderId?: number): Promise<FileDTO> {
    if (!file || file.size === 0) throw new Error('Fichier invalide');

    const formData = new FormData();
    formData.append('file', file);
    if (folderId) {
      formData.append('folderId', folderId.toString());
    }

    const response = await fileAPI.post<ApiResponse<FileDTO>>('/upload', formData, {
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

  async renameFile(id: number, fileName: string): Promise<FileDTO> {
    const response = await fileAPI.put<ApiResponse<FileDTO>>(`/${id}/rename`, { fileName });
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message);
  },

  async toggleFavorite(id: number): Promise<FileDTO> {
    const response = await favoritesAPI.post<ApiResponse<FileDTO>>(`/${id}`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message);
  },

  async getFavorites(): Promise<FileDTO[]> {
    const response = await favoritesAPI.get<ApiResponse<FileDTO[]>>('/');
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message);
  },

  async downloadFile(id: number, fileName: string): Promise<Blob> {
    const response = await fileAPI.get(`/${id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response.data;
  },

  async getFileStatistics(): Promise<FileStatistics> {
    const response = await fileAPI.get<ApiResponse<FileStatistics>>('/statistics');
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message);
  },

  // === SHARING ===
  async shareFile(fileId: number, shareOptions: ShareFileRequest): Promise<FileShare> {
    const response = await sharingAPI.post<ApiResponse<FileShare>>(
      `/${fileId}/share`, shareOptions);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message);
  },

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

  async moveFolder(folderId: number, newParentId?: number): Promise<FolderInfo> {
    const body = { newParentId };
    const response = await foldersAPI.put<ApiResponse<FolderInfo>>(`/${folderId}/move`, body);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message);
  },

  async copyFolder(folderId: number, newParentId?: number, newName?: string): Promise<FolderInfo> {
    const body = { newParentId, newName };
    const response = await foldersAPI.post<ApiResponse<FolderInfo>>(`/${folderId}/copy`, body);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message);
  },

  async getSubfolders(parentId: number): Promise<FolderInfo[]> {
    const response = await foldersAPI.get<ApiResponse<FolderInfo[]>>(`/${parentId}/subfolders`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message);
  },

  async getFolderFiles(folderId: number): Promise<FileDTO[]> {
    const response = await fileAPI.get<ApiResponse<FileDTO[]>>(`/folder/${folderId}`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message);
  },

  // =========================
  // BULK OPERATIONS
  // =========================

  async bulkMoveFolder(folderIds: number[], newParentId: number | null): Promise<FolderInfo[]> {
    const response = await foldersAPI.post<ApiResponse<FolderInfo[]>>('/bulk/move', {
      folderIds,
      newParentId
    });
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message);
  },

  async bulkCopyFolder(folderIds: number[], newParentId: number | null): Promise<FolderInfo[]> {
    const response = await foldersAPI.post<ApiResponse<FolderInfo[]>>('/bulk/copy', {
      folderIds,
      newParentId
    });
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message);
  },

  async bulkDeleteFolder(folderIds: number[]): Promise<{ deletedCount: number; totalRequested: number; message: string }> {
    const response = await foldersAPI.delete<ApiResponse<{ deletedCount: number; totalRequested: number; message: string }>>('/bulk/delete', {
      data: { folderIds }
    });
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message);
  },

  // Bulk file operations
  async bulkMoveFiles(fileIds: number[], destinationFolderId: number | null): Promise<string> {
    const response = await fileAPI.put<ApiResponse<string>>('/bulk/move', {
      fileIds,
      destinationFolderId
    });
    if (response.data.success) return response.data.message;
    throw new Error(response.data.message);
  },

  async bulkCopyFiles(fileIds: number[], destinationFolderId: number | null): Promise<string> {
    const response = await fileAPI.post<ApiResponse<string>>('/bulk/copy', {
      fileIds,
      destinationFolderId
    });
    if (response.data.success) return response.data.message;
    throw new Error(response.data.message);
  },
};

// Export types for easier imports
export type { FileDTO };
