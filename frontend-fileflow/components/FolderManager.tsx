import React, { useState, useEffect } from 'react';
import { fileService } from '../services/fileService';
import { FolderInfo, BreadcrumbItem } from '@/types/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { 
  Folder, 
  FolderPlus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Heart, 
  ChevronRight,
  Home,
  Search,
  FileText,
  HardDrive,
  Move,
  Copy,
  Upload,
  File,
  CheckSquare,
  Square,
  X,
  Check,
  Loader2,
  Download,
  Filter,
  Calendar,
  Star,
  Settings,
  Share2,
  Users,
  Mail
} from 'lucide-react';
import { toast } from 'react-toastify';

interface FolderManagerProps {
  onFolderSelect?: (folder: FolderInfo) => void;
  currentFolderId?: number;
  onFileUpload?: () => void;
}

const FolderManager: React.FC<FolderManagerProps> = ({ 
  onFolderSelect, 
  currentFolderId,
  onFileUpload 
}) => {
  const [folders, setFolders] = useState<FolderInfo[]>([]);
  const [currentFolder, setCurrentFolder] = useState<FolderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FolderInfo[]>([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    dateRange: 'all', // 'all', 'today', 'week', 'month', 'year'
    sizeRange: 'all', // 'all', 'small', 'medium', 'large'
    favoriteOnly: false,
    hasFiles: 'all', // 'all', 'empty', 'hasFiles'
    colorFilter: 'all', // 'all' or specific color
  });
  const [navigationStack, setNavigationStack] = useState<FolderInfo[]>([]);
  const [currentViewFolderId, setCurrentViewFolderId] = useState<number | null>(currentFolderId || null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<FolderInfo | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form states
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#3B82F6');
  const [editFolderName, setEditFolderName] = useState('');
  const [editFolderColor, setEditFolderColor] = useState('');
  const [editFolderDescription, setEditFolderDescription] = useState('');
  
  // Bulk selection states
  const [selectedFolders, setSelectedFolders] = useState<Set<number>>(new Set());
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [bulkOperation, setBulkOperation] = useState<'move' | 'copy' | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Folder sharing states
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingFolder, setSharingFolder] = useState<FolderInfo | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [sharePermissions, setSharePermissions] = useState('read');
  const [shareLoading, setShareLoading] = useState(false);
  const [pendingShares, setPendingShares] = useState<any[]>([]);
  const [sharedFolders, setSharedFolders] = useState<any[]>([]);
  const [showSharedFolders, setShowSharedFolders] = useState(false);

  useEffect(() => {
    loadFolders();
    loadPendingShares();
    loadSharedFolders();
  }, []);

  useEffect(() => {
    if (currentViewFolderId) {
      loadFolderDetails(currentViewFolderId);
    } else {
      setCurrentFolder(null);
    }
  }, [currentViewFolderId]);

  useEffect(() => {
    if (currentFolderId !== currentViewFolderId) {
      setCurrentViewFolderId(currentFolderId || null);
    }
  }, [currentFolderId]);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchFolders();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchFilters]);

  const loadFolders = async () => {
    try {
      setLoading(true);
      const folderList = await fileService.getFolders();
      setFolders(folderList);
    } catch (error) {
      toast.error("Impossible de charger les dossiers");
    } finally {
      setLoading(false);
    }
  };

  const loadPendingShares = async () => {
    try {
      const shares = await fileService.getPendingFolderShares();
      setPendingShares(shares);
    } catch (error) {
      console.error("Erreur lors du chargement des partages en attente:", error);
    }
  };

  const loadSharedFolders = async () => {
    try {
      const shares = await fileService.getSharedFoldersWithMe();
      setSharedFolders(shares);
    } catch (error) {
      console.error("Erreur lors du chargement des dossiers partagés:", error);
    }
  };

  const loadFolderDetails = async (folderId: number | null) => {
    try {
      if (folderId === null) {
        // Load root folder content
        setCurrentFolder(null);
        await loadFolders(); // Load root folders
      } else {
        const folder = await fileService.getFolderDetails(folderId);
        setCurrentFolder(folder);
      }
    } catch (error) {
      toast.error("Impossible de charger les détails du dossier");
    }
  };

  const searchFolders = async () => {
    try {
      const results = await fileService.searchFolders(searchQuery);
      
      // Apply local filters to search results
      const filteredResults = results.filter(folder => {
        // Date range filter
        if (searchFilters.dateRange !== 'all') {
          const folderDate = new Date(folder.createdAt);
          const now = new Date();
          const diffTime = now.getTime() - folderDate.getTime();
          const diffDays = diffTime / (1000 * 60 * 60 * 24);
          
          switch (searchFilters.dateRange) {
            case 'today':
              if (diffDays > 1) return false;
              break;
            case 'week':
              if (diffDays > 7) return false;
              break;
            case 'month':
              if (diffDays > 30) return false;
              break;
            case 'year':
              if (diffDays > 365) return false;
              break;
          }
        }

        // Size filter
        if (searchFilters.sizeRange !== 'all') {
          const totalSize = folder.totalSize || 0;
          switch (searchFilters.sizeRange) {
            case 'small':
              if (totalSize > 10 * 1024 * 1024) return false; // > 10MB
              break;
            case 'medium':
              if (totalSize < 10 * 1024 * 1024 || totalSize > 100 * 1024 * 1024) return false; // 10MB - 100MB
              break;
            case 'large':
              if (totalSize < 100 * 1024 * 1024) return false; // > 100MB
              break;
          }
        }

        // Favorite filter
        if (searchFilters.favoriteOnly && !folder.isFavorite) return false;

        // File content filter
        if (searchFilters.hasFiles !== 'all') {
          const hasFiles = (folder.fileCount || 0) > 0;
          if (searchFilters.hasFiles === 'empty' && hasFiles) return false;
          if (searchFilters.hasFiles === 'hasFiles' && !hasFiles) return false;
        }

        // Color filter
        if (searchFilters.colorFilter !== 'all' && folder.color !== searchFilters.colorFilter) return false;

        return true;
      });
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const folderData = {
        name: newFolderName.trim(),
        description: newFolderDescription.trim() || undefined,
        color: newFolderColor,
        parentId: currentViewFolderId
      };
      
      const newFolder = await fileService.createFolder(
        folderData.name, 
        folderData.parentId || undefined,
        folderData.description,
        folderData.color
      );
      
      if (currentViewFolderId) {
        // Refresh current folder details
        loadFolderDetails(currentViewFolderId);
      } else {
        // Refresh root folders
        loadFolders();
      }
      
      // Reset form
      setNewFolderName('');
      setNewFolderDescription('');
      setNewFolderColor('#3B82F6');
      setShowCreateModal(false);
      
      toast.success(`Le dossier "${newFolder.name}" a été créé avec succès`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la création du dossier");
    }
  };

  const updateFolder = async () => {
    if (!editingFolder) return;

    try {
      const updates: any = {};
      if (editFolderName !== editingFolder.name) updates.name = editFolderName;
      if (editFolderColor !== editingFolder.color) updates.color = editFolderColor;
      if (editFolderDescription !== editingFolder.description) updates.description = editFolderDescription;

      if (Object.keys(updates).length === 0) {
        setShowEditModal(false);
        return;
      }

      await fileService.updateFolder(editingFolder.id, updates);
      
      // Refresh data
      loadFolders();
      if (currentViewFolderId) {
        loadFolderDetails(currentViewFolderId);
      }
      
      setShowEditModal(false);
      setEditingFolder(null);
      
      toast.success("Le dossier a été modifié avec succès");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la modification");
    }
  };

  const toggleFavorite = async (folder: FolderInfo) => {
    try {
      await fileService.toggleFolderFavorite(folder.id);
      
      // Refresh data
      loadFolders();
      if (currentViewFolderId) {
        loadFolderDetails(currentViewFolderId);
      }
      
      toast.success(`Le dossier "${folder.name}" a été ${folder.isFavorite ? 'retiré des' : 'ajouté aux'} favoris`);
    } catch (error) {
      toast.error("Impossible de modifier les favoris");
    }
  };

  const deleteFolder = async (folder: FolderInfo) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le dossier "${folder.name}" ?`)) {
      return;
    }

    try {
      await fileService.deleteFolder(folder.id);
      
      // Refresh data
      loadFolders();
      if (currentViewFolderId) {
        loadFolderDetails(currentViewFolderId);
      }
      
      toast.success(`Le dossier "${folder.name}" a été supprimé`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la suppression");
    }
  };

  const moveFolder = async (folder: FolderInfo, newParentId?: number) => {
    try {
      await fileService.moveFolder(folder.id, newParentId);
      
      // Refresh data
      loadFolders();
      if (currentViewFolderId) {
        loadFolderDetails(currentViewFolderId);
      }
      
      const destination = newParentId ? 'nouveau dossier' : 'racine';
      toast.success(`Le dossier "${folder.name}" a été déplacé vers ${destination}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors du déplacement");
    }
  };

  const copyFolder = async (folder: FolderInfo, newParentId?: number, newName?: string) => {
    try {
      const copiedFolder = await fileService.copyFolder(folder.id, newParentId, newName);
      
      // Refresh data
      loadFolders();
      if (currentViewFolderId) {
        loadFolderDetails(currentViewFolderId);
      }
      
      toast.success(`Le dossier "${folder.name}" a été copié vers "${copiedFolder.name}"`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la copie");
    }
  };

  const openEditModal = (folder: FolderInfo) => {
    setEditingFolder(folder);
    setEditFolderName(folder.name);
    setEditFolderColor(folder.color || '');
    setEditFolderDescription(folder.description || '');
    setShowEditModal(true);
  };

  const handleFolderClick = (folder: FolderInfo) => {
    // Navigate into the folder
    navigateToFolder(folder);
  };

  const navigateToFolder = async (folder: FolderInfo) => {
    try {
      // Add current folder to navigation stack if we're not at root
      if (currentFolder) {
        setNavigationStack(prev => [...prev, currentFolder]);
      }
      
      // Navigate to the selected folder and load its details
      setCurrentViewFolderId(folder.id);
      await loadFolderDetails(folder.id);
      
      // Trigger onFolderSelect callback if provided
      if (onFolderSelect) {
        onFolderSelect(folder);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error('Impossible de naviguer vers ce dossier');
    }
  };

  const navigateToFolderById = async (folderId: number) => {
    try {
      // Clear navigation stack since we're jumping directly
      setNavigationStack([]);
      
      // Navigate to the selected folder and load its details
      setCurrentViewFolderId(folderId);
      await loadFolderDetails(folderId);
    } catch (error) {
      console.error('Breadcrumb navigation error:', error);
      toast.error('Impossible de naviguer vers ce dossier');
    }
  };

  const navigateBack = async () => {
    if (navigationStack.length > 0) {
      // Go back to previous folder
      const previousFolder = navigationStack[navigationStack.length - 1];
      setNavigationStack(prev => prev.slice(0, -1));
      setCurrentViewFolderId(previousFolder.id);
      await loadFolderDetails(previousFolder.id);
    } else {
      // Go back to root
      setCurrentViewFolderId(null);
      setCurrentFolder(null);
      // Load root folder content
      await loadFolderDetails(null);
    }
  };

  const navigateToRoot = async () => {
    setNavigationStack([]);
    setCurrentViewFolderId(null);
    setCurrentFolder(null);
    await loadFolderDetails(null);
  };

  // =========================
  // BULK SELECTION FUNCTIONS
  // =========================

  const toggleFolderSelection = (folderId: number) => {
    const newSelected = new Set(selectedFolders);
    if (newSelected.has(folderId)) {
      newSelected.delete(folderId);
    } else {
      newSelected.add(folderId);
    }
    setSelectedFolders(newSelected);
    
    // Auto-exit selection mode if no folders selected
    if (newSelected.size === 0) {
      setIsSelectionMode(false);
    }
  };

  const selectAllFolders = () => {
    // Get folders based on current context
    const availableFolders = currentFolder ? (currentFolder.subfolders || []) : folders;
    const allFolderIds = new Set(availableFolders.map(folder => folder.id));
    setSelectedFolders(allFolderIds);
  };

  const selectAllFiles = () => {
    // Files are only available when inside a folder
    if (currentFolder?.files) {
      const allFileIds = new Set(currentFolder.files.map(file => file.id));
      setSelectedFiles(allFileIds);
    }
  };

  const clearSelection = () => {
    setSelectedFolders(new Set());
    setSelectedFiles(new Set());
    setIsSelectionMode(false);
  };

  // File selection functions
  const toggleFileSelection = (fileId: number) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId);
    } else {
      newSelection.add(fileId);
    }
    setSelectedFiles(newSelection);
  };

  const selectAllItems = () => {
    // Select all folders (always available)
    selectAllFolders();
    
    // Select all files (only available when inside a folder)
    if (currentFolder?.files && currentFolder.files.length > 0) {
      selectAllFiles();
    }
  };

  const getSelectedItemsCount = () => {
    return selectedFolders.size + selectedFiles.size;
  };

  const startBulkOperation = (operation: 'move' | 'copy') => {
    if (selectedFolders.size === 0 && selectedFiles.size === 0) {
      toast.error('Aucun élément sélectionné');
      return;
    }
    setBulkOperation(operation);
    setShowDestinationModal(true);
  };

  const executeBulkDelete = async () => {
    if (selectedFolders.size === 0) {
      toast.error('Aucun dossier sélectionné');
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedFolders.size} dossier(s) ?`)) {
      return;
    }

    setBulkLoading(true);
    try {
      const folderIds = Array.from(selectedFolders);
      const result = await fileService.bulkDeleteFolder(folderIds);
      
      toast.success(`${result.deletedCount} dossier(s) supprimé(s) avec succès`);
      
      // Refresh current view
      if (currentViewFolderId) {
        await loadFolderDetails(currentViewFolderId);
      } else {
        await loadFolders();
      }
      
      // Trigger callback to refresh dashboard files if provided
      if (onFileUpload) {
        onFileUpload();
      }
      
      clearSelection();
    } catch (error) {
      toast.error('Erreur lors de la suppression en lot');
      console.error('Bulk delete error:', error);
    } finally {
      setBulkLoading(false);
    }
  };

  const executeUnifiedBulkOperation = async (destinationFolderId: number | null) => {
    if (!bulkOperation) return;

    setBulkLoading(true);
    try {
      // Handle folder operations
      if (selectedFolders.size > 0) {
        const folderIds = Array.from(selectedFolders);
        let result;

        if (bulkOperation === 'move') {
          result = await fileService.bulkMoveFolder(folderIds, destinationFolderId);
          toast.success(`${result.length} dossier(s) déplacé(s) avec succès`);
        } else if (bulkOperation === 'copy') {
          result = await fileService.bulkCopyFolder(folderIds, destinationFolderId);
          toast.success(`${result.length} dossier(s) copié(s) avec succès`);
        }
      }

      // Handle file operations
      if (selectedFiles.size > 0) {
        const fileIds = Array.from(selectedFiles);
        
        if (bulkOperation === 'move') {
          await fileService.bulkMoveFiles(fileIds, destinationFolderId);
          toast.success(`${selectedFiles.size} fichier${selectedFiles.size > 1 ? 's déplacés' : ' déplacé'} avec succès`);
        } else if (bulkOperation === 'copy') {
          await fileService.bulkCopyFiles(fileIds, destinationFolderId);
          toast.success(`${selectedFiles.size} fichier${selectedFiles.size > 1 ? 's copiés' : ' copié'} avec succès`);
        }
      }

      // Refresh current view and trigger callback
      if (currentViewFolderId) {
        await loadFolderDetails(currentViewFolderId);
      } else {
        await loadFolders();
      }
      
      // Trigger callback to refresh dashboard files if provided
      if (onFileUpload) {
        onFileUpload();
      }

      clearSelection();
      setShowDestinationModal(false);
      setBulkOperation(null);
    } catch (error) {
      toast.error(`Erreur lors de l'opération en lot`);
      console.error('Bulk operation error:', error);
    } finally {
      setBulkLoading(false);
    }
  };

  const executeBulkOperation = async (destinationFolderId: number | null) => {
    if (selectedFolders.size === 0 || !bulkOperation) return;

    setBulkLoading(true);
    try {
      const folderIds = Array.from(selectedFolders);
      let result;

      if (bulkOperation === 'move') {
        result = await fileService.bulkMoveFolder(folderIds, destinationFolderId);
        toast.success(`${result.length} dossier(s) déplacé(s) avec succès`);
      } else if (bulkOperation === 'copy') {
        result = await fileService.bulkCopyFolder(folderIds, destinationFolderId);
        toast.success(`${result.length} dossier(s) copié(s) avec succès`);
      }

      // Refresh current view
      if (currentViewFolderId) {
        await loadFolderDetails(currentViewFolderId);
      } else {
        await loadFolders();
      }

      clearSelection();
      setShowDestinationModal(false);
      setBulkOperation(null);
    } catch (error) {
      toast.error(`Erreur lors de l'opération en lot`);
      console.error('Bulk operation error:', error);
    } finally {
      setBulkLoading(false);
    }
  };

  // Bulk file operations
  const executeBulkDeleteFiles = async () => {
    if (selectedFiles.size === 0) {
      toast.error('Aucun fichier sélectionné');
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedFiles.size} fichier${selectedFiles.size > 1 ? 's' : ''} ?`)) {
      return;
    }

    setBulkLoading(true);
    try {
      const fileIds = Array.from(selectedFiles);
      
      // Delete files one by one (could be optimized with bulk API)
      for (const fileId of fileIds) {
        await fileService.deleteFile(fileId);
      }

      toast.success(`${selectedFiles.size} fichier${selectedFiles.size > 1 ? 's supprimés' : ' supprimé'} avec succès`);
      
      // Refresh current folder
      if (currentViewFolderId) {
        await loadFolderDetails(currentViewFolderId);
      } else {
        await loadFolderDetails(null);
      }

      // Trigger callback to refresh dashboard files if provided
      if (onFileUpload) {
        onFileUpload();
      }

      clearSelection();
    } catch (error) {
      toast.error('Erreur lors de la suppression des fichiers');
      console.error('Bulk file delete error:', error);
    } finally {
      setBulkLoading(false);
    }
  };

  const executeBulkDownloadFiles = async () => {
    if (selectedFiles.size === 0) {
      toast.error('Aucun fichier sélectionné');
      return;
    }

    setBulkLoading(true);
    try {
      const files = currentFolder?.files?.filter(file => selectedFiles.has(file.id)) || [];
      
      for (const file of files) {
        if (file.fileName) {
          await fileService.downloadFile(file.id, file.fileName);
          // Small delay between downloads to avoid overwhelming the browser
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      toast.success(`${selectedFiles.size} fichier${selectedFiles.size > 1 ? 's téléchargés' : ' téléchargé'} avec succès`);
      clearSelection();
    } catch (error) {
      toast.error('Erreur lors du téléchargement des fichiers');
      console.error('Bulk file download error:', error);
    } finally {
      setBulkLoading(false);
    }
  };

  const executeBulkFileOperation = async (destinationFolderId: number | null) => {
    if (selectedFiles.size === 0 || !bulkOperation) return;

    setBulkLoading(true);
    try {
      const fileIds = Array.from(selectedFiles);
      
      if (bulkOperation === 'move') {
        await fileService.bulkMoveFiles(fileIds, destinationFolderId);
        toast.success(`${selectedFiles.size} fichier${selectedFiles.size > 1 ? 's déplacés' : ' déplacé'} avec succès`);
      } else if (bulkOperation === 'copy') {
        await fileService.bulkCopyFiles(fileIds, destinationFolderId);
        toast.success(`${selectedFiles.size} fichier${selectedFiles.size > 1 ? 's copiés' : ' copié'} avec succès`);
      }

      // Refresh current folder
      if (currentViewFolderId) {
        await loadFolderDetails(currentViewFolderId);
      } else {
        await loadFolders();
      }

      clearSelection();
      setShowDestinationModal(false);
      setBulkOperation(null);
    } catch (error) {
      toast.error(`Erreur lors de l'opération sur les fichiers`);
      console.error('Bulk file operation error:', error);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        await fileService.uploadFile(file, (progress) => {
          const totalProgress = ((i * 100) + progress) / files.length;
          setUploadProgress(totalProgress);
        }, currentViewFolderId || undefined);
      }

      // Refresh the current folder to show new files
      if (currentViewFolderId) {
        loadFolderDetails(currentViewFolderId);
      } else {
        loadFolders();
      }
      
      toast.success(`${files.length} fichier(s) téléchargé(s) avec succès`);
      
      // Trigger callback to refresh dashboard files if provided
      if (onFileUpload) {
        onFileUpload();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors du téléchargement");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setShowUploadModal(false);
      // Reset file input
      event.target.value = '';
    }
  };

  // =========================
  // FOLDER SHARING FUNCTIONS
  // =========================

  const openShareModal = (folder: FolderInfo) => {
    setSharingFolder(folder);
    setShareEmail('');
    setShareMessage('');
    setSharePermissions('read');
    setShowShareModal(true);
  };

  const shareFolder = async () => {
    if (!sharingFolder || !shareEmail.trim()) {
      toast.error("Email requis pour partager le dossier");
      return;
    }

    setShareLoading(true);
    try {
      await fileService.shareFolder(sharingFolder.id, {
        targetUserEmail: shareEmail.trim(),
        message: shareMessage.trim() || undefined,
        permissions: sharePermissions,
        requiresApproval: true
      });

      toast.success(`Dossier "${sharingFolder.name}" partagé avec ${shareEmail}`);
      setShowShareModal(false);
      setSharingFolder(null);
      setShareEmail('');
      setShareMessage('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors du partage");
    } finally {
      setShareLoading(false);
    }
  };

  const handleShareResponse = async (shareId: number, accept: boolean) => {
    try {
      await fileService.respondToFolderShare(shareId, accept);
      toast.success(accept ? "Partage accepté" : "Partage refusé");
      
      // Refresh pending shares and shared folders
      await loadPendingShares();
      if (accept) {
        await loadSharedFolders();
        await loadFolders(); // Refresh main folder view
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la réponse");
    }
  };

  const renderBreadcrumb = () => {
    if (!currentFolder) return null;

    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">
        <button 
          onClick={navigateToRoot}
          className="flex items-center gap-1 hover:text-blue-600 transition-colors"
        >
          <Home className="h-4 w-4" />
          <span>Accueil</span>
        </button>
        {currentFolder.breadcrumb && currentFolder.breadcrumb.map((item, index) => (
          <React.Fragment key={item.id}>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <button 
              onClick={() => {
                // Navigate to this breadcrumb level
                if (index === currentFolder.breadcrumb.length - 1) {
                  // Current folder, do nothing
                  return;
                }
                // Navigate to the clicked breadcrumb folder
                navigateToFolderById(item.id);
              }}
              className={`hover:text-blue-600 transition-colors ${
                index === currentFolder.breadcrumb.length - 1 ? 'text-gray-900 font-medium' : ''
              }`}
            >
              {item.name}
            </button>
          </React.Fragment>
        ))}
        {navigationStack.length > 0 && (
          <>
            <div className="ml-auto">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={navigateBack}
                className="text-xs"
              >
                ← Retour
              </Button>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderFolderCard = (folder: FolderInfo) => {
    const isSelected = selectedFolders.has(folder.id);
    
    return (
      <Card 
        key={folder.id} 
        className={`cursor-pointer hover:shadow-md transition-all bg-white ${
          isSelected ? 'ring-2 ring-blue-500 shadow-md' : ''
        } ${isSelectionMode ? 'select-none' : ''}`}
        onClick={(e) => {
          if (isSelectionMode) {
            e.stopPropagation();
            toggleFolderSelection(folder.id);
          } else {
            handleFolderClick(folder);
          }
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              {/* Selection checkbox (visible in selection mode) */}
              {isSelectionMode && (
                <div 
                  className="flex items-center justify-center w-6 h-6 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFolderSelection(folder.id);
                  }}
                >
                  {isSelected ? (
                    <CheckSquare className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              )}
              
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ 
                  backgroundColor: folder.color || '#3B82F6',
                  color: 'white'
                }}
              >
                <Folder className="h-5 w-5" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">{folder.name}</h3>
                  {folder.isFavorite && (
                    <Heart className="h-4 w-4 text-red-500 fill-current" />
                  )}
                </div>
                
                {folder.description && (
                  <p className="text-sm text-gray-600 mt-1">{folder.description}</p>
                )}
                
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {folder.fileCount} fichiers
                  </span>
                  <span className="flex items-center gap-1">
                    <Folder className="h-3 w-3" />
                    {folder.subfolderCount} dossiers
                  </span>
                  <span className="flex items-center gap-1">
                    <HardDrive className="h-3 w-3" />
                    {folder.formattedSize}
                  </span>
                </div>
              </div>
            </div>

            {/* Dropdown menu (hidden in selection mode) */}
            {!isSelectionMode && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(folder);
                  }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(folder);
                  }}>
                    <Heart className="h-4 w-4 mr-2" />
                    {folder.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    openShareModal(folder);
                  }}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    // For demo, move to root - in real app, show folder selector
                    moveFolder(folder, undefined);
                  }}>
                    <Move className="h-4 w-4 mr-2" />
                    Déplacer vers racine
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    // For demo, copy to same location with new name - in real app, show copy dialog
                    const newName = prompt('Nouveau nom pour la copie:', `${folder.name} (Copie)`);
                    if (newName) {
                      copyFolder(folder, folder.parentId, newName);
                    }
                  }}>
                    <Copy className="h-4 w-4 mr-2" />
                    Dupliquer
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFolder(folder);
                    }}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderFileCard = (file: any) => {
    const isSelected = selectedFiles.has(file.id);
    
    return (
      <Card 
        key={file.id} 
        className={`bg-white transition-all ${
          isSelected ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-sm'
        } ${isSelectionMode ? 'select-none' : ''}`}
        onClick={(e) => {
          if (isSelectionMode) {
            e.stopPropagation();
            toggleFileSelection(file.id);
          }
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {/* Selection checkbox (visible in selection mode) */}
            {isSelectionMode && (
              <div 
                className="flex items-center justify-center w-6 h-6 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFileSelection(file.id);
                }}
              >
                {isSelected ? (
                  <CheckSquare className="h-5 w-5 text-blue-600" />
                ) : (
                  <Square className="h-5 w-5 text-gray-400" />
                )}
              </div>
            )}
            
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <File className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">{file.name || file.originalFileName || file.fileName}</h4>
              <p className="text-xs text-gray-500">
                {file.formattedSize || `${Math.round(file.fileSize / 1024)} KB`}
              </p>
            </div>
            
            {/* Dropdown menu (hidden in selection mode) */}
            {!isSelectionMode && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    if (file.fileName) {
                      fileService.downloadFile(file.id, file.fileName);
                    }
                  }}>
                    <FileText className="h-4 w-4 mr-2" />
                    Télécharger
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
                        try {
                          await fileService.deleteFile(file.id);
                          toast.success('Fichier supprimé avec succès');
                          // Refresh the current folder to reflect the deletion
                          if (currentViewFolderId) {
                            await loadFolderDetails(currentViewFolderId);
                          } else {
                            await loadFolderDetails(null);
                          }
                        } catch (error) {
                          toast.error('Erreur lors de la suppression du fichier');
                        }
                      }
                    }}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with search and action buttons */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher des dossiers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1"
            >
              <Filter className={`h-4 w-4 ${showAdvancedSearch ? 'text-blue-600' : 'text-gray-400'}`} />
            </Button>
          </div>
          
          {/* Advanced Search Filters */}
          {showAdvancedSearch && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
              <div className="grid grid-cols-2 gap-4">
                {/* Date Range Filter */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-700">Période de création</Label>
                  <select
                    value={searchFilters.dateRange}
                    onChange={(e) => setSearchFilters({...searchFilters, dateRange: e.target.value})}
                    className="w-full text-xs border border-gray-200 rounded px-2 py-1"
                  >
                    <option value="all">Toutes les dates</option>
                    <option value="today">Aujourd'hui</option>
                    <option value="week">Cette semaine</option>
                    <option value="month">Ce mois</option>
                    <option value="year">Cette année</option>
                  </select>
                </div>

                {/* Size Range Filter */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-700">Taille</Label>
                  <select
                    value={searchFilters.sizeRange}
                    onChange={(e) => setSearchFilters({...searchFilters, sizeRange: e.target.value})}
                    className="w-full text-xs border border-gray-200 rounded px-2 py-1"
                  >
                    <option value="all">Toutes tailles</option>
                    <option value="small">Petit (&lt; 10MB)</option>
                    <option value="medium">Moyen (10-100MB)</option>
                    <option value="large">Grand (&gt; 100MB)</option>
                  </select>
                </div>

                {/* File Content Filter */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-700">Contenu</Label>
                  <select
                    value={searchFilters.hasFiles}
                    onChange={(e) => setSearchFilters({...searchFilters, hasFiles: e.target.value})}
                    className="w-full text-xs border border-gray-200 rounded px-2 py-1"
                  >
                    <option value="all">Tous les dossiers</option>
                    <option value="hasFiles">Avec fichiers</option>
                    <option value="empty">Vides</option>
                  </select>
                </div>

                {/* Color Filter */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-700">Couleur</Label>
                  <select
                    value={searchFilters.colorFilter}
                    onChange={(e) => setSearchFilters({...searchFilters, colorFilter: e.target.value})}
                    className="w-full text-xs border border-gray-200 rounded px-2 py-1"
                  >
                    <option value="all">Toutes couleurs</option>
                    <option value="#3B82F6">Bleu</option>
                    <option value="#10B981">Vert</option>
                    <option value="#F59E0B">Orange</option>
                    <option value="#EF4444">Rouge</option>
                    <option value="#8B5CF6">Violet</option>
                    <option value="#F97316">Orange foncé</option>
                  </select>
                </div>
              </div>

              {/* Favorites Filter */}
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="favoriteOnly"
                  checked={searchFilters.favoriteOnly}
                  onChange={(e) => setSearchFilters({...searchFilters, favoriteOnly: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <Label htmlFor="favoriteOnly" className="text-xs text-gray-700">Favoris uniquement</Label>
              </div>

              {/* Reset Filters */}
              <div className="mt-3 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchFilters({
                    dateRange: 'all',
                    sizeRange: 'all',
                    favoriteOnly: false,
                    hasFiles: 'all',
                    colorFilter: 'all',
                  })}
                  className="text-xs"
                >
                  Réinitialiser filtres
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {/* Show Shared Folders Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowSharedFolders(!showSharedFolders)}
            disabled={isSelectionMode}
            className={`text-sm bg-white border-gray-300 ${showSharedFolders ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
          >
            <Users className="h-4 w-4 mr-1" />
            Partagés ({sharedFolders.length})
          </Button>
          {/* Bulk Selection Toggle */}
          <Button
            variant="outline"
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              if (isSelectionMode) {
                clearSelection();
              }
            }}
            className={`bg-white border-gray-300 ${isSelectionMode ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
          >
            {isSelectionMode ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Annuler
              </>
            ) : (
              <>
                <CheckSquare className="h-4 w-4 mr-2" />
                Sélectionner
              </>
            )}
          </Button>

          {/* Upload Button */}
          <label htmlFor="file-upload">
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isUploading || isSelectionMode}
              asChild
            >
              <span>
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? `${Math.round(uploadProgress)}%` : 'Télécharger'}
              </span>
            </Button>
          </label>
          <input
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Create Folder Button */}
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isSelectionMode}
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                Nouveau dossier
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-xl">
            <DialogHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FolderPlus className="h-6 w-6 text-blue-600" />
              </div>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Créer un nouveau dossier
              </DialogTitle>
              <DialogDescription className="text-gray-700 mt-2 font-medium">
                {currentFolder ? 
                  `Créer un dossier dans "${currentFolder.name}"` : 
                  "Créer un dossier à la racine de votre espace"
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Folder Name */}
              <div className="space-y-2">
                <Label htmlFor="folderName" className="text-sm font-semibold text-gray-900">
                  Nom du dossier *
                </Label>
                <div className="relative">
                  <Folder className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
                  <Input
                    id="folderName"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Mon nouveau dossier"
                    className="pl-10 bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder:text-gray-500"
                    onKeyPress={(e) => e.key === 'Enter' && createFolder()}
                    autoFocus
                  />
                </div>
                {newFolderName.trim() && (
                  <p className="text-xs text-green-700 font-medium flex items-center gap-1">
                    <span className="w-1 h-1 bg-green-600 rounded-full"></span>
                    Nom valide
                  </p>
                )}
              </div>

              {/* Folder Description */}
              <div className="space-y-2">
                <Label htmlFor="folderDescription" className="text-sm font-semibold text-gray-900">
                  Description (optionnel)
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-600" />
                  <textarea
                    id="folderDescription"
                    value={newFolderDescription}
                    onChange={(e) => setNewFolderDescription(e.target.value)}
                    placeholder="Décrivez le contenu de ce dossier..."
                    className="w-full pl-10 pr-3 py-2 bg-white border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none text-gray-900 placeholder:text-gray-500"
                    rows={3}
                  />
                </div>
              </div>

              {/* Folder Color */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-900">
                  Couleur du dossier
                </Label>
                <div className="space-y-3">
                  {/* Preview of selected color */}
                  <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg border-2 border-gray-300">
                    <div 
                      className="w-8 h-8 rounded-lg shadow-sm border-2 border-white"
                      style={{ backgroundColor: newFolderColor }}
                    />
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-gray-700" />
                      <span className="text-sm text-gray-800 font-medium">Aperçu: {newFolderName || 'Mon nouveau dossier'}</span>
                    </div>
                  </div>
                  
                  {/* Color palette */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { color: '#3B82F6', name: 'Bleu océan', light: '#EBF4FF' },
                      { color: '#10B981', name: 'Vert émeraude', light: '#ECFDF5' },
                      { color: '#F59E0B', name: 'Orange soleil', light: '#FFFBEB' },
                      { color: '#EF4444', name: 'Rouge cerise', light: '#FEF2F2' },
                      { color: '#8B5CF6', name: 'Violet royal', light: '#F5F3FF' },
                      { color: '#06B6D4', name: 'Cyan tropical', light: '#ECFEFF' },
                      { color: '#84CC16', name: 'Vert lime', light: '#F7FEE7' },
                      { color: '#F97316', name: 'Orange vif', light: '#FFF7ED' }
                    ].map((colorOption) => (
                      <div key={colorOption.color} className="text-center">
                        <button
                          type="button"
                          onClick={() => setNewFolderColor(colorOption.color)}
                          className={`w-12 h-12 rounded-xl border-3 transition-all duration-300 mx-auto block ${
                            newFolderColor === colorOption.color
                              ? 'border-gray-800 scale-110 shadow-lg ring-2 ring-gray-300'
                              : 'border-gray-200 hover:border-gray-400 hover:scale-105 shadow-md'
                          }`}
                          style={{ backgroundColor: colorOption.color }}
                          title={colorOption.name}
                        />
                        <span className={`text-xs mt-1 block transition-colors font-medium ${
                          newFolderColor === colorOption.color 
                            ? 'text-gray-900 font-bold' 
                            : 'text-gray-700'
                        }`}>
                          {colorOption.name.split(' ')[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t-2 border-gray-300">
              <Button 
                onClick={createFolder} 
                disabled={!newFolderName.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2.5 transition-colors duration-200 shadow-md"
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                Créer le dossier
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCreateModal(false);
                  setNewFolderName('');
                  setNewFolderDescription('');
                  setNewFolderColor('#3B82F6');
                }}
                className="px-6 py-2.5 border-2 border-gray-400 text-gray-800 hover:bg-gray-100 hover:border-gray-500 transition-colors duration-200 font-semibold"
              >
                Annuler
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Breadcrumb */}
      {renderBreadcrumb()}

      {/* Pending Share Notifications */}
      {pendingShares.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-yellow-800">
              Demandes de partage en attente ({pendingShares.length})
            </h3>
          </div>
          <div className="space-y-3">
            {pendingShares.map((share: any) => (
              <div key={share.id} className="bg-white rounded-lg p-3 border border-yellow-100">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {share.ownerEmail} souhaite partager "{share.folderName}"
                    </p>
                    <p className="text-sm text-gray-600">
                      Permissions: {share.permissions === 'read' ? 'Lecture seule' : 
                                   share.permissions === 'write' ? 'Lecture et écriture' : 'Administration'}
                    </p>
                    {share.message && (
                      <p className="text-sm text-gray-500 italic mt-1">"{share.message}"</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => handleShareResponse(share.id, true)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Accepter
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShareResponse(share.id, false)}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Refuser
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shared Folders Section */}
      {showSharedFolders && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Dossiers partagés avec moi ({sharedFolders.length})
            </h2>
          </div>
          
          {sharedFolders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sharedFolders.map((share: any) => (
                <Card key={share.id} className="cursor-pointer hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: '#3B82F6', color: 'white' }}
                        >
                          <Folder className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{share.folderName}</h3>
                            <Badge variant="outline" className="text-xs">
                              {share.permissions === 'read' ? 'Lecture' : 
                               share.permissions === 'write' ? 'Écriture' : 'Admin'}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1">
                            Partagé par {share.ownerEmail}
                          </p>
                          
                          {share.message && (
                            <p className="text-xs text-gray-500 mt-1 italic">
                              "{share.message}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 text-gray-500">
              <Share2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun dossier partagé</p>
            </div>
          )}
        </div>
      )}

      {/* Search results */}
      {searchQuery.trim() && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Résultats de recherche ({searchResults.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map(renderFolderCard)}
          </div>
        </div>
      )}

      {/* Folder and file list */}
      {!searchQuery.trim() && !showSharedFolders && (
        <div className="space-y-6">
          {/* Bulk Actions Toolbar */}
          {isSelectionMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-blue-900">
                      {getSelectedItemsCount() > 0 
                        ? `${getSelectedItemsCount()} élément${getSelectedItemsCount() > 1 ? 's' : ''} sélectionné${getSelectedItemsCount() > 1 ? 's' : ''}`
                        : 'Mode sélection activé - Cliquez sur les éléments pour les sélectionner'
                      }
                    </span>
                    {selectedFolders.size > 0 && (
                      <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">
                        {selectedFolders.size} dossier{selectedFolders.size > 1 ? 's' : ''}
                      </span>
                    )}
                    {selectedFiles.size > 0 && (
                      <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                        {selectedFiles.size} fichier{selectedFiles.size > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllItems}
                      className="text-xs"
                    >
                      Tout sélectionner
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSelection}
                      className="text-xs"
                    >
                      {getSelectedItemsCount() > 0 ? 'Tout désélectionner' : 'Annuler'}
                    </Button>
                  </div>
                </div>
                
                {/* Only show action buttons when items are selected */}
                {getSelectedItemsCount() > 0 && (
                  <div className="flex items-center gap-2">
                    {/* Move and Copy operations - show for any selection */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startBulkOperation('move')}
                      disabled={bulkLoading}
                      className="text-sm"
                    >
                      <Move className="h-4 w-4 mr-1" />
                      Déplacer
                      {selectedFolders.size > 0 && selectedFiles.size > 0 ? '' : 
                       selectedFolders.size > 0 ? ' dossiers' : ' fichiers'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startBulkOperation('copy')}
                      disabled={bulkLoading}
                      className="text-sm"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copier
                      {selectedFolders.size > 0 && selectedFiles.size > 0 ? '' : 
                       selectedFolders.size > 0 ? ' dossiers' : ' fichiers'}
                    </Button>
                    
                    {/* File-specific operations */}
                    {selectedFiles.size > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={executeBulkDownloadFiles}
                        disabled={bulkLoading}
                        className="text-sm"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Télécharger fichiers
                      </Button>
                    )}
                    
                    {/* Delete operation - show for both folders and files */}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (selectedFolders.size > 0 && selectedFiles.size > 0) {
                          // Mixed selection - ask user what to delete
                          const choice = confirm(`Supprimer ${selectedFolders.size} dossier${selectedFolders.size > 1 ? 's' : ''} et ${selectedFiles.size} fichier${selectedFiles.size > 1 ? 's' : ''} ?`);
                          if (choice) {
                            Promise.all([
                              selectedFolders.size > 0 ? executeBulkDelete() : Promise.resolve(),
                              selectedFiles.size > 0 ? executeBulkDeleteFiles() : Promise.resolve()
                            ]);
                          }
                        } else if (selectedFolders.size > 0) {
                          executeBulkDelete();
                        } else if (selectedFiles.size > 0) {
                          executeBulkDeleteFiles();
                        }
                      }}
                      disabled={bulkLoading}
                      className="text-sm"
                    >
                      {bulkLoading ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-1" />
                      )}
                      Supprimer
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <h2 className="text-lg font-semibold">
            {currentFolder ? `Contenu de "${currentFolder.name}"` : 'Dossiers racine'}
            ({currentFolder ? (currentFolder.subfolders?.length || 0) + (currentFolder.files?.length || 0) : folders.length})
          </h2>
          
          {/* Subfolders */}
          {(currentFolder ? currentFolder.subfolders || [] : folders).length > 0 && (
            <div>
              <h3 className="text-md font-medium mb-3 text-gray-700">Dossiers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(currentFolder ? currentFolder.subfolders || [] : folders).map(renderFolderCard)}
              </div>
            </div>
          )}
          
          {/* Files */}
          {currentFolder?.files && currentFolder.files.length > 0 && (
            <div>
              <h3 className="text-md font-medium mb-3 text-gray-700">Fichiers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentFolder.files.map(renderFileCard)}
              </div>
            </div>
          )}
          
          {/* Empty state */}
          {(currentFolder ? 
            (currentFolder.subfolders?.length === 0 && currentFolder.files?.length === 0) : 
            folders.length === 0
          ) && (
            <div className="text-center p-8 text-gray-500">
              <Folder className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun contenu trouvé</p>
              <p className="text-sm">
                {currentFolder ? 
                  "Ce dossier est vide. Ajoutez des fichiers ou créez des sous-dossiers." :
                  "Créez votre premier dossier pour commencer"
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le dossier</DialogTitle>
            <DialogDescription>
              Modifier les propriétés du dossier "{editingFolder?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editFolderName">Nom</Label>
              <Input
                id="editFolderName"
                value={editFolderName}
                onChange={(e) => setEditFolderName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editFolderColor">Couleur</Label>
              <Input
                id="editFolderColor"
                type="color"
                value={editFolderColor}
                onChange={(e) => setEditFolderColor(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editFolderDescription">Description</Label>
              <Input
                id="editFolderDescription"
                value={editFolderDescription}
                onChange={(e) => setEditFolderDescription(e.target.value)}
                placeholder="Description optionnelle"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={updateFolder}>
                Sauvegarder
              </Button>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Destination Selection Modal */}
      <Dialog open={showDestinationModal} onOpenChange={setShowDestinationModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {bulkOperation === 'move' ? 'Déplacer' : 'Copier'} les éléments sélectionnés
            </DialogTitle>
            <DialogDescription>
              Choisissez la destination pour {getSelectedItemsCount()} élément{getSelectedItemsCount() > 1 ? 's' : ''}.
              {selectedFolders.size > 0 && (
                <span className="block text-blue-600">{selectedFolders.size} dossier{selectedFolders.size > 1 ? 's' : ''}</span>
              )}
              {selectedFiles.size > 0 && (
                <span className="block text-green-600">{selectedFiles.size} fichier{selectedFiles.size > 1 ? 's' : ''}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => executeUnifiedBulkOperation(null)}
                disabled={bulkLoading}
                className="w-full justify-start"
              >
                <Folder className="h-4 w-4 mr-2" />
                Racine
              </Button>
              
              {folders
                .filter(folder => !selectedFolders.has(folder.id))
                .map(folder => (
                  <Button
                    key={folder.id}
                    variant="outline"
                    onClick={() => executeUnifiedBulkOperation(folder.id)}
                    disabled={bulkLoading}
                    className="w-full justify-start"
                  >
                    <div 
                      className="w-4 h-4 rounded mr-2"
                      style={{ backgroundColor: folder.color || '#3B82F6' }}
                    />
                    {folder.name}
                  </Button>
                ))}
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowDestinationModal(false)}
                disabled={bulkLoading}
                className="flex-1"
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Folder Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Share2 className="h-6 w-6 text-blue-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Partager le dossier
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Partagez "{sharingFolder?.name}" avec d'autres utilisateurs
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="shareEmail" className="text-sm font-medium text-gray-700">
                Email de l'utilisateur *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="shareEmail"
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="utilisateur@exemple.com"
                  className="pl-10"
                  disabled={shareLoading}
                />
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Permissions
              </Label>
              <select
                value={sharePermissions}
                onChange={(e) => setSharePermissions(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded px-3 py-2"
                disabled={shareLoading}
              >
                <option value="read">Lecture seule</option>
                <option value="write">Lecture et écriture</option>
                <option value="admin">Administration</option>
              </select>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="shareMessage" className="text-sm font-medium text-gray-700">
                Message (optionnel)
              </Label>
              <Input
                id="shareMessage"
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                placeholder="Message pour l'utilisateur..."
                disabled={shareLoading}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={shareFolder}
                disabled={!shareEmail.trim() || shareLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {shareLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Partage en cours...
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowShareModal(false)}
                disabled={shareLoading}
                className="px-6"
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FolderManager;
