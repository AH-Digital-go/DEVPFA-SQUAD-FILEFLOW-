'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Files } from 'lucide-react';
import { useFileStore } from '../store/fileStore';
import { fileService, FileMetadata } from '../services/fileService';
import FileCard from '../components/FileCard';
import AnimatedLoader from '../components/AnimatedLoader';

const FavouritesPage = () => {
  const { favorites, isLoading, setLoading, setFiles } = useFileStore();
  const router = useRouter();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      // Utilisez getFavorites() au lieu de getFiles() pour récupérer uniquement les favoris
      const favoritesData = await fileService.getFavorites();
      
      // Mapper FileMetadata vers FileItem si nécessaire
      const mappedFavorites = favoritesData.map((file: FileMetadata) => ({
        id: file.id.toString(), // Convertir number en string si nécessaire
        name: file.fileName,
        originalName: file.originalFileName,
        type: file.contentType,
        size: file.fileSize,
        uuid: file.fileUuid,
        isFavorite: file.isFavorite,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        extension: file.fileExtension,
        formattedSize: file.formattedFileSize,
        // Ajoutez d'autres propriétés si nécessaires selon votre interface FileItem
      }));

      setFiles(mappedFavorites);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

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
          <div className="p-3 bg-gray-200 rounded-xl shadow-lg">
            <Heart className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Favoris</h1>
            <p className="text-gray-600">
              {favorites.length} fichier{favorites.length !== 1 ? 's' : ''} favori{favorites.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Favorites Grid */}
      {favorites.length > 0 ? (
        <motion.div 
          className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {favorites.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1 
              }}
            >
              <FileCard file={file} />
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
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Files className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Aucun fichier favori
            </h3>
            <p className="text-gray-500 mb-6">
              Ajoutez des fichiers à vos favoris en cliquant sur l'icône cœur dans la liste de vos fichiers
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