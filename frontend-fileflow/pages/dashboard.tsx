'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import {
  Upload,
  Files,
  Heart,
  TrendingUp,
  HardDrive,
  Plus,
  Calendar,
  Activity,
  Grid3X3,
  List,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Folder,
  FolderPlus,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useFileStore } from '../store/fileStore';
import { fileService } from '../services/fileService';
import FileCard from '../components/FileCard';
import UploadModal from '../components/UploadModal';
import FolderManager from '../components/FolderManager';

const DashboardPage = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'folders'>('files');
  const [currentPage, setCurrentPage] = useState(1);
  const [filesPerPage, setFilesPerPage] = useState(6);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { user } = useAuthStore();
  const { files, favorites, totalSize, setFiles } = useFileStore();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuthStore();

  const loadFiles = useCallback(async () => {
    try {
      const filesData = await fileService.getFiles();
      // Convert FileDTO[] to FileItem[]
      const mappedFiles = filesData.map(file => ({
        id: file.id.toString(),
        name: file.fileName,
        originalFileName: file.originalFileName,
        type: file.contentType,
        size: file.fileSize,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        isFavorite: file.isFavorite,
        url: `/api/files/download/${file.id}`,
        thumbnail: undefined
      }));
      setFiles(mappedFiles);
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  }, [setFiles]);

  useEffect(() => {
    if(isAuthenticated) {
      loadFiles();
    }
    
    // Animate dashboard on load
    if (dashboardRef.current) {
      gsap.fromTo(
        dashboardRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      );
    }
  }, [loadFiles]);

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0 || isNaN(bytes)) return '0 GB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Sorting logic
  const sortedFiles = [...files].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'date':
      default:
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pagination logic
  const totalFiles = sortedFiles.length;
  const totalPages = Math.ceil(totalFiles / filesPerPage);
  const startIndex = (currentPage - 1) * filesPerPage;
  const endIndex = startIndex + filesPerPage;
  const currentFiles = sortedFiles.slice(startIndex, endIndex);

  const storageUsed = totalSize || 0;
  const storageLimit = 10 * 1024 * 1024 * 1024; // 10GB
  const storagePercentage = storageUsed > 0 ? (storageUsed / storageLimit) * 100 : 0;

  const stats = [
    {
      title: 'Total des fichiers',
      value: files.length,
      icon: Files,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Favoris',
      value: favorites.length,
      icon: Heart,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
    {
      title: 'Stockage utilisé',
      value: formatFileSize(storageUsed),
      icon: HardDrive,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Activité',
      value: 'En ligne',
      icon: Activity,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ];

  return (
    <motion.div
      ref={dashboardRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Welcome Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              <h1 className="text-3xl font-bold mb-2">
                Bienvenue, {user?.firstName} ! 👋
              </h1>
              <p className="text-blue-100 text-lg">
                Gérez vos fichiers facilement et en toute sécurité
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUploadModal(true)}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Téléverser</span>
            </motion.button>
          </div>
          
          <div className="mt-6 flex items-center space-x-6 text-sm text-blue-100">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Dernière connexion: Aujourd&#39;hui</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>{files.length} fichiers au total</span>
            </div>
          </div>
        </div>
        
        {/* Background decorations */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-indigo-400/20 rounded-full blur-xl" />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.title}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Storage Usage */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Utilisation du stockage</h3>
          <span className="text-sm text-slate-500">
            {formatFileSize(storageUsed)} / {formatFileSize(storageLimit)}
          </span>
        </div>
        
        <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(storagePercentage, 100)}%` }}
            transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
            className={`h-3 rounded-full ${
              storagePercentage > 80 ? 'bg-red-500' : 
              storagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
          />
        </div>
        
        <p className="text-xs text-slate-500">
          {storagePercentage.toFixed(1)}% utilisé
        </p>
      </motion.div>

      {/* Recent Files */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        {/* Tabs Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('files')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'files'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Files className="w-4 h-4" />
              Mes fichiers
            </button>
            <button
              onClick={() => setActiveTab('folders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'folders'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Folder className="w-4 h-4" />
              Mes dossiers
            </button>
          </div>
          
          {/* Actions for Files Tab */}
          {activeTab === 'files' && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'size')}
                  className="text-sm border border-slate-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Date</option>
                  <option value="name">Nom</option>
                  <option value="size">Taille</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                >
                  <ArrowUpDown className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-500'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-500'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'files' ? (
          currentFiles.length > 0 ? (
            <>
              <div className={`gap-6 ${
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'flex flex-col space-y-4'
              }`}>
                {currentFiles.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                   <FileCard file={file} />
                  </motion.div>
                ))}
              </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">
                    Affichage {startIndex + 1}-{Math.min(endIndex, totalFiles)} sur {totalFiles} fichiers
                  </span>
                  <select
                    value={filesPerPage}
                    onChange={(e) => {
                      setFilesPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="text-sm border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={6}>6 par page</option>
                    <option value={12}>12 par page</option>
                    <option value={24}>24 par page</option>
                    <option value={48}>48 par page</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      if (pageNumber > totalPages) return null;
                      
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`px-3 py-1 rounded-lg transition-colors ${
                            currentPage === pageNumber
                              ? 'bg-blue-600 text-white'
                              : 'hover:bg-slate-100 text-slate-600'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-slate-50 rounded-2xl"
          >
            <Upload className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">
              Aucun fichier pour le moment
            </h3>
            <p className="text-slate-500 mb-6">
              Commencez par téléverser votre premier fichier
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Téléverser un fichier
            </motion.button>
          </motion.div>
        )
        ) : (
          /* Folders Tab Content */
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <FolderManager />
          </div>
        )}
      </motion.div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
    </motion.div>
  );
};

export default DashboardPage;