package com.fileflow.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "folders")
@Setter
@Getter
@EqualsAndHashCode(callSuper = false)
public class Folder {
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "path", nullable = false)
    private String path;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference("user-folders")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Folder parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Folder> subfolders = new ArrayList<>();

    @OneToMany(mappedBy = "folder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<File> files = new ArrayList<>();

    @Column(name = "is_favorite", nullable = false)
    private Boolean isFavorite = false;

    @Column(name = "color")
    private String color;

    @Column(name = "description")
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Helper methods
    public String getFullPath() {
        if (parent == null) {
            return "/" + name;
        }
        return parent.getFullPath() + "/" + name;
    }

    public int getFileCount() {
        return files.size();
    }

    public int getSubfolderCount() {
        return subfolders.size();
    }

    public long getTotalSize() {
        long size = files.stream().mapToLong(File::getFileSize).sum();
        for (Folder subfolder : subfolders) {
            size += subfolder.getTotalSize();
        }
        return size;
    }
}
