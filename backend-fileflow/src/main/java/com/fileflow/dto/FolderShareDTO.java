package com.fileflow.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FolderShareDTO {
    private Long id;
    private Long folderId;
    private String folderName;
    private String ownerEmail;
    private String targetUserEmail;
    private String permissions;
    private String message;
    private LocalDateTime sharedAt;
    private LocalDateTime expiresAt;
    private String status; // "pending", "accepted", "rejected", "revoked"
    private boolean requiresPassword;
}
