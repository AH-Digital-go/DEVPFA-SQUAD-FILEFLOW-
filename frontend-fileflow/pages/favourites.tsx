'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Files, Folder } from 'lucide-react';
import { useFileStore, FolderItem } from '../store/fileStore';
import { fileService, FileDTO } from '../services/fileService';
import FavoriteCard from '../components/FavoriteCard';
import AnimatedLoader from '../components/AnimatedLoader';

interface FolderInfo {
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

const FavouritesPage = () => {
  const { 
    allFavorites, 
    favorites, 
    favoriteFolders, 
    isLoading, 
    setLoading, 
    setFiles,
    setFavoriteFolders,
    updateAllFavorites
  } = useFileStore();
  const router = useRouter();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      
      // Load favorite files
      const favoritesData = await fileService.getFavorites();
      const mappedFavorites = favoritesData.map((file: FileDTO) => ({
        id: file.id.toString(),
        name: file.originalFileName,
        originalFileName: file.originalFileName,
        type: file.contentType,
        size: file.fileSize,
        fileUsersEmails: file.fileUsersEmails || [],
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        isFavorite: file.isFavorite,
      }));

      // Load favorite folders
      const favoriteFoldersData = await fileService.getFavoriteFolders();
      const mappedFavoriteFolders: FolderItem[] = favoriteFoldersData.map((folder: FolderInfo) => ({
        id: folder.id,
        name: folder.name,
        color: folder.color,
        description: folder.description,
        isFavorite: folder.isFavorite,
        fileCount: folder.fileCount,
        subfolderCount: folder.subfolderCount,
        totalSize: folder.totalSize,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
        path: folder.path
      }));

      setFiles(mappedFavorites);
      setFavoriteFolders(mappedFavoriteFolders);
      updateAllFavorites();
      
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (id: string, type: 'file' | 'folder') => {
    try {
      if (type === 'file') {
        await fileService.toggleFavorite(parseInt(id));
      } else {
        await fileService.toggleFolderFavorite(parseInt(id));
      }
      // Reload favorites after toggling
      await loadFavorites();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const favorite = allFavorites.find(f => f.id === id);
      if (favorite && favorite.type === 'file') {
        await fileService.downloadFile(parseInt(id), favorite.name);
      }
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  const handleShare = (id: string) => {
    // Implement sharing logic
    console.log('Share:', id);
  };

  const handleDelete = async (id: string, type: 'file' | 'folder') => {
    try {
      if (type === 'file') {
        await fileService.deleteFile(parseInt(id));
      } else {
        await fileService.deleteFolder(parseInt(id));
      }
      // Reload favorites after deletion
      await loadFavorites();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const totalFavorites = allFavorites.length;
  const totalFiles = favorites.length;
  const totalFolders = favoriteFolders.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <AnimatedLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <motion.div 
        className="max-w-6xl mx-auto mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-red-100 rounded-xl shadow-lg">
            <Heart className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Favoris</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Files className="w-4 h-4" />
                {totalFiles} fichier{totalFiles !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1">
                <Folder className="w-4 h-4" />
                {totalFolders} dossier{totalFolders !== 1 ? 's' : ''}
              </span>
              <span className="font-medium">
                Total: {totalFavorites} élément{totalFavorites !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Favorites List */}
      {totalFavorites > 0 ? (
        <motion.div 
          className="max-w-4xl mx-auto space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {allFavorites.map((favorite, index) => (
            <motion.div
              key={`${favorite.type}-${favorite.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.05 
              }}
            >
              <FavoriteCard 
                favorite={favorite}
                onToggleFavorite={handleToggleFavorite}
                onDownload={handleDownload}
                onShare={handleShare}
                onDelete={handleDelete}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          className="max-w-md mx-auto text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="bg-gray-50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Aucun favori
            </h3>
            <p className="text-gray-500 mb-6">
              Ajoutez des fichiers ou des dossiers à vos favoris en cliquant sur l'icône cœur
            </p>
            <motion.button
              className="px-6 py-3 bg-blue-600 hover:bg-blue-800 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/files')}
            >
              Parcourir les fichiers
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FavouritesPage;