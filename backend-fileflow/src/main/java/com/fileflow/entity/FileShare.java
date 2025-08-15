package com.fileflow.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;



@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
@Table(
        name = "file_share",
        uniqueConstraints = @UniqueConstraint(columnNames = {"file_id", "target_id"})
)
public class FileShare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Builder.Default
    private boolean response = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id", nullable = false)
    private File file;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_id", nullable = false)
    private User targetUser;

    @Column(name = "share_token", unique = true)
    private String shareToken;

    @Column(name = "share_type")
    private String shareType; // "direct", "public", "private"

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "allow_download")
    @Builder.Default
    private Boolean allowDownload = true;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "access_count")
    @Builder.Default
    private Integer accessCount = 0;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
