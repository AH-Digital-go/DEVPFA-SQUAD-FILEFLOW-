package com.fileflow.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "file",
        uniqueConstraints = @UniqueConstraint(columnNames = {"id", "original_file_id"}))
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class File {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String fileName;
    
    @Column(nullable = false)
    private String originalFileName;
    
    @Column(nullable = false)
    private String filePath;
    
    @Column(nullable = false)
    private String contentType;

    private boolean isShared;
    
    @Column(nullable = false)
    private Long fileSize;
    
    @Column(nullable = false)
    private String fileUuid;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean isFavorite = false;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "original_file_id")
    private File originalFile;

    @OneToMany(mappedBy = "originalFile",cascade = CascadeType.ALL)
    private List<File> FileCopies;

    @OneToMany(mappedBy="file",cascade = CascadeType.ALL)
    private List<FileShare> fileShares;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference("user-files")
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id")
    private Folder folder;

    public String getFileExtension() {
        if (originalFileName != null && originalFileName.contains(".")) {
            return originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        return "";
    }


}
