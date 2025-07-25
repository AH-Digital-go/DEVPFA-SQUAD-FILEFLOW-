import { create } from 'zustand';

export interface FileItem {
  id: string;
  name: string;
  originalFileName: string;
  type: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  url?: string;
  thumbnail?: string;
}

interface FileState {
  files: FileItem[];
  favorites: FileItem[];
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
  isLoading: false,
  searchQuery: '',
  selectedFiles: [],
  totalSize: 0,
  viewMode: 'grid',

  setFiles: (files: FileItem[]) => {
    const favorites = files.filter(file => file.isFavorite);
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    set({ files, favorites, totalSize });
  },

  addFile: (file: FileItem) => {
    const { files } = get();
    const newFiles = [file, ...files];
    const favorites = newFiles.filter(f => f.isFavorite);
    const totalSize = newFiles.reduce((sum, f) => sum + f.size, 0);
    set({ files: newFiles, favorites, totalSize });
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
  },

  updateFile: (fileId: string, updates: Partial<FileItem>) => {
    const { files } = get();
    const newFiles = files.map(file => 
      file.id === fileId ? { ...file, ...updates } : file
    );
    const favorites = newFiles.filter(f => f.isFavorite);
    set({ files: newFiles, favorites });
  },

  toggleFavorite: (fileId: string) => {
    const { files } = get();
    const newFiles = files.map(file => 
      file.id === fileId ? { ...file, isFavorite: !file.isFavorite } : file
    );
    const favorites = newFiles.filter(f => f.isFavorite);
    set({ files: newFiles, favorites });
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