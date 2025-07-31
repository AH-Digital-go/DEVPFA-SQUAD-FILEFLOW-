import React, { useState, useEffect } from 'react';
import { fileService, FolderInfo } from '../services/fileService';
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
  Copy
} from 'lucide-react';
import { toast } from 'react-toastify';

interface FolderManagerProps {
  onFolderSelect?: (folder: FolderInfo) => void;
  currentFolderId?: number;
}

const FolderManager: React.FC<FolderManagerProps> = ({ 
  onFolderSelect, 
  currentFolderId 
}) => {
  const [folders, setFolders] = useState<FolderInfo[]>([]);
  const [currentFolder, setCurrentFolder] = useState<FolderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FolderInfo[]>([]);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<FolderInfo | null>(null);
  
  // Form states
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#3B82F6');
  const [editFolderName, setEditFolderName] = useState('');
  const [editFolderColor, setEditFolderColor] = useState('');
  const [editFolderDescription, setEditFolderDescription] = useState('');

  useEffect(() => {
    loadFolders();
  }, []);

  useEffect(() => {
    if (currentFolderId) {
      loadFolderDetails(currentFolderId);
    }
  }, [currentFolderId]);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchFolders();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

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

  const loadFolderDetails = async (folderId: number) => {
    try {
      const folder = await fileService.getFolderDetails(folderId);
      setCurrentFolder(folder);
    } catch (error) {
      toast.error("Impossible de charger les détails du dossier");
    }
  };

  const searchFolders = async () => {
    try {
      const results = await fileService.searchFolders(searchQuery);
      setSearchResults(results);
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
        parentId: currentFolderId
      };
      
      const newFolder = await fileService.createFolder(
        folderData.name, 
        folderData.parentId,
        folderData.description,
        folderData.color
      );
      
      if (currentFolderId) {
        // Refresh current folder details
        loadFolderDetails(currentFolderId);
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
      if (currentFolderId) {
        loadFolderDetails(currentFolderId);
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
      if (currentFolderId) {
        loadFolderDetails(currentFolderId);
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
      if (currentFolderId) {
        loadFolderDetails(currentFolderId);
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
      if (currentFolderId) {
        loadFolderDetails(currentFolderId);
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
      if (currentFolderId) {
        loadFolderDetails(currentFolderId);
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
    if (onFolderSelect) {
      onFolderSelect(folder);
    }
  };

  const renderBreadcrumb = () => {
    if (!currentFolder) return null;

    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <Home className="h-4 w-4" />
        {currentFolder.breadcrumb.map((item, index) => (
          <React.Fragment key={index}>
            <span>{item}</span>
            {index < currentFolder.breadcrumb.length - 1 && (
              <ChevronRight className="h-4 w-4" />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderFolderCard = (folder: FolderInfo) => (
    <Card 
      key={folder.id} 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => handleFolderClick(folder)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
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
                <h3 className="font-medium">{folder.name}</h3>
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
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with search and create button */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher des dossiers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <FolderPlus className="h-4 w-4 mr-2" />
              Nouveau dossier
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FolderPlus className="h-6 w-6 text-blue-600" />
              </div>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Créer un nouveau dossier
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                {currentFolder ? 
                  `Créer un dossier dans "${currentFolder.name}"` : 
                  "Créer un dossier à la racine de votre espace"
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Folder Name */}
              <div className="space-y-2">
                <Label htmlFor="folderName" className="text-sm font-medium text-gray-700">
                  Nom du dossier *
                </Label>
                <div className="relative">
                  <Folder className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="folderName"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Mon nouveau dossier"
                    className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && createFolder()}
                    autoFocus
                  />
                </div>
                {newFolderName.trim() && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <span className="w-1 h-1 bg-green-600 rounded-full"></span>
                    Nom valide
                  </p>
                )}
              </div>

              {/* Folder Description */}
              <div className="space-y-2">
                <Label htmlFor="folderDescription" className="text-sm font-medium text-gray-700">
                  Description (optionnel)
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <textarea
                    id="folderDescription"
                    value={newFolderDescription}
                    onChange={(e) => setNewFolderDescription(e.target.value)}
                    placeholder="Décrivez le contenu de ce dossier..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                </div>
              </div>

              {/* Folder Color */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Couleur du dossier
                </Label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { color: '#3B82F6', name: 'Bleu' },
                    { color: '#10B981', name: 'Vert' },
                    { color: '#F59E0B', name: 'Orange' },
                    { color: '#EF4444', name: 'Rouge' },
                    { color: '#8B5CF6', name: 'Violet' },
                    { color: '#06B6D4', name: 'Cyan' },
                    { color: '#84CC16', name: 'Lime' },
                    { color: '#F97316', name: 'Amber' }
                  ].map((colorOption) => (
                    <button
                      key={colorOption.color}
                      type="button"
                      onClick={() => setNewFolderColor(colorOption.color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                        newFolderColor === colorOption.color
                          ? 'border-gray-800 scale-110 shadow-lg'
                          : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                      }`}
                      style={{ backgroundColor: colorOption.color }}
                      title={colorOption.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button 
                onClick={createFolder} 
                disabled={!newFolderName.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 transition-colors duration-200"
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
                className="px-6 py-2.5 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Annuler
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Breadcrumb */}
      {renderBreadcrumb()}

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

      {/* Folder list */}
      {!searchQuery.trim() && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            {currentFolder ? `Contenu de "${currentFolder.name}"` : 'Dossiers racine'}
            ({currentFolder ? currentFolder.subfolders?.length || 0 : folders.length})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(currentFolder ? currentFolder.subfolders || [] : folders).map(renderFolderCard)}
          </div>
          
          {(currentFolder ? currentFolder.subfolders?.length === 0 : folders.length === 0) && (
            <div className="text-center p-8 text-gray-500">
              <Folder className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun dossier trouvé</p>
              <p className="text-sm">Créez votre premier dossier pour commencer</p>
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
    </div>
  );
};

export default FolderManager;
