export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

// Backend API response structure
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  storageUsed: number;
  maxStorage: number;
  storageUsedPercentage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthData {
  type: string;
  accessToken: string;      
  user: UserData;
}

export interface AuthResponse {
  accessToken: string;
  user: UserData;
}

export interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  newPassword?: string;
}

// for file:
// Updated FileItem to match backend FileDTO
export interface FileDTO {
  id: number;
  fileName: string;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  fileUuid: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  fileExtension: string;
  formattedFileSize?: string;
}

export interface UserStorageInfo {
  fileCount: number;
  storageUsed: number;
  maxStorage: number;
  storageUsedPercentage: number;
  availableStorage: number;
}

export interface UploadResponse {
  file: FileDTO;
  message: string;
}

// === NOUVELLES INTERFACES POUR LES FONCTIONNALITÉS AJOUTÉES ===

// Statistiques détaillées des fichiers
export interface FileStatistics {
  totalFiles: number;
  totalSize: number;
  favoriteFiles: number;
  fileTypeDistribution: Record<string, number>;
  fileSizeDistribution: Record<string, number>;
  recentFiles: number;
  largestFiles: Array<{
    name: string;
    size: number;
    extension: string;
  }>;
}

// Système de partage de fichiers
export interface ShareFileRequest {
  shareType: 'public' | 'private';
  expirationDays?: number;
  password?: string;
  allowDownload?: boolean;
}

export interface FileShare {
  id: number;
  fileId: number;
  fileName: string;
  shareToken: string;
  shareType: string;
  passwordProtected: boolean;
  allowDownload: boolean;
  expiresAt?: string;
  createdAt: string;
  accessCount: number;
  isActive: boolean;
  shareUrl: string;
}

export interface SharedFileInfo {
  fileId: number;
  fileName: string;
  fileSize: number;
  contentType: string;
  allowDownload: boolean;
  shareType: string;
  accessCount: number;
}

// Gestion des dossiers
export interface FolderInfo {
  id: number;
  name: string;
  path: string;
  fullPath: string;
  parentId?: number;
  parentName?: string;
  isFavorite: boolean;
  color?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  fileCount: number;
  subfolderCount: number;
  totalSize: number;
  formattedSize: string;
  subfolders?: FolderInfo[];
  files?: FileDTO[];
  breadcrumb: string[];
}

export interface FolderUpdateRequest {
  name?: string;
  color?: string;
  description?: string;
}