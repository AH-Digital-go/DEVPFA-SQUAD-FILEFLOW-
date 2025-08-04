'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import {
  File,
  Image,
  FileText,
  Video,
  Music,
  Archive,
  MoreVertical,
  Heart,
  Download,
  Edit3,
  Trash2,
  Eye,
} from 'lucide-react';
import { FileItem, useFileStore } from '../store/fileStore';
import { fileService } from '../services/fileService';
import { toast } from 'react-toastify';

interface FileCardProps {
  file: FileItem;
  onRefresh?: () => void; // Optional callback for refresh after deletion
}

const getFileIcon = (type: string) => {
  if (!type) return File;
  if (type.startsWith('image/')) return Image;
  if (type.startsWith('video/')) return Video;
  if (type.startsWith('audio/')) return Music;
  if (type.includes('pdf') || type.includes('document')) return FileText;
  if (type.includes('zip') || type.includes('rar')) return Archive;
  return File;
};

const getFileTypeColor = (type: string) => {
  if (!type) return 'text-slate-600 bg-slate-50';
  if (type.startsWith('image/')) return 'text-green-600 bg-green-50';
  if (type.startsWith('video/')) return 'text-purple-600 bg-purple-50';
  if (type.startsWith('audio/')) return 'text-blue-600 bg-blue-50';
  if (type.includes('pdf') || type.includes('document')) return 'text-red-600 bg-red-50';
  if (type.includes('zip') || type.includes('rar')) return 'text-yellow-600 bg-yellow-50';
  return 'text-slate-600 bg-slate-50';
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileCard: React.FC<FileCardProps> = ({ file, onRefresh }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.originalFileName || file.name);
  const [isHovered, setIsHovered] = useState(false);
  
  const { removeFile, updateFile, toggleFavorite: toggleStoreFavorite } = useFileStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const FileIcon = getFileIcon(file.type);
  const colorClass = getFileTypeColor(file.type);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { y: 50, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, []);

  useEffect(() => {
    if (isHovered && cardRef.current) {
      gsap.to(cardRef.current, {
        y: -8,
        scale: 1.02,
        duration: 0.3,
        ease: 'power2.out',
      });
    } else if (cardRef.current) {
      gsap.to(cardRef.current, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  }, [isHovered]);

  const handleRename = async () => {
    if (newName.trim() && newName !== (file.originalFileName || file.name)) {
      try {
        const updatedFile = await fileService.renameFile(Number(file.id), newName.trim());
        updateFile(file.id, { 
          name: updatedFile.fileName,
          originalFileName: updatedFile.originalFileName,
          type: updatedFile.contentType,
          size: updatedFile.fileSize,
          updatedAt: updatedFile.updatedAt,
          isFavorite: updatedFile.isFavorite
        });
        toast.success('Fichier renommé avec succès');
      } catch (error) {
        toast.error('Erreur lors du renommage');
        setNewName(file.originalFileName || file.name);
      }
    }
    setIsRenaming(false);
  };

  const handleDelete = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      try {
        await fileService.deleteFile(Number(file.id));
        removeFile(file.id);
        toast.success('Fichier supprimé avec succès');
        // Call refresh callback if provided (for folder context)
        if (onRefresh) {
          onRefresh();
        }
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
    setShowMenu(false);
  };

  const handleDownload = async () => {
    try {
      const fileNameToDownload = file.originalFileName || file.name;
      const blob = await fileService.downloadFile(Number(file.id), fileNameToDownload);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileNameToDownload;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Téléchargement démarré');
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
    setShowMenu(false);
  };

  const handleToggleFavorite = async () => {
    try {
      await fileService.toggleFavorite(Number(file.id));
      toggleStoreFavorite(file.id);
      toast.success(file.isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris');
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
    setShowMenu(false);
  };

  return (
    <motion.div
      ref={cardRef}
      className="group file-card bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer relative"
      whileHover={{ scale: 1.02 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* File Icon */}
      <div className={`inline-flex p-4 rounded-xl ${colorClass} mb-4`}>
        <FileIcon className="w-8 h-8" />
      </div>

      {/* File Info */}
      <div className="space-y-2">
        {isRenaming ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') {
                setNewName(file.originalFileName || file.name);
                setIsRenaming(false);
              }
            }}
            className="w-full px-2 py-1 text-sm font-semibold text-slate-900 bg-transparent border-b-2 border-blue-500 focus:outline-none"
            autoFocus
          />
        ) : (
          <h3 className="font-semibold text-slate-900 text-sm truncate">
            {file.originalFileName || file.name}
          </h3>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">{formatFileSize(file.size)}</span>
          <span className="text-xs text-slate-400">
            {new Date(file.createdAt).toLocaleDateString('fr-FR')}
          </span>
        </div>
      </div>

      {/* Favorite Badge */}
      <AnimatePresence>
        {file.isFavorite && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute top-4 right-4"
          >
            <Heart className="w-4 h-4 text-red-500 fill-current" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions Menu */}
      <div className="absolute top-4 right-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 rounded-lg hover:bg-slate-100 transition-colors opacity-20 group-hover:opacity-100 hover:opacity-100"
        >
          <MoreVertical className="w-4 h-4 text-slate-500" />
        </motion.button>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 z-50"
            >
              <div className="py-2">
                <button
                  onClick={() => setIsRenaming(true)}
                  className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Edit3 className="w-4 h-4 mr-3" />
                  Renommer
                </button>
                
                <button
                  onClick={handleDownload}
                  className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Download className="w-4 h-4 mr-3" />
                  Télécharger
                </button>
                
                <button
                  onClick={handleToggleFavorite}
                  className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Heart className={`w-4 h-4 mr-3 ${file.isFavorite ? 'text-red-500 fill-current' : ''}`} />
                  {file.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                </button>
                
                <hr className="my-2" />
                
                <button
                  onClick={handleDelete}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  Supprimer
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hover overlay */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-600/5 rounded-2xl pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FileCard;