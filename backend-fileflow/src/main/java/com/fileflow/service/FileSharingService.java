package com.fileflow.service;

import com.fileflow.dto.FileShareDTO;
import com.fileflow.entity.File;
import com.fileflow.entity.FileShare;
import com.fileflow.entity.User;
import com.fileflow.repository.FileRepository;
import com.fileflow.repository.FileShareRepository;
import com.fileflow.repository.UserRepository;
import com.fileflow.security.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FileSharingService {

    private final FileShareRepository fileShareRepository;
    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.base-url:http://localhost:8088}")
    private String baseUrl;

    public FileShareDTO createFileShare(Long fileId, Long userId, String shareType, 
                                       Integer expirationDays, String password, Boolean allowDownload) {
        
        // Vérifier que le fichier appartient à l'utilisateur
        File file = fileRepository.findByIdAndUserId(fileId, userId)
            .orElseThrow(() -> new RuntimeException("File not found or access denied"));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        FileShare fileShare = new FileShare();
        fileShare.setFile(file);
        fileShare.setTargetUser(user);
        fileShare.setShareToken(UUID.randomUUID().toString());
        fileShare.setShareType(shareType != null ? shareType : "public");
        fileShare.setAllowDownload(allowDownload != null ? allowDownload : true);
        
        if (password != null && !password.trim().isEmpty()) {
            fileShare.setPasswordHash(passwordEncoder.encode(password));
        }
        
        if (expirationDays != null && expirationDays > 0) {
            fileShare.setExpiresAt(LocalDateTime.now().plusDays(expirationDays));
        }

        fileShare = fileShareRepository.save(fileShare);
        return convertToDTO(fileShare);
    }

    public List<FileShareDTO> getFileShares(Long fileId, Long userId) {
        List<FileShare> shares = fileShareRepository.findActiveSharesByFileAndUser(fileId, userId);
        return shares.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public Map<String, Object> getSharedFile(String shareToken, String password) {
        FileShare share = fileShareRepository.findActiveShareByToken(shareToken, LocalDateTime.now())
            .orElseThrow(() -> new RuntimeException("Share not found or expired"));

        // Vérifier le mot de passe si nécessaire
        if (share.getPasswordHash() != null) {
            if (password == null || !passwordEncoder.matches(password, share.getPasswordHash())) {
                throw new RuntimeException("Invalid password");
            }
        }

        // Incrémenter le compteur d'accès
        fileShareRepository.incrementAccessCount(share.getId());

        Map<String, Object> result = new HashMap<>();
        result.put("fileId", share.getFile().getId());
        result.put("fileName", share.getFile().getOriginalFileName());
        result.put("fileSize", share.getFile().getFileSize());
        result.put("contentType", share.getFile().getContentType());
        result.put("allowDownload", share.getAllowDownload());
        result.put("shareType", share.getShareType());
        result.put("accessCount", share.getAccessCount() + 1);

        return result;
    }

    public void revokeShare(Long shareId, Long userId) {
        FileShare share = fileShareRepository.findById(shareId)
            .orElseThrow(() -> new RuntimeException("Share not found"));

        if (!share.getTargetUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        share.setIsActive(false);
        fileShareRepository.save(share);
    }

    public List<FileShareDTO> getUserShares(Long userId) {
        List<FileShare> shares = fileShareRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return shares.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Direct user-to-user sharing methods
    public void shareFileWithUser(Long fileId, Long userId, String targetEmail) {
        File file = fileRepository.findByIdAndUserId(fileId, userId)
            .orElseThrow(() -> new RuntimeException("File not found or access denied"));
            
        User targetUser = userRepository.findByEmail(targetEmail)
            .orElseThrow(() -> new RuntimeException("Target user not found"));

        if (fileShareRepository.existsByFileIdAndTargetUserId(fileId, targetUser.getId())) {
            throw new RuntimeException("File is already shared with this user");
        }

        FileShare share = FileShare.builder()
            .file(file)
            .targetUser(targetUser)
            .shareType("direct")
            .build();

        fileShareRepository.save(share);
    }

    public boolean respondToShareRequest(Long shareId, boolean accept) {
        FileShare share = fileShareRepository.findById(shareId)
            .orElseThrow(() -> new RuntimeException("Share request not found"));
            
        share.setResponse(accept);
        share.setIsActive(accept);
        fileShareRepository.save(share);
        return accept;
    }

    public List<FileShare> getFilesSharedWithMe(Long userId) {
        return fileShareRepository.findByTargetUserIdAndIsActiveTrue(userId);
    }

    public List<FileShare> getFilesSharedByMe(Long userId) {
        return fileShareRepository.findByFileUserIdAndShareType(userId, "direct");
    }

    public void unshareFileWithUser(Long fileId, String userEmail, Long ownerId) {
        User targetUser = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
            
        FileShare share = fileShareRepository.findByFileIdAndTargetUserIdAndFileUserId(fileId, targetUser.getId(), ownerId)
            .orElseThrow(() -> new RuntimeException("Share not found"));
            
        fileShareRepository.delete(share);
    }

    private FileShareDTO convertToDTO(FileShare share) {
        FileShareDTO dto = new FileShareDTO();
        dto.setId(share.getId());
        dto.setFileId(share.getFile().getId());
        dto.setFileName(share.getFile().getOriginalFileName());
        dto.setShareToken(share.getShareToken());
        dto.setShareType(share.getShareType());
        dto.setPasswordProtected(share.getPasswordHash() != null);
        dto.setAllowDownload(share.getAllowDownload());
        dto.setExpiresAt(share.getExpiresAt());
        dto.setCreatedAt(share.getCreatedAt());
        dto.setAccessCount(share.getAccessCount());
        dto.setIsActive(share.getIsActive());
        dto.setShareUrl(baseUrl + "/api/sharing/shared/" + share.getShareToken());
        return dto;
    }

}
