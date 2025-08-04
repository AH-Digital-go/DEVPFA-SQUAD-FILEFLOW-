package com.fileflow.controller;

import com.fileflow.dto.BulkDeleteResponse;
import com.fileflow.dto.BulkOperationRequest;
import com.fileflow.utils.ApiResponse;
import com.fileflow.dto.FolderDTO;
import com.fileflow.security.CustomUserDetails;
import com.fileflow.service.FolderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/folders")
@RequiredArgsConstructor
@Tag(name = "Folder Management", description = "Folder and directory management APIs")
public class FolderController {

    private final FolderService folderService;

    @PostMapping
    @Operation(summary = "Create a new folder")
    public ResponseEntity<ApiResponse<FolderDTO>> createFolder(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            
            String name = (String) request.get("name");
            Long parentId = request.get("parentId") != null ? 
                Long.valueOf(request.get("parentId").toString()) : null;
            
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Folder name is required"));
            }
            
            FolderDTO folder = folderService.createFolder(name.trim(), parentId, userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("Folder created successfully", folder));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    @Operation(summary = "Get root folders")
    public ResponseEntity<ApiResponse<List<FolderDTO>>> getRootFolders(Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            List<FolderDTO> folders = folderService.getRootFolders(userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("Root folders retrieved successfully", folders));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get folder details")
    public ResponseEntity<ApiResponse<FolderDTO>> getFolderDetails(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            FolderDTO folder = folderService.getFolderDetails(id, userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("Folder details retrieved successfully", folder));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}/subfolders")
    @Operation(summary = "Get subfolders")
    public ResponseEntity<ApiResponse<List<FolderDTO>>> getSubfolders(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            List<FolderDTO> subfolders = folderService.getSubfolders(id, userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("Subfolders retrieved successfully", subfolders));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update folder")
    public ResponseEntity<ApiResponse<FolderDTO>> updateFolder(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            
            String name = (String) request.get("name");
            String color = (String) request.get("color");
            String description = (String) request.get("description");
            
            FolderDTO folder = folderService.updateFolder(id, name, color, description, userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("Folder updated successfully", folder));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/favorite")
    @Operation(summary = "Toggle folder favorite status")
    public ResponseEntity<ApiResponse<FolderDTO>> toggleFavorite(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            FolderDTO folder = folderService.toggleFavorite(id, userDetails.getId());
            String message = folder.getIsFavorite() ? "Folder added to favorites" : "Folder removed from favorites";
            return ResponseEntity.ok(ApiResponse.success(message, folder));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete folder")
    public ResponseEntity<ApiResponse<Void>> deleteFolder(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            folderService.deleteFolder(id, userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("Folder deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/favorites")
    @Operation(summary = "Get favorite folders")
    public ResponseEntity<ApiResponse<List<FolderDTO>>> getFavoriteFolders(Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            List<FolderDTO> folders = folderService.getFavoriteFolders(userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("Favorite folders retrieved successfully", folders));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/search")
    @Operation(summary = "Search folders")
    public ResponseEntity<ApiResponse<List<FolderDTO>>> searchFolders(
            @RequestParam String query,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            List<FolderDTO> folders = folderService.searchFolders(query, userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("Folder search completed", folders));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}/move")
    @Operation(summary = "Move folder to a new parent")
    public ResponseEntity<ApiResponse<FolderDTO>> moveFolder(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            
            Long newParentId = request.get("newParentId") != null ? 
                Long.valueOf(request.get("newParentId").toString()) : null;
            
            FolderDTO folder = folderService.moveFolder(id, newParentId, userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("Folder moved successfully", folder));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/copy")
    @Operation(summary = "Copy/Duplicate folder with all contents")
    public ResponseEntity<ApiResponse<FolderDTO>> copyFolder(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            
            Long newParentId = request.get("newParentId") != null ? 
                Long.valueOf(request.get("newParentId").toString()) : null;
            String newName = (String) request.get("newName");
            
            FolderDTO folder = folderService.copyFolder(id, newParentId, newName, userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("Folder copied successfully", folder));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    // =========================
    // BULK OPERATIONS
    // =========================

    @PostMapping("/bulk/move")
    @Operation(summary = "Bulk move folders")
    public ResponseEntity<ApiResponse<List<FolderDTO>>> bulkMoveFolder(
            @RequestBody BulkOperationRequest request,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            
            List<FolderDTO> movedFolders = folderService.bulkMoveFolder(
                request.getFolderIds(), 
                request.getNewParentId(), 
                userDetails.getId()
            );
            return ResponseEntity.ok(ApiResponse.success("Folders moved successfully", movedFolders));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/bulk/copy")
    @Operation(summary = "Bulk copy folders")
    public ResponseEntity<ApiResponse<List<FolderDTO>>> bulkCopyFolder(
            @RequestBody BulkOperationRequest request,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            
            List<FolderDTO> copiedFolders = folderService.bulkCopyFolder(
                request.getFolderIds(), 
                request.getNewParentId(), 
                userDetails.getId()
            );
            return ResponseEntity.ok(ApiResponse.success("Folders copied successfully", copiedFolders));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/bulk/delete")
    @Operation(summary = "Bulk delete folders")
    public ResponseEntity<ApiResponse<BulkDeleteResponse>> bulkDeleteFolder(
            @RequestBody BulkOperationRequest request,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            
            int deletedCount = folderService.bulkDeleteFolder(request.getFolderIds(), userDetails.getId());
            
            BulkDeleteResponse response = new BulkDeleteResponse(deletedCount, request.getFolderIds().size());
            
            return ResponseEntity.ok(ApiResponse.success("Bulk delete completed", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
}
