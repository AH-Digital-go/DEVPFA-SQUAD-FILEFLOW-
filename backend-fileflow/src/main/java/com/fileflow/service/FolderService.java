package com.fileflow.service;

import com.fileflow.dto.FileMetadataDTO;
import com.fileflow.dto.FolderDTO;
import com.fileflow.entity.Folder;
import com.fileflow.entity.User;
import com.fileflow.repository.FolderRepository;
import com.fileflow.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
public class FolderService {

    private final FolderRepository folderRepository;
    private final UserRepository userRepository;

    @Autowired
    public FolderService(FolderRepository folderRepository, UserRepository userRepository) {
        this.folderRepository = folderRepository;
        this.userRepository = userRepository;
    }

    public FolderDTO createFolder(String name, Long parentId, Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Vérifier si un dossier avec le même nom existe déjà
        if (parentId != null) {
            if (folderRepository.findByUserIdAndNameAndParentId(userId, name, parentId).isPresent()) {
                throw new RuntimeException("A folder with this name already exists in this location");
            }
        } else {
            if (folderRepository.findByUserIdAndNameAndParentIsNull(userId, name).isPresent()) {
                throw new RuntimeException("A folder with this name already exists in the root directory");
            }
        }

        Folder folder = new Folder();
        folder.setName(name);
        folder.setUser(user);

        if (parentId != null) {
            Folder parent = folderRepository.findByIdAndUserId(parentId, userId)
                .orElseThrow(() -> new RuntimeException("Parent folder not found"));
            folder.setParent(parent);
            folder.setPath(parent.getPath() + "/" + name);
        } else {
            folder.setPath("/" + name);
        }

        folder = folderRepository.save(folder);
        return convertToDTO(folder, false);
    }

