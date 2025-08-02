package com.fileflow.service;

import com.fileflow.config.FileStorageConfig;
import com.fileflow.dto.FileDTO;
import com.fileflow.entity.File;
import com.fileflow.entity.Folder;
import com.fileflow.entity.User;
import com.fileflow.repository.FileRepository;
import com.fileflow.repository.FolderRepository;
import com.fileflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FileService {

    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final FolderRepository folderRepository;
    private final FileStorageConfig fileStorageConfig;

    @Value("${file.max-size}")
    private Long maxFileSize;

    public FileDTO uploadFile(MultipartFile file, Long userId, Long folderId) {
        // Validate file
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        if (file.getSize() > maxFileSize) {
            throw new RuntimeException("File size exceeds maximum allowed size");
        }

        // Get user
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Check storage quota
        Long currentStorageUsed = fileRepository.sumFileSizeByUserId(userId);
        if (currentStorageUsed == null) currentStorageUsed = 0L;

        if (currentStorageUsed + file.getSize() > user.getMaxStorage()) {
            throw new RuntimeException("Storage quota exceeded");
        }

        try {
            // Create user directory if it doesn't exist
            Path userDir = Paths.get(fileStorageConfig.getUploadDir(), userId.toString());
            if (!Files.exists(userDir)) {
                Files.createDirectories(userDir);
            }

            // Generate unique filename
            String fileUuid = UUID.randomUUID().toString();
            String originalFileName = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String fileName = fileUuid + fileExtension;

            // Save file to disk
            Path filePath = userDir.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Save metadata to database
            File fileMetadata = new File();
            fileMetadata.setFileName(fileName);
            fileMetadata.setOriginalFileName(originalFileName);
            fileMetadata.setFilePath(filePath.toString());
            fileMetadata.setContentType(file.getContentType());
            fileMetadata.setFileSize(file.getSize());
            fileMetadata.setFileUuid(fileUuid);
            fileMetadata.setUser(user);

            // Assign to folder if specified
            if (folderId != null) {
                Folder folder = folderRepository.findByIdAndUserId(folderId, userId)
                    .orElseThrow(() -> new RuntimeException("Folder not found"));
                fileMetadata.setFolder(folder);
            }

            File savedFile = fileRepository.save(fileMetadata);

            // Update user storage
            user.setStorageUsed(currentStorageUsed + file.getSize());
            userRepository.save(user);

            return convertToDTO(savedFile);

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    // Backward compatibility method for existing upload functionality
    public FileDTO uploadFile(MultipartFile file, Long userId) {
        return uploadFile(file, userId, null);
    }

    public List<FileDTO> getUserFiles(Long userId) {
        List<File> files = fileRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return files.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    // to a wil
    public List<FileDTO> getFilesByOriginalFileName(Long userId, String name) {
        List<File> files = fileRepository.findByUserIdAndOriginalFileNameContainingIgnoreCase(userId, name);
        return files.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Page<FileDTO> getUserFiles(Long userId, Pageable pageable) {
        Page<File> files = fileRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return files.map(this::convertToDTO);
    }

    public FileDTO getFileDetails(Long fileId, Long userId) {
        File file = fileRepository.findByIdAndUserId(fileId, userId)
            .orElseThrow(() -> new RuntimeException("File not found"));
        return convertToDTO(file);
    }

    public Resource downloadFile(Long fileId, Long userId) {
        File file = fileRepository.findByIdAndUserId(fileId, userId)
            .orElseThrow(() -> new RuntimeException("File not found"));

        try {
            Path filePath = Paths.get(file.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("File not found on disk");
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("File not found", e);
        }
    }

    public FileDTO renameFile(Long fileId, Long userId, String newName) {
        File file = fileRepository.findByIdAndUserId(fileId, userId)
            .orElseThrow(() -> new RuntimeException("File not found"));

        // Check if new name already exists for this user
        if (fileRepository.existsByFileNameAndUserId(newName, userId)) {
            throw new RuntimeException("File with this name already exists");
        }

        file.setOriginalFileName(newName);
        File savedFile = fileRepository.save(file);
        return convertToDTO(savedFile);
    }

    public void deleteFile(Long fileId, Long userId) {
        File file = fileRepository.findByIdAndUserId(fileId, userId)
            .orElseThrow(() -> new RuntimeException("File not found"));

        try {
            // Delete file from disk
            Path filePath = Paths.get(file.getFilePath());
            Files.deleteIfExists(filePath);

            // Update user storage
            User user = file.getUser();
            user.setStorageUsed(user.getStorageUsed() - file.getFileSize());
            userRepository.save(user);

            // Delete metadata from database
            fileRepository.delete(file);

        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file", e);
        }
    }

    public List<FileDTO> getFavoriteFiles(Long userId) {
        List<File> files = fileRepository.findByUserIdAndIsFavoriteTrueOrderByCreatedAtDesc(userId);
        return files.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public FileDTO toggleFavorite(Long fileId, Long userId) {
        File file = fileRepository.findByIdAndUserId(fileId, userId)
            .orElseThrow(() -> new RuntimeException("File not found"));

        file.setIsFavorite(!file.getIsFavorite());
        File savedFile = fileRepository.save(file);
        return convertToDTO(savedFile);
    }

    public List<FileDTO> searchFiles(Long userId, String searchTerm) {
        List<File> files = fileRepository.searchFilesByUserIdAndName(userId, searchTerm);
        return files.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    private FileDTO convertToDTO(File file) {
        FileDTO dto = new FileDTO();
        dto.setId(file.getId());
        dto.setFileName(file.getFileName());
        dto.setOriginalFileName(file.getOriginalFileName());
       // dto.setName(file.getOriginalFileName());
        dto.setContentType(file.getContentType());
        dto.setFileSize(file.getFileSize());
        dto.setFileUuid(file.getFileUuid());
        dto.setIsFavorite(file.getIsFavorite());
        dto.setCreatedAt(file.getCreatedAt());
        dto.setUpdatedAt(file.getUpdatedAt());
        dto.setFileExtension(file.getFileExtension());
        return dto;
    }

    public Map<String, Object> getFileStatistics(Long userId) {
        List<File> userFiles = fileRepository.findByUserIdOrderByCreatedAtDesc(userId);

        Map<String, Object> statistics = new HashMap<>();

        // Statistiques générales
        statistics.put("totalFiles", userFiles.size());
        statistics.put("totalSize", userFiles.stream().mapToLong(File::getFileSize).sum());
        statistics.put("favoriteFiles", userFiles.stream().mapToLong(f -> f.getIsFavorite() ? 1 : 0).sum());

        // Statistiques par type de fichier
        Map<String, Long> fileTypeStats = userFiles.stream()
            .collect(Collectors.groupingBy(
                file -> file.getFileExtension() != null ? file.getFileExtension().toLowerCase() : "unknown",
                Collectors.counting()
            ));
        statistics.put("fileTypeDistribution", fileTypeStats);

        // Statistiques par taille
        Map<String, Long> sizeStats = userFiles.stream()
            .collect(Collectors.groupingBy(
                file -> {
                    long size = file.getFileSize();
                    if (size < 1024 * 1024) return "< 1MB";
                    else if (size < 10 * 1024 * 1024) return "1-10MB";
                    else if (size < 100 * 1024 * 1024) return "10-100MB";
                    else return "> 100MB";
                },
                Collectors.counting()
            ));
        statistics.put("fileSizeDistribution", sizeStats);

        // Fichiers récents (derniers 7 jours)
        long recentFiles = userFiles.stream()
            .filter(file -> file.getCreatedAt().isAfter(
                java.time.LocalDateTime.now().minusDays(7)
            ))
            .count();
        statistics.put("recentFiles", recentFiles);

        // Top 5 des plus gros fichiers
        List<Map<String, Object>> largestFiles = userFiles.stream()
            .sorted((f1, f2) -> Long.compare(f2.getFileSize(), f1.getFileSize()))
            .limit(5)
            .map(file -> {
                Map<String, Object> fileInfo = new HashMap<>();
                fileInfo.put("name", file.getOriginalFileName());
                fileInfo.put("size", file.getFileSize());
                fileInfo.put("extension", file.getFileExtension());
                return fileInfo;
            })
            .collect(Collectors.toList());
        statistics.put("largestFiles", largestFiles);

        return statistics;
    }

    public List<FileDTO> getFilesByFolder(Long folderId, Long userId) {
        List<File> files = fileRepository.findByFolderIdAndUserId(folderId, userId);
        return files.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
}
