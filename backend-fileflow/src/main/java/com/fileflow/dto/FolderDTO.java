package com.fileflow.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@JsonInclude(Include.NON_NULL)
public class FolderDTO {
    private Long id;
    private String name;
    private String path;
    private String fullPath;
    private Long parentId;
    private String parentName;
    private Boolean isFavorite;
    private String color;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Statistics
    private Integer fileCount = 0;
    private Integer subfolderCount = 0;
    private Long totalSize = 0L;
    private String formattedSize = "0 B";
    
    // Navigation - Limité à un seul niveau pour éviter la récursion
    @JsonManagedReference
    private List<FolderDTO> subfolders = new ArrayList<>();
    
    @JsonInclude(Include.NON_EMPTY)
    private List<FileDTO> files = new ArrayList<>();
    
    @JsonInclude(Include.NON_EMPTY)
    private List<BreadcrumbItem> breadcrumb = new ArrayList<>();
}
