import { useCallback, useState } from 'react';
import { useFileStore } from '../store/fileStore';
import { fileService, FileDTO } from '../services/fileService';
import { toast } from 'react-toastify';

export const useUpload = () => {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);
  const { addFile } = useFileStore();

  // Fonction pour convertir FileDTO en FileItem
  const convertToFileItem = (fileDto: FileDTO) => ({
    id: fileDto.id.toString(), // Conversion Long vers string
    name: fileDto.originalFileName,
    originalFileName: fileDto.originalFileName,
    type: fileDto.contentType,
    size: fileDto.fileSize,
    fileUsersEmails: fileDto.fileUsersEmails || [],
    createdAt: fileDto.createdAt,
    updatedAt: fileDto.updatedAt,
    isFavorite: fileDto.isFavorite,
  });

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    const uploadPromises = files.map(async (file) => {
      const fileId = `${file.name}-${Date.now()}`;
      
      try {
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
        
        // fileService.uploadFile retourne directement FileDTO
        const fileMetadata = await fileService.uploadFile(file, (progress) => {
          setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
        });
        
        // Conversion et ajout du fichier
        const fileItem = convertToFileItem(fileMetadata);
        addFile(fileItem);
        
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
        
        return fileMetadata;
      } catch (error: any) {
        console.error('Upload failed:', error);
        
        // Meilleure gestion des erreurs
        let message = `Échec du téléversement de ${file.name}`;
        
        if (error.response?.status === 400) {
          message = error.response?.data?.message || 'Fichier invalide ou données manquantes';
        } else if (error.response?.status === 413) {
          message = 'Fichier trop volumineux';
        } else if (error.response?.status === 401) {
          message = 'Session expirée, veuillez vous reconnecter';
        }
        
        toast.error(message);
        
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
        
        throw error;
      }
    });

    try {
      const results = await Promise.allSettled(uploadPromises);
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
      
      if (successful > 0) {
        toast.success(`${successful} fichier(s) téléversé(s) avec succès`);
      }
      
      if (failed > 0) {
        toast.error(`${failed} fichier(s) ont échoué lors du téléversement`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur lors du téléversement');
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFiles,
    uploadProgress,
    isUploading,
  };
};