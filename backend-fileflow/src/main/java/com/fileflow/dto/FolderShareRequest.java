package com.fileflow.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FolderShareRequest {
    private String targetUserEmail;
    private String message;
    private String permissions; // "read", "write", "admin"
    private LocalDateTime expiresAt;
    private String password;
    private boolean requiresApproval = true;
}
