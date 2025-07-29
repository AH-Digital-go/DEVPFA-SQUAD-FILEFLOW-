package com.fileflow.controller;

import com.fileflow.utils.ApiResponse;
import com.fileflow.dto.FileDTO;
import com.fileflow.security.CustomUserDetails;
import com.fileflow.service.FileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "File Management", description = "File management APIs")
public class FileController {

    private final FileService fileService;

    @PostMapping("/upload")
    @Operation(summary = "Upload a file")
    public ResponseEntity<ApiResponse<FileDTO>> uploadFile(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            FileDTO uploadedFile = fileService.uploadFile(file, userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", uploadedFile));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get user files")
    public ResponseEntity<ApiResponse<?>> getUserFiles(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String search,
            Authentication authentication) {

        log.info("Received GET /api/files with page={}, size={}, search={}", page, size, search);

        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            List<FileDTO> files;

            if (search != null && !search.isBlank()) {
                files = fileService.searchFiles(userDetails.getId(), search.trim());
            } else {
                // Toujours utiliser la pagination avec des valeurs par défaut
                int pageNumber = page != null ? page : 0;
                int pageSize = size != null ? size : 20;
                Pageable pageable = PageRequest.of(pageNumber, pageSize);
                files = fileService.getUserFiles(userDetails.getId(), pageable).getContent();
            }

            return ResponseEntity.ok(ApiResponse.success("Files retrieved", files));
        } catch (Exception e) {
            log.error("Error in GET /api/files", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get file details")
    public ResponseEntity<ApiResponse<FileDTO>> getFileDetails(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            FileDTO file = fileService.getFileDetails(id, userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("File details retrieved", file));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}/download")
    @Operation(summary = "Download a file")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            Resource resource = fileService.downloadFile(id, userDetails.getId());
            
            // Get file metadata for proper headers
            FileDTO fileMetadata = fileService.getFileDetails(id, userDetails.getId());
            
            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(fileMetadata.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                    "attachment; filename=\"" + fileMetadata.getOriginalFileName() + "\"")
                .body(resource);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/rename")
    @Operation(summary = "Rename a file")
    public ResponseEntity<ApiResponse<FileDTO>> renameFile(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String newName = request.get("fileName");
            
            if (newName == null || newName.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("File name is required"));
            }
            
            FileDTO renamedFile = fileService.renameFile(id, userDetails.getId(), newName.trim());
            return ResponseEntity.ok(ApiResponse.success("File renamed successfully", renamedFile));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a file")
    public ResponseEntity<ApiResponse<Void>> deleteFile(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            fileService.deleteFile(id, userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("File deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get detailed file statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFileStatistics(Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            Map<String, Object> statistics = fileService.getFileStatistics(userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("File statistics retrieved successfully", statistics));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
}
