package com.fileflow.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "folder_shares")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FolderShare {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "folder_id", nullable = false)
    private Folder folder;

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @ManyToOne
    @JoinColumn(name = "target_user_id", nullable = false)
    private User targetUser;

    @Column(nullable = false)
    private String permissions = "read"; // "read", "write", "admin"

    @Column(length = 500)
    private String message;

    @CreationTimestamp
    @Column(name = "shared_at")
    private LocalDateTime sharedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private String status = "pending"; // "pending", "accepted", "rejected", "revoked"

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "requires_password")
    private boolean requiresPassword = false;

    @Column(name = "requires_approval")
    private boolean requiresApproval = true;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;
}
