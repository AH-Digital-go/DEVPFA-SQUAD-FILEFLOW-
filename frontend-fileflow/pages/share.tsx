'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Files, Share2 } from 'lucide-react';
import { useFileStore } from '../store/fileStore';
import { fileService } from '../services/fileService';
import { FileDTO } from '@/types/types';
import FileCard from '../components/FileCard';
import AnimatedLoader from '../components/AnimatedLoader';
import { useAuthStore } from '@/store/authStore';


const FavouritesPage = () => {
  const { favorites, isLoading, setLoading,files, setFiles } = useFileStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [ shareType, setShareType] = useState<"by" |"with">("by");
  const shareTypes=[
    {key:"by",label:"par moi"},
    {key:"with",label:"avec moi"},
  ];
  useEffect(() => {

    loadSharedfiles(shareType);
  }, [shareType]);

  const loadSharedfiles = async (shareType:string) => {
    try {
      setLoading(true);
      // Utilisez getFavorites() au lieu de getFiles() pour récupérer uniquement les favoris
      var sharedFiles;
      if(shareType=="by"){
        sharedFiles = await fileService.getSharedFilesByMe(Number(user?.id));
      }
      else
        {
            sharedFiles = await fileService.getSharedFilesWithMe(Number(user?.id));
      }
      
      // Mapper FileDTO vers FileItem si nécessaire
      const mappedsharedfiles = sharedFiles.map((file: FileDTO) => ({
        id: file.id.toString(), // Convertir number en string si nécessaire
        name: file.originalFileName,
        originalFileName: file.originalFileName,
        type: file.contentType,
        size: file.fileSize,
        fileUsersEmails: file.fileUsersEmails || [],
        isFavorite: file.isFavorite,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        // Ajoutez d'autres propriétés si nécessaires selon votre interface FileItem
      }));

      setFiles(mappedsharedfiles);
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
            <Share2 className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Partagé</h1>
            <p className="text-gray-600">
              {files.length} fichier{files.length !== 1 ? 's' : ''} partagé{files.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <select
              value={shareType}
              onChange={(e) => setShareType(e.target.value as "by" | "with")}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            >
              {shareTypes.map((type) => (
                <option key={type.key} value={type.key}>
                  {type.label}
                </option>
              ))}
            </select>
      </motion.div>

      {/* Favorites Grid */}
      {files.length > 0 ? (
        <motion.div 
          className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {files.map((file, index) => (
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
              Aucun fichier partagé
            </h3>
            
            
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FavouritesPage;