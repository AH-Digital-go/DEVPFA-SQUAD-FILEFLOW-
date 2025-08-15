import React, { useState, useEffect } from 'react';
import { fileService} from '../services/fileService';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Copy, Eye, EyeOff, Share2, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';
import { FileShare, ShareFileRequest } from '@/types/types';

interface FileShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: number;
  fileName: string;
}

const FileShareModal: React.FC<FileShareModalProps> = ({
  isOpen,
  onClose,
  fileId,
  fileName
}) => {
  const [shares, setShares] = useState<FileShare[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [shareType, setShareType] = useState<'public' | 'private'>('public');
  const [expirationDays, setExpirationDays] = useState<string>('');
  const [password, setPassword] = useState('');
  const [allowDownload, setAllowDownload] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadShares();
    }
  }, [isOpen, fileId]);

  const loadShares = async () => {
    try {
      setLoading(true);
      const fileShares = await fileService.getFileShares(fileId);
      setShares(fileShares);
    } catch (error) {
      toast.error("Impossible de charger les partages");
    } finally {
      setLoading(false);
    }
  };

  const createShare = async () => {
    try {
      setCreating(true);
      
      const shareRequest: ShareFileRequest = {
        shareType,
        allowDownload,
        ...(expirationDays && { expirationDays: parseInt(expirationDays) }),
        ...(password && { password })
      };

      const newShare = await fileService.createFileShare(fileId, shareRequest);
      setShares([newShare, ...shares]);
      
      // Reset form
      setShowCreateForm(false);
      setShareType('public');
      setExpirationDays('');
      setPassword('');
      setAllowDownload(true);
      
      toast.success("Le lien de partage a été créé avec succès");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la création du partage");
    } finally {
      setCreating(false);
    }
  };

  const revokeShare = async (shareId: number) => {
    try {
      await fileService.revokeShare(shareId);
      setShares(shares.filter(share => share.id !== shareId));
      toast.success("Le partage a été supprimé avec succès");
    } catch (error) {
      toast.error("Impossible de supprimer le partage");
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Le lien a été copié dans le presse-papiers");
    } catch (error) {
      toast.error("Impossible de copier le lien");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Partager le fichier
          </DialogTitle>
          <DialogDescription>
            Gérer les partages pour <strong>{fileName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bouton créer nouveau partage */}
          {!showCreateForm && (
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="w-full"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Créer un nouveau partage
            </Button>
          )}

          {/* Formulaire de création */}
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nouveau partage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shareType">Type de partage</Label>
                    <Select value={shareType} onValueChange={(value: 'public' | 'private') => setShareType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Privé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiration">Expiration (jours)</Label>
                    <Input
                      id="expiration"
                      type="number"
                      placeholder="Optionnel"
                      value={expirationDays}
                      onChange={(e) => setExpirationDays(e.target.value)}
                      min="1"
                      max="365"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe (optionnel)</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Protéger par mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowDownload"
                    checked={allowDownload}
                    onCheckedChange={setAllowDownload}
                  />
                  <Label htmlFor="allowDownload">Autoriser le téléchargement</Label>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={createShare} 
                    disabled={creating}
                    className="flex-1"
                  >
                    {creating ? "Création..." : "Créer le partage"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateForm(false)}
                    disabled={creating}
                  >
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Liste des partages existants */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Partages existants ({shares.length})
            </h3>
            
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : shares.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                Aucun partage pour ce fichier
              </div>
            ) : (
              shares.map((share) => (
                <Card key={share.id} className={isExpired(share.expiresAt) ? "opacity-60" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={share.shareType === 'public' ? 'default' : 'secondary'}>
                            {share.shareType === 'public' ? 'Public' : 'Privé'}
                          </Badge>
                          {share.passwordProtected && (
                            <Badge variant="outline">Protégé</Badge>
                          )}
                          {!share.allowDownload && (
                            <Badge variant="outline">Lecture seule</Badge>
                          )}
                          {isExpired(share.expiresAt) && (
                            <Badge variant="destructive">Expiré</Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <p>Créé le {formatDate(share.createdAt)}</p>
                          {share.expiresAt && (
                            <p>Expire le {formatDate(share.expiresAt)}</p>
                          )}
                          <p>{share.accessCount} accès</p>
                        </div>

                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                          <code className="text-xs flex-1 break-all">
                            {share.shareUrl}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(share.shareUrl)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(share.shareUrl, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => revokeShare(share.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileShareModal;
