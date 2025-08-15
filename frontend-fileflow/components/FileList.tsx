'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  File, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive, 
  FileSpreadsheet, 
  Presentation 
} from 'lucide-react';
import FileCard from './FileCard';
import AnimatedLoader from './AnimatedLoader';
import { useFileStore, FileItem } from '../store/fileStore';
import { fileService } from '../services/fileService';
import { toast } from 'react-toastify';

// Fonction utilitaire pour formater la taille des fichiers
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Fonction utilitaire pour obtenir l'icône appropriée en fonction du type de fichier
const getFileIcon = (type: string) => {
  if (!type) return File;
  if (type.startsWith('image/')) return Image;
  if (type.startsWith('video/')) return Video;
  if (type.startsWith('audio/')) return Music;
  if (type.includes('pdf')) return FileText;
  if (type.includes('word') || type.includes('document')) return FileText;
  if (type.includes('excel') || type.includes('spreadsheet')) return FileSpreadsheet;
  if (type.includes('powerpoint') || type.includes('presentation')) return Presentation;
  if (type.includes('zip') || type.includes('rar') || type.includes('compressed')) return Archive;
  return File;
};

// Composant d'icône de fichier simplifié
const FileIcon = ({ type, className }: { type: string; className?: string }) => {
  const Icon = getFileIcon(type);
  return <Icon className={className} />;
};

// Fonction utilitaire pour obtenir un nom de type lisible
const getFileTypeName = (type: string): string => {
  if (!type) return 'Fichier';
  if (type.startsWith('image/')) return 'Image';
  if (type.startsWith('video/')) return 'Vidéo';
  if (type.startsWith('audio/')) return 'Audio';
  if (type.includes('pdf')) return 'PDF';
  if (type.includes('document') || type.includes('word')) return 'Document';
  if (type.includes('spreadsheet') || type.includes('excel')) return 'Feuille de calcul';
  if (type.includes('presentation') || type.includes('powerpoint')) return 'Présentation';
  if (type.includes('zip') || type.includes('rar') || type.includes('compressed')) return 'Archive';
  return type.split('/')[1]?.toUpperCase() || 'Fichier';
};

const FileList = () => {
  const { files, isLoading, searchQuery, viewMode, setLoading, setFiles } = useFileStore();
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    // Filtrer les fichiers en fonction de la recherche
    const filtered = searchQuery.trim()
      ? files.filter(file => 
          file.originalFileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          file.type.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [...files];
    
    setFilteredFiles(filtered);
  }, [files, searchQuery]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const filesData = await fileService.getFiles();
      const convertedFiles = filesData.map(file => ({
        id: String(file.id),
        name: file.name || file.originalFileName, // Use the display name (original filename)
        originalFileName: file.originalFileName,
        type: file.contentType,
        size: file.fileSize,
        fileUsersEmails: file.fileUsersEmails || [],
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        isFavorite: file.isFavorite,
        url: undefined,
        thumbnail: undefined
      }));
      setFiles(convertedFiles);
    } catch (error) {
      console.error('Failed to load files:', error);
      toast.error('Erreur lors du chargement des fichiers');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <AnimatedLoader />
      </div>
    );
  }

  if (filteredFiles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          {searchQuery ? 'Aucun fichier trouvé' : 'Aucun fichier à afficher'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredFiles.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <FileCard file={file} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-gray-500 border-b">
            <div className="col-span-5">Nom</div>
            <div className="col-span-3">Type</div>
            <div className="col-span-2 text-right">Taille</div>
            <div className="col-span-2 text-right">Date</div>
          </div>
          {filteredFiles.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-12 gap-4 items-center p-4 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="col-span-5 flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <FileIcon type={file.type} className="w-5 h-5 text-gray-400" />
                </div>
                <span className="truncate font-medium">{file.name}</span>
              </div>
              <div className="col-span-3 text-sm text-gray-500">
                {getFileTypeName(file.type)}
              </div>
              <div className="col-span-2 text-right text-sm text-gray-500">
                {formatFileSize(file.size)}
              </div>
              <div className="col-span-2 text-right text-sm text-gray-500">
                {new Date(file.updatedAt).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileList;