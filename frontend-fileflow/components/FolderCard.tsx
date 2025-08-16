'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Folder,
  MoreVertical,
  Users,
  Eye,
  Edit3,
  Trash2,
} from 'lucide-react';
import { toast } from 'react-toastify';

interface FolderCardProps {
  folder: any;
  onRefresh?: () => void;
}

const FolderCard = ({ folder, onRefresh }: FolderCardProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getPermissionLabel = (permission: string) => {
    switch (permission) {
      case 'READ':
        return 'Lecture';
      case 'WRITE':
        return 'Écriture';
      case 'ADMIN':
        return 'Admin';
      default:
        return permission;
    }
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'READ':
        return 'text-green-600 bg-green-50';
      case 'WRITE':
        return 'text-blue-600 bg-blue-50';
      case 'ADMIN':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 group relative"
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl text-amber-600 bg-amber-50`}>
          <Folder className="w-8 h-8" />
        </div>
        
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-slate-400" />
          </button>
          
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-10"
            >
              <button
                onClick={() => {
                  // Handle view folder
                  toast.info('Navigation vers le dossier...');
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
              >
                <Eye className="w-4 h-4" />
                Ouvrir
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Folder Info */}
      <div className="mb-4">
        <h3 className="font-semibold text-slate-800 text-lg truncate mb-2">
          {folder.folderName || folder.name}
        </h3>
        
        {/* Permission Badge */}
        {folder.permission && (
          <div className="mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPermissionColor(folder.permission)}`}>
              {getPermissionLabel(folder.permission)}
            </span>
          </div>
        )}

        {/* Shared with info */}
        {folder.sharedWith && (
          <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
            <Users className="w-4 h-4" />
            <span>Partagé avec {folder.sharedWith}</span>
          </div>
        )}

        {/* Owner info */}
        {folder.ownerEmail && (
          <div className="text-slate-500 text-sm mb-2">
            Propriétaire: {folder.ownerEmail}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100">
        <span>
          {folder.createdAt ? formatDate(folder.createdAt) : 
           folder.sharedAt ? `Partagé le ${formatDate(folder.sharedAt)}` : ''}
        </span>
        <div className="flex items-center gap-2">
          <Folder className="w-3 h-3" />
          <span>Dossier</span>
        </div>
      </div>
    </motion.div>
  );
};

export default FolderCard;
