package com.fileflow.service;

import com.fileflow.dto.BreadcrumbItem;
import com.fileflow.dto.FileDTO;
import com.fileflow.dto.FolderDTO;
import com.fileflow.entity.File;
import com.fileflow.entity.Folder;
import com.fileflow.entity.User;
import com.fileflow.config.FileStorageConfig;
import com.fileflow.repository.FileRepository;
import com.fileflow.repository.FolderRepository;
import com.fileflow.repository.FolderShareRepository;
import com.fileflow.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
public class FolderService {

    private final FolderRepository folderRepository;
    private final UserRepository userRepository;
    private final FileRepository fileRepository;
    private final FolderShareRepository folderShareRepository;
    private final FileStorageConfig fileStorageConfig;

    public FolderService(FolderRepository folderRepository, UserRepository userRepository, FileRepository fileRepository, FolderShareRepository folderShareRepository, FileStorageConfig fileStorageConfig) {
        this.folderRepository = folderRepository;
        this.userRepository = userRepository;
        this.fileRepository = fileRepository;
        this.folderShareRepository = folderShareRepository;
        this.fileStorageConfig = fileStorageConfig;
    }

    public FolderDTO createFolder(String name, Long parentId, Long userId, String description, String color) {
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
        
        // Set description and color if provided
        if (description != null && !description.trim().isEmpty()) {
            folder.setDescription(description.trim());
        }
        if (color != null && !color.trim().isEmpty()) {
            folder.setColor(color.trim());
        }

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

    @Transactional
    public void deleteFolder(Long folderId, Long userId) {
        Folder folder = folderRepository.findByIdAndUserId(folderId, userId)
            .orElseThrow(() -> new RuntimeException("Folder not found"));

        // Delete all folder shares first
        cleanupFolderShares(folder);
        
        // Delete all files in the folder first
        deleteFolderContentsRecursively(folder);
        
        // Now delete the folder itself
        folderRepository.delete(folder);
    }
    
    private void cleanupFolderShares(Folder folder) {
        // Delete all shares for this folder
        List<com.fileflow.entity.FolderShare> folderShares = folderShareRepository.findByFolderId(folder.getId());
        if (!folderShares.isEmpty()) {
            folderShareRepository.deleteAll(folderShares);
            log.info("Deleted {} folder shares for folder {}", folderShares.size(), folder.getId());
        }
        
        // Recursively clean up shares for subfolders
        for (Folder subfolder : folder.getSubfolders()) {
            cleanupFolderShares(subfolder);
        }
    }
    
    private void deleteFolderContentsRecursively(Folder folder) {
        // Delete all files in this folder
        if (!folder.getFiles().isEmpty()) {
            for (File file : new ArrayList<>(folder.getFiles())) {
                // Delete physical file from storage
                try {
                    Path filePath = Paths.get(file.getFilePath());
                    if (Files.exists(filePath)) {
                        Files.delete(filePath);
                    }
                } catch (IOException e) {
                    // Log error but continue with deletion
                    log.warn("Could not delete physical file: " + file.getFilePath(), e);
                }
                // Delete file record from database
                fileRepository.delete(file);
            }
        }
        
        // Recursively delete all subfolders
        if (!folder.getSubfolders().isEmpty()) {
            for (Folder subfolder : new ArrayList<>(folder.getSubfolders())) {
                // Clean up folder shares for this subfolder first
                cleanupFolderShares(subfolder);
                deleteFolderContentsRecursively(subfolder);
                folderRepository.delete(subfolder);
            }
        }
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

    /**
     * Move a folder to a new parent folder
     */
    public FolderDTO moveFolder(Long folderId, Long newParentId, Long userId) {
        Folder folder = folderRepository.findByIdAndUserId(folderId, userId)
            .orElseThrow(() -> new RuntimeException("Folder not found"));

        // Prevent moving a folder into itself or its descendants
        if (newParentId != null && isDescendant(folder, newParentId)) {
            throw new RuntimeException("Cannot move folder into itself or its descendants");
        }

        // Check if a folder with the same name already exists in the new location
        if (newParentId != null) {
            if (folderRepository.findByUserIdAndNameAndParentId(userId, folder.getName(), newParentId).isPresent()) {
                throw new RuntimeException("A folder with this name already exists in the destination");
            }
            
            Folder newParent = folderRepository.findByIdAndUserId(newParentId, userId)
                .orElseThrow(() -> new RuntimeException("Destination folder not found"));
            folder.setParent(newParent);
        } else {
            // Moving to root
            if (folderRepository.findByUserIdAndNameAndParentIsNull(userId, folder.getName()).isPresent()) {
                throw new RuntimeException("A folder with this name already exists in the root directory");
            }
            folder.setParent(null);
        }

        // Update paths for this folder and all its descendants
        updateFolderPath(folder);
        
        folder = folderRepository.save(folder);
        log.info("Moved folder '{}' (ID: {}) to new parent (ID: {})", folder.getName(), folderId, newParentId);
        
        return convertToDTO(folder, true);
    }

    /**
     * Copy/Duplicate a folder with all its contents
     */
    @Transactional
    public FolderDTO copyFolder(Long folderId, Long newParentId, String newName, Long userId) {
        Folder originalFolder = folderRepository.findByIdAndUserId(folderId, userId)
            .orElseThrow(() -> new RuntimeException("Folder not found"));

        // Use original name if no new name provided
        String finalName = (newName != null && !newName.trim().isEmpty()) ? newName.trim() : originalFolder.getName();
        
        // Check if a folder with the target name already exists in the destination
        if (newParentId != null) {
            if (folderRepository.findByUserIdAndNameAndParentId(userId, finalName, newParentId).isPresent()) {
                throw new RuntimeException("A folder with this name already exists in the destination");
            }
        } else {
            if (folderRepository.findByUserIdAndNameAndParentIsNull(userId, finalName).isPresent()) {
                throw new RuntimeException("A folder with this name already exists in the root directory");
            }
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            // Create the copy (database operations only)
            Folder copiedFolder = copyFolderStructureRecursively(originalFolder, newParentId, finalName, user);
            
            // Copy files in a separate method outside of transaction rollback scope
            copyAllFilesInFolderHierarchy(originalFolder, copiedFolder);
            
            log.info("Successfully copied folder '{}' (ID: {}) to '{}' (ID: {})", 
                    originalFolder.getName(), folderId, copiedFolder.getName(), copiedFolder.getId());
            
            return convertToDTO(copiedFolder, true);
        } catch (Exception e) {
            log.error("Failed to copy folder '{}': {}", originalFolder.getName(), e.getMessage(), e);
            throw new RuntimeException("Failed to copy folder: " + e.getMessage());
        }
    }

    /**
     * Check if a folder is a descendant of another folder
     */
    private boolean isDescendant(Folder folder, Long potentialAncestorId) {
        if (folder.getId().equals(potentialAncestorId)) {
            return true;
        }
        
        for (Folder child : folder.getSubfolders()) {
            if (isDescendant(child, potentialAncestorId)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Copy folder structure (database operations only) - no file copying
     */
    private Folder copyFolderStructureRecursively(Folder original, Long newParentId, String newName, User user) {
        Folder copy = new Folder();
        copy.setName(newName);
        copy.setUser(user);
        copy.setColor(original.getColor());
        copy.setDescription(original.getDescription() != null ? 
            original.getDescription() + " (Copy)" : "Copy of " + original.getName());
        copy.setIsFavorite(false); // Copies are not favorites by default

        // Set parent relationship
        if (newParentId != null) {
            Folder newParent = folderRepository.findByIdAndUserId(newParentId, user.getId())
                .orElseThrow(() -> new RuntimeException("Destination folder not found"));
            copy.setParent(newParent);
            copy.setPath(newParent.getPath() + "/" + newName);
        } else {
            copy.setPath("/" + newName);
        }

        // Save the folder first to get an ID
        copy = folderRepository.save(copy);

        // Copy subfolders recursively (database operations only)
        for (Folder subfolder : original.getSubfolders()) {
            copyFolderStructureRecursively(subfolder, copy.getId(), subfolder.getName(), user);
        }
        
        return copy;
    }

    /**
     * Copy all files in folder hierarchy - separate from database transaction
     */
    private void copyAllFilesInFolderHierarchy(Folder originalFolder, Folder copiedFolder) {
        // Copy files in the current folder
        copyFilesInFolder(originalFolder, copiedFolder);
        
        // Copy files in subfolders recursively
        List<Folder> originalSubfolders = new ArrayList<>(originalFolder.getSubfolders());
        List<Folder> copiedSubfolders = new ArrayList<>(copiedFolder.getSubfolders());
        
        // Match original subfolders with copied subfolders by name
        for (int i = 0; i < originalSubfolders.size() && i < copiedSubfolders.size(); i++) {
            copyAllFilesInFolderHierarchy(originalSubfolders.get(i), copiedSubfolders.get(i));
        }
    }

    /**
     * Copy files in a single folder
     */
    private void copyFilesInFolder(Folder originalFolder, Folder copiedFolder) {
        if (originalFolder.getFiles().isEmpty()) {
            return;
        }
        
        int successCount = 0;
        for (File originalFile : originalFolder.getFiles()) {
            try {
                copyFileToFolderSafely(originalFile, copiedFolder);
                successCount++;
                log.debug("Copied file '{}' to folder '{}'", originalFile.getOriginalFileName(), copiedFolder.getName());
            } catch (Exception e) {
                log.error("Failed to copy file '{}' to folder '{}': {}", 
                    originalFile.getOriginalFileName(), copiedFolder.getName(), e.getMessage());
                // Continue with other files
            }
        }
        
        log.info("Successfully copied {} out of {} files to folder '{}' (ID: {})", 
            successCount, originalFolder.getFiles().size(), copiedFolder.getName(), copiedFolder.getId());
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
                        FileDTO fileDto = new FileDTO();
                        fileDto.setId(file.getId());
                        fileDto.setFileName(file.getFileName());
                        fileDto.setOriginalFileName(file.getOriginalFileName());
                        fileDto.setName(file.getOriginalFileName()); // Set display name to original filename
                        fileDto.setFileSize(file.getFileSize());
                        fileDto.setContentType(file.getContentType());
                        fileDto.setFileUuid(file.getFileUuid());
                        fileDto.setIsFavorite(file.getIsFavorite());
                        fileDto.setCreatedAt(file.getCreatedAt());
                        fileDto.setUpdatedAt(file.getUpdatedAt());
                        fileDto.setFileExtension(file.getFileExtension());
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



    private List<BreadcrumbItem> buildBreadcrumb(Folder folder) {
        List<BreadcrumbItem> breadcrumb = new ArrayList<>();
        Folder current = folder;
        while (current != null) {
            breadcrumb.add(0, new BreadcrumbItem(current.getId(), current.getName()));
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

    // =========================
    // BULK OPERATIONS
    // =========================

    /**
     * Bulk move multiple folders to a new parent folder
     * @param folderIds List of folder IDs to move
     * @param newParentId Target parent folder ID (null for root)
     * @param userId User ID performing the operation
     * @return List of moved folder DTOs
     */
    @Transactional
    public List<FolderDTO> bulkMoveFolder(List<Long> folderIds, Long newParentId, Long userId) {
        if (folderIds == null || folderIds.isEmpty()) {
            throw new RuntimeException("No folders specified for bulk move");
        }

        // Validate all folders exist and belong to user
        List<Folder> foldersToMove = new ArrayList<>();
        for (Long folderId : folderIds) {
            Folder folder = folderRepository.findByIdAndUserId(folderId, userId)
                .orElseThrow(() -> new RuntimeException("Folder not found: " + folderId));
            foldersToMove.add(folder);
        }

        // Validate target parent (if not null)
        Folder newParent = null;
        if (newParentId != null) {
            newParent = folderRepository.findByIdAndUserId(newParentId, userId)
                .orElseThrow(() -> new RuntimeException("Target folder not found"));
        }

        // Validate operations - prevent circular references and conflicts
        for (Folder folder : foldersToMove) {
            validateMoveOperation(folder, newParent, userId);
        }

        // Perform bulk move
        List<FolderDTO> movedFolders = new ArrayList<>();
        for (Folder folder : foldersToMove) {
            folder.setParent(newParent);
            updateFolderPath(folder);
            Folder savedFolder = folderRepository.save(folder);
            movedFolders.add(convertToDTO(savedFolder, false));
        }

        return movedFolders;
    }

    /**
     * Bulk copy multiple folders to a new parent folder
     * @param folderIds List of folder IDs to copy
     * @param newParentId Target parent folder ID (null for root)
     * @param userId User ID performing the operation
     * @return List of copied folder DTOs
     */
    @Transactional
    public List<FolderDTO> bulkCopyFolder(List<Long> folderIds, Long newParentId, Long userId) {
        if (folderIds == null || folderIds.isEmpty()) {
            throw new RuntimeException("No folders specified for bulk copy");
        }

        // Validate all folders exist and belong to user
        List<Folder> foldersToCopy = new ArrayList<>();
        for (Long folderId : folderIds) {
            Folder folder = folderRepository.findByIdAndUserId(folderId, userId)
                .orElseThrow(() -> new RuntimeException("Folder not found: " + folderId));
            foldersToCopy.add(folder);
        }

        // Validate target parent (if not null)
        Folder newParent = null;
        if (newParentId != null) {
            newParent = folderRepository.findByIdAndUserId(newParentId, userId)
                .orElseThrow(() -> new RuntimeException("Target folder not found"));
        }

        // Perform bulk copy
        List<FolderDTO> copiedFolders = new ArrayList<>();
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
            
        for (Folder folder : foldersToCopy) {
            // Generate unique name for copy
            String copyName = generateCopyName(folder.getName(), newParent, userId);
            
            // Create copy using existing method
            Long newParentIdForCopy = newParent != null ? newParent.getId() : null;
            Folder copiedFolder = copyFolderStructureRecursively(folder, newParentIdForCopy, copyName, user);
            
            // Copy files separately to avoid transaction issues
            copyAllFilesInFolderHierarchy(folder, copiedFolder);
            
            copiedFolders.add(convertToDTO(copiedFolder, false));
        }

        return copiedFolders;
    }

    /**
     * Bulk delete multiple folders
     * @param folderIds List of folder IDs to delete
     * @param userId User ID performing the operation
     * @return Number of folders deleted
     */
    @Transactional
    public int bulkDeleteFolder(List<Long> folderIds, Long userId) {
        if (folderIds == null || folderIds.isEmpty()) {
            throw new RuntimeException("No folders specified for bulk delete");
        }

        // Validate all folders exist and belong to user
        List<Folder> foldersToDelete = new ArrayList<>();
        for (Long folderId : folderIds) {
            Folder folder = folderRepository.findByIdAndUserId(folderId, userId)
                .orElseThrow(() -> new RuntimeException("Folder not found: " + folderId));
            foldersToDelete.add(folder);
        }

        // Perform bulk delete
        int deletedCount = 0;
        for (Folder folder : foldersToDelete) {
            try {
                // Clean up folder shares first
                cleanupFolderShares(folder);
                
                // Delete folder contents recursively (files and subfolders)
                deleteFolderContentsRecursively(folder);
                
                // Delete the folder itself
                folderRepository.delete(folder);
                deletedCount++;
            } catch (Exception e) {
                // Log error but continue with other folders
                System.err.println("Failed to delete folder " + folder.getId() + ": " + e.getMessage());
            }
        }

        return deletedCount;
    }

    /**
     * Helper method to validate move operations
     */
    private void validateMoveOperation(Folder folder, Folder newParent, Long userId) {
        // Check if trying to move folder into itself
        if (newParent != null && folder.getId().equals(newParent.getId())) {
            throw new RuntimeException("Cannot move folder into itself");
        }

        // Check if trying to move folder into its descendant
        if (newParent != null && isDescendant(folder, newParent.getId())) {
            throw new RuntimeException("Cannot move folder into its descendant");
        }

        // Check for name conflicts
        String folderName = folder.getName();
        if (newParent != null) {
            if (folderRepository.findByUserIdAndNameAndParentId(userId, folderName, newParent.getId()).isPresent()) {
                throw new RuntimeException("A folder with name '" + folderName + "' already exists in the target location");
            }
        } else {
            if (folderRepository.findByUserIdAndNameAndParentIsNull(userId, folderName).isPresent()) {
                throw new RuntimeException("A folder with name '" + folderName + "' already exists in the root directory");
            }
        }
    }

    /**
     * Helper method to generate unique copy names
     */
    private String generateCopyName(String originalName, Folder parent, Long userId) {
        String baseName = originalName;
        String copyName = baseName + " - Copy";
        int counter = 1;

        // Keep trying until we find a unique name
        while (nameExistsInLocation(copyName, parent, userId)) {
            counter++;
            copyName = baseName + " - Copy (" + counter + ")";
        }

        return copyName;
    }

    /**
     * Helper method to check if name exists in location
     */
    private boolean nameExistsInLocation(String name, Folder parent, Long userId) {
        if (parent != null) {
            return folderRepository.findByUserIdAndNameAndParentId(userId, name, parent.getId()).isPresent();
        } else {
            return folderRepository.findByUserIdAndNameAndParentIsNull(userId, name).isPresent();
        }
    }

    /**
     * Helper method to copy a file to a destination folder with better error handling
     */
    @Transactional
    private void copyFileToFolderSafely(File originalFile, Folder destinationFolder) throws IOException {
        // Create new file entity
        File copiedFile = new File();
        copiedFile.setOriginalFileName(originalFile.getOriginalFileName());
        copiedFile.setFileName(generateUniqueFileName(originalFile.getOriginalFileName()));
        copiedFile.setFileSize(originalFile.getFileSize());
        copiedFile.setContentType(originalFile.getContentType());
        copiedFile.setUser(originalFile.getUser());
        copiedFile.setFolder(destinationFolder);
        // createdAt and updatedAt will be set automatically by @CreationTimestamp and @UpdateTimestamp

        // Save new file entity first
        copiedFile = fileRepository.save(copiedFile);

        try {
            // Copy physical file
            Path sourcePath = Paths.get(fileStorageConfig.getUploadDir(), String.valueOf(originalFile.getUser().getId()), originalFile.getFileName());
            
            // Check if source file exists
            if (!Files.exists(sourcePath)) {
                log.warn("Source file does not exist: {}", sourcePath);
                // Delete the database record if physical file doesn't exist
                fileRepository.delete(copiedFile);
                throw new IOException("Source file not found: " + sourcePath);
            }
            
            String destinationFolderPath = destinationFolder != null ? 
                String.valueOf(destinationFolder.getId()) : String.valueOf(originalFile.getUser().getId());
            Path destinationPath = Paths.get(fileStorageConfig.getUploadDir(), destinationFolderPath, copiedFile.getFileName());
            
            // Create destination directory if it doesn't exist
            Files.createDirectories(destinationPath.getParent());
            
            // Copy the file
            Files.copy(sourcePath, destinationPath, StandardCopyOption.REPLACE_EXISTING);
            
        } catch (Exception e) {
            // If physical file copy fails, clean up the database record
            try {
                fileRepository.delete(copiedFile);
            } catch (Exception deleteError) {
                log.error("Failed to clean up file record after copy failure: {}", deleteError.getMessage());
            }
            throw e;
        }
    }

    /**
     * Helper method to generate unique file names for copies
     */
    private String generateUniqueFileName(String originalFileName) {
        String extension = "";
        String nameWithoutExtension = originalFileName;
        
        int lastDotIndex = originalFileName.lastIndexOf('.');
        if (lastDotIndex > 0) {
            extension = originalFileName.substring(lastDotIndex);
            nameWithoutExtension = originalFileName.substring(0, lastDotIndex);
        }
        
        return nameWithoutExtension + "_copy_" + System.currentTimeMillis() + extension;
    }
}
