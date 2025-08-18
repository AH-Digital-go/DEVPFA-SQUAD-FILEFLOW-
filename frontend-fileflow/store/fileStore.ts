import { create } from 'zustand';

export interface FileItem {
  id: string;
  name: string;
  originalFileName: string;
  type: string;
  size: number;
  fileUsersEmails:string[];
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  url?: string;
  thumbnail?: string;
}

export interface FolderItem {
  id: number;
  name: string;
  color?: string;
  description?: string;
  isFavorite: boolean;
  fileCount: number;
  subfolderCount: number;
  totalSize: number;
  createdAt: string;
  updatedAt: string;
  path: string;
}

export interface FavoriteItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  isFavorite: boolean;
  createdAt: string;
  originalItem: FileItem | FolderItem;
}

interface FileState {
  files: FileItem[];
  favorites: FileItem[];
  favoriteFolders: FolderItem[];
  allFavorites: FavoriteItem[];
  isLoading: boolean;
  searchQuery: string;
  selectedFiles: string[];
  totalSize: number;
  viewMode: 'grid' | 'list';
  setFiles: (files: FileItem[]) => void;
  addFile: (file: FileItem) => void;
  removeFile: (fileId: string) => void;
  updateFile: (fileId: string, updates: Partial<FileItem>) => void;
  toggleFavorite: (fileId: string) => void;
  toggleFolderFavorite: (folderId: number) => void;
  setFavoriteFolders: (folders: FolderItem[]) => void;
  updateAllFavorites: () => void;
  setLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
  toggleFileSelection: (fileId: string) => void;
  clearSelection: () => void;
  selectAllFiles: () => void;
  setViewMode: (mode: 'grid' | 'list') => void;
}

export const useFileStore = create<FileState>((set, get) => ({
  files: [],
  favorites: [],
  favoriteFolders: [],
  allFavorites: [],
  isLoading: false,
  searchQuery: '',
  selectedFiles: [],
  totalSize: 0,
  viewMode: 'grid',

  setFiles: (files: FileItem[]) => {
    const favorites = files.filter(file => file.isFavorite);
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    set({ files, favorites, totalSize });
    get().updateAllFavorites();
  },

  addFile: (file: FileItem) => {
    const { files } = get();
    const newFiles = [file, ...files];
    const favorites = newFiles.filter(f => f.isFavorite);
    const totalSize = newFiles.reduce((sum, f) => sum + f.size, 0);
    set({ files: newFiles, favorites, totalSize });
    get().updateAllFavorites();
  },

  removeFile: (fileId: string) => {
    const { files } = get();
    const newFiles = files.filter(file => file.id !== fileId);
    const favorites = newFiles.filter(f => f.isFavorite);
    const totalSize = newFiles.reduce((sum, file) => sum + file.size, 0);
    set({ 
      files: newFiles, 
      favorites, 
      totalSize,
      selectedFiles: get().selectedFiles.filter(id => id !== fileId)
    });
    get().updateAllFavorites();
  },

  updateFile: (fileId: string, updates: Partial<FileItem>) => {
    const { files } = get();
    const newFiles = files.map(file => 
      file.id === fileId ? { ...file, ...updates } : file
    );
    const favorites = newFiles.filter(f => f.isFavorite);
    set({ files: newFiles, favorites });
    get().updateAllFavorites();
  },

  toggleFavorite: (fileId: string) => {
    const { files } = get();
    const newFiles = files.map(file => 
      file.id === fileId ? { ...file, isFavorite: !file.isFavorite } : file
    );
    const favorites = newFiles.filter(f => f.isFavorite);
    set({ files: newFiles, favorites });
    get().updateAllFavorites();
  },

  toggleFolderFavorite: (folderId: number) => {
    const { favoriteFolders } = get();
    const newFavoriteFolders = favoriteFolders.map(folder => 
      folder.id === folderId ? { ...folder, isFavorite: !folder.isFavorite } : folder
    );
    set({ favoriteFolders: newFavoriteFolders });
    get().updateAllFavorites();
  },

  setFavoriteFolders: (folders: FolderItem[]) => {
    set({ favoriteFolders: folders });
    get().updateAllFavorites();
  },

  updateAllFavorites: () => {
    const { favorites, favoriteFolders } = get();
    
    const fileFavorites: FavoriteItem[] = favorites.map(file => ({
      id: file.id,
      name: file.originalFileName,
      type: 'file' as const,
      size: file.size,
      isFavorite: file.isFavorite,
      createdAt: file.createdAt,
      originalItem: file
    }));

    const folderFavorites: FavoriteItem[] = favoriteFolders.map(folder => ({
      id: folder.id.toString(),
      name: folder.name,
      type: 'folder' as const,
      size: folder.totalSize,
      isFavorite: folder.isFavorite,
      createdAt: folder.createdAt,
      originalItem: folder
    }));

    const allFavorites = [...fileFavorites, ...folderFavorites].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    set({ allFavorites });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  toggleFileSelection: (fileId: string) => {
    const { selectedFiles } = get();
    if (selectedFiles.includes(fileId)) {
      set({ selectedFiles: selectedFiles.filter(id => id !== fileId) });
    } else {
      set({ selectedFiles: [...selectedFiles, fileId] });
    }
  },

  clearSelection: () => {
    set({ selectedFiles: [] });
  },

  selectAllFiles: () => {
    const { files } = get();
    set({ selectedFiles: files.map(file => file.id) });
  },

  setViewMode: (mode: 'grid' | 'list') => {
    set({ viewMode: mode });
  },
}));