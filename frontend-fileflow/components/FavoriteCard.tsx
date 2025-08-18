'use client';

import { motion } from 'framer-motion';
import { 
  FileText, 
  Folder, 
  Calendar, 
  HardDrive,
  MoreVertical,
  Download,
  Share,
  Trash2,
  Heart
} from 'lucide-react';
import { FavoriteItem } from '../store/fileStore';

interface FavoriteCardProps {
  favorite: FavoriteItem;
  onToggleFavorite?: (id: string, type: 'file' | 'folder') => void;
  onDownload?: (id: string) => void;
  onShare?: (id: string) => void;
  onDelete?: (id: string, type: 'file' | 'folder') => void;
}

const FavoriteCard = ({ 
  favorite, 
  onToggleFavorite, 
  onDownload, 
  onShare, 
  onDelete 
}: FavoriteCardProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getIcon = () => {
    if (favorite.type === 'folder') {
      return <Folder className="w-8 h-8 text-blue-500" />;
    }
    return <FileText className="w-8 h-8 text-gray-500" />;
  };

  const getTypeColor = () => {
    return favorite.type === 'folder' ? 'text-blue-600' : 'text-gray-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group"
    >
      {/* Horizontal Layout */}
      <div className="flex items-center justify-between gap-4">
        {/* Left side - Icon and Info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="p-3 bg-gray-50 rounded-lg flex-shrink-0">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 mb-1" title={favorite.name}>
              {favorite.name}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                favorite.type === 'folder' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {favorite.type === 'folder' ? 'Dossier' : 'Fichier'}
              </span>
              
              {favorite.size && (
                <div className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3" />
                  <span>{formatFileSize(favorite.size)}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Ajouté le {formatDate(favorite.createdAt)}</span>
              </div>
              
              {favorite.type === 'folder' && 'originalItem' in favorite && 'fileCount' in favorite.originalItem && (
                <span>{(favorite.originalItem as any).fileCount} fichier(s)</span>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onToggleFavorite?.(favorite.id, favorite.type)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            title="Retirer des favoris"
          >
            <Heart className="w-5 h-5 text-red-500 fill-current" />
          </motion.button>
          
          {favorite.type === 'file' && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDownload?.(favorite.id)}
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
              title="Télécharger"
            >
              <Download className="w-5 h-5 text-blue-500" />
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onShare?.(favorite.id)}
            className="p-2 hover:bg-green-50 rounded-lg transition-colors"
            title="Partager"
          >
            <Share className="w-5 h-5 text-green-500" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete?.(favorite.id, favorite.type)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default FavoriteCard;
