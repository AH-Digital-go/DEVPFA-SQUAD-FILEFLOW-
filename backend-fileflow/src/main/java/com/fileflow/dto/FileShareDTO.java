package com.fileflow.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FileShareDTO {
    private Long id;
    private Long fileId;
    private String fileName;
    private String shareToken;
    private String shareType; // "public", "private"
    private Boolean passwordProtected;
    private Boolean allowDownload;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private Integer accessCount;
    private Boolean isActive;
    private String shareUrl;
}