    public List<FolderDTO> getRootFolders(Long userId) {
        try {
            List<Folder> folders = folderRepository.findByUserIdAndParentIsNullOrderByNameAsc(userId);
            if (folders == null || folders.isEmpty()) {
                return new ArrayList<>(); // Retourne une liste vide plutôt que null
            }
            
            return folders.stream()
                .map(folder -> {
                    try {
                        return convertToDTO(folder, true);
                    } catch (Exception e) {
                        log.error("Error converting folder to DTO: {}", folder.getId(), e);
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting root folders for user: {}", userId, e);
            throw new RuntimeException("Could not retrieve folders. Please try again later.", e);
        }
    }

    public List<FolderDTO> getSubfolders(Long parentId, Long userId) {
        List<Folder> folders = folderRepository.findByUserIdAndParentIdOrderByNameAsc(userId, parentId);
        return folders.stream()
            .map(folder -> convertToDTO(folder, true))
            .collect(Collectors.toList());
    }

    public FolderDTO getFolderDetails(Long folderId, Long userId) {
        Folder folder = folderRepository.findByIdAndUserId(folderId, userId)
            .orElseThrow(() -> new RuntimeException("Folder not found"));
        return convertToDTO(folder, true);
    }

    public FolderDTO updateFolder(Long folderId, String name, String color, String description, Long userId) {
        Folder folder = folderRepository.findByIdAndUserId(folderId, userId)
            .orElseThrow(() -> new RuntimeException("Folder not found"));

        if (name != null && !name.equals(folder.getName())) {
            // Vérifier si un dossier avec le même nom existe déjà
            if (folder.getParent() != null) {
                if (folderRepository.findByUserIdAndNameAndParentId(userId, name, folder.getParent().getId()).isPresent()) {
                    throw new RuntimeException("A folder with this name already exists in this location");
                }
            } else {
                if (folderRepository.findByUserIdAndNameAndParentIsNull(userId, name).isPresent()) {
                    throw new RuntimeException("A folder with this name already exists in the root directory");
                }
            }
            folder.setName(name);
            updateFolderPath(folder);
        }

        if (color != null) {
            folder.setColor(color);
        }

        if (description != null) {
            folder.setDescription(description);
        }

        folder = folderRepository.save(folder);
        return convertToDTO(folder, true);
    }

    public FolderDTO toggleFavorite(Long folderId, Long userId) {
        Folder folder = folderRepository.findByIdAndUserId(folderId, userId)
            .orElseThrow(() -> new RuntimeException("Folder not found"));

        folder.setIsFavorite(!folder.getIsFavorite());
        folder = folderRepository.save(folder);
        return convertToDTO(folder, false);
    }

    public void deleteFolder(Long folderId, Long userId) {
        Folder folder = folderRepository.findByIdAndUserId(folderId, userId)
            .orElseThrow(() -> new RuntimeException("Folder not found"));

        // Vérifier que le dossier est vide
        if (!folder.getFiles().isEmpty() || !folder.getSubfolders().isEmpty()) {
            throw new RuntimeException("Cannot delete folder: folder is not empty");
        }

        folderRepository.delete(folder);
    }

    public List<FolderDTO> getFavoriteFolders(Long userId) {
        List<Folder> folders = folderRepository.findFavoriteFoldersByUserId(userId);
        return folders.stream()
            .map(folder -> convertToDTO(folder, true))
            .collect(Collectors.toList());
    }

    public List<FolderDTO> searchFolders(String query, Long userId) {
        List<Folder> folders = folderRepository.searchFoldersByName(userId, query);
        return folders.stream()
            .map(folder -> convertToDTO(folder, true))
            .collect(Collectors.toList());
    }

    private void updateFolderPath(Folder folder) {
        String newPath = folder.getParent() != null 
            ? folder.getParent().getPath() + "/" + folder.getName()
            : "/" + folder.getName();
        folder.setPath(newPath);

        // Mettre à jour récursivement les chemins des sous-dossiers
        for (Folder subfolder : folder.getSubfolders()) {
            updateFolderPath(subfolder);
        }
    }

    private FolderDTO convertToDTO(Folder folder, boolean includeChildren) {
        if (folder == null) {
            return null;
        }

        FolderDTO dto = new FolderDTO();
        dto.setId(folder.getId());
        dto.setName(folder.getName());
        dto.setPath(folder.getPath());
        dto.setFullPath(folder.getFullPath());
        dto.setIsFavorite(folder.getIsFavorite());
        dto.setColor(folder.getColor());
        dto.setDescription(folder.getDescription());
        dto.setCreatedAt(folder.getCreatedAt());
        dto.setUpdatedAt(folder.getUpdatedAt());

        // Gestion du parent (éviter la récursion)
        if (folder.getParent() != null) {
            dto.setParentId(folder.getParent().getId());
            dto.setParentName(folder.getParent().getName());
        }

        // Statistiques
        dto.setFileCount(folder.getFileCount());
        dto.setSubfolderCount(folder.getSubfolderCount());
        dto.setTotalSize(folder.getTotalSize());
        dto.setFormattedSize(formatFileSize(folder.getTotalSize()));

        // Ne charger les enfants que si demandé explicitement
        if (includeChildren) {
            // Sous-dossiers (un seul niveau)
            if (folder.getSubfolders() != null && !folder.getSubfolders().isEmpty()) {
                dto.setSubfolders(folder.getSubfolders().stream()
                    .map(subfolder -> {
                        FolderDTO subDto = new FolderDTO();
                        subDto.setId(subfolder.getId());
                        subDto.setName(subfolder.getName());
                        subDto.setPath(subfolder.getPath());
                        subDto.setIsFavorite(subfolder.getIsFavorite());
                        subDto.setColor(subfolder.getColor());
                        subDto.setFileCount(subfolder.getFileCount());
                        subDto.setSubfolderCount(subfolder.getSubfolderCount());
                        return subDto;
                    })
                    .collect(Collectors.toList()));
            }

            // Fichiers (uniquement les métadonnées de base)
            if (folder.getFiles() != null && !folder.getFiles().isEmpty()) {
                dto.setFiles(folder.getFiles().stream()
                    .map(file -> {
                        FileMetadataDTO fileDto = new FileMetadataDTO();
                        fileDto.setId(file.getId());
                        fileDto.setFileName(file.getFileName());
                        fileDto.setFileSize(file.getFileSize());
                        fileDto.setContentType(file.getContentType());
                        fileDto.setCreatedAt(file.getCreatedAt());
                        return fileDto;
                    })
                    .collect(Collectors.toList()));
            }
        }

        // Breadcrumb (uniquement si nécessaire)
        if (folder.getParent() != null) {
            dto.setBreadcrumb(buildBreadcrumb(folder));
        }

        return dto;
    }



    private List<String> buildBreadcrumb(Folder folder) {
        List<String> breadcrumb = new ArrayList<>();
        Folder current = folder;
        while (current != null) {
            breadcrumb.add(0, current.getName());
            current = current.getParent();
        }
        return breadcrumb;
    }

    private String formatFileSize(long size) {
        if (size < 1024) return size + " B";
        int exp = (int) (Math.log(size) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp - 1) + "";
        return String.format("%.1f %sB", size / Math.pow(1024, exp), pre);
    }
}
