package com.fileflow.controller;

import com.fileflow.dto.BulkDeleteResponse;
import com.fileflow.dto.BulkOperationRequest;
import com.fileflow.dto.FolderShareRequest;
import com.fileflow.dto.FolderShareDTO;
import com.fileflow.utils.ApiResponse;
import com.fileflow.dto.FolderDTO;
import com.fileflow.security.CustomUserDetails;
import com.fileflow.service.FolderService;
import com.fileflow.service.FolderShareService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/folders")
@RequiredArgsConstructor
@Tag(name = "Folder Management", description = "Folder and directory management APIs")
public class FolderController {

    private final FolderService folderService;
    private final FolderShareService folderShareService;

    @PostMapping
    @Operation(summary = "Create a new folder")
    public ResponseEntity<ApiResponse<FolderDTO>> createFolder(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            
            String name = (String) request.get("name");
            String description = (String) request.get("description");
            String color = (String) request.get("color");
            Long parentId = request.get("parentId") != null ? 
                Long.valueOf(request.get("parentId").toString()) : null;
            
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Folder name is required"));
            }
            
            FolderDTO folder = folderService.createFolder(name.trim(), parentId, userDetails.getId(), description, color);
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

    // =========================
    // FOLDER SHARING ENDPOINTS
    // =========================

    @PostMapping("/{id}/share")
    @Operation(summary = "Share folder with another user")
    public ResponseEntity<ApiResponse<FolderShareDTO>> shareFolder(
            @PathVariable Long id,
            @RequestBody FolderShareRequest request,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            
            FolderShareDTO share = folderShareService.shareFolder(id, userDetails.getId(), request);
            return ResponseEntity.ok(ApiResponse.success("Folder shared successfully", share));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}/shares")
    @Operation(summary = "Get all shares for a folder")
    public ResponseEntity<ApiResponse<List<FolderShareDTO>>> getFolderShares(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            
            List<FolderShareDTO> shares = folderShareService.getFolderShares(id, userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("Folder shares retrieved successfully", shares));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/shares/{shareId}/respond")
    @Operation(summary = "Respond to a folder share request")
    public ResponseEntity<ApiResponse<FolderShareDTO>> respondToShare(
            @PathVariable Long shareId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            
            Boolean accept = (Boolean) request.get("accept");
            if (accept == null) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Accept parameter is required"));
            }
            
            FolderShareDTO share = folderShareService.respondToShare(shareId, userDetails.getId(), accept);
            String message = accept ? "Share request accepted" : "Share request rejected";
            return ResponseEntity.ok(ApiResponse.success(message, share));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/shares/{shareId}")
    @Operation(summary = "Revoke a folder share")
    public ResponseEntity<ApiResponse<Void>> revokeShare(
            @PathVariable Long shareId,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            
            folderShareService.revokeShare(shareId, userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("Share revoked successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/shared/with-me")
    @Operation(summary = "Get folders shared with the current user")
    public ResponseEntity<ApiResponse<List<FolderShareDTO>>> getSharedWithMe(Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            
            List<FolderShareDTO> sharedFolders = folderShareService.getSharedFoldersForUser(userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("Shared folders retrieved successfully", sharedFolders));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/shared/by-me")
    @Operation(summary = "Get folders shared by the current user")
    public ResponseEntity<ApiResponse<List<FolderShareDTO>>> getSharedByMe(Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            
            List<FolderShareDTO> sharedFolders = folderShareService.getSharesCreatedByUser(userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("Shared folders retrieved successfully", sharedFolders));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/share-requests")
    @Operation(summary = "Get pending folder share requests")
    public ResponseEntity<ApiResponse<List<FolderShareDTO>>> getPendingShares(Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            
            List<FolderShareDTO> pendingShares = folderShareService.getPendingSharesForUser(userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("Pending shares retrieved successfully", pendingShares));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/shares/user")
    @Operation(summary = "Remove user from folder sharing")
    public ResponseEntity<ApiResponse<Void>> removeUserFromFolder(
            @PathVariable Long id,
            @RequestParam String userEmail,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            
            folderShareService.removeUserFromFolder(id, userDetails.getId(), userEmail);
            return ResponseEntity.ok(ApiResponse.success("User removed from folder sharing", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/share-notifications")
    @Operation(summary = "Get pending folder share requests formatted for notifications")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getShareNotifications(Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            
            List<FolderShareDTO> pendingShares = folderShareService.getPendingSharesForUser(userDetails.getId());
            
            // Format notifications for frontend
            List<Map<String, Object>> notifications = pendingShares.stream()
                .map(share -> {
                    Map<String, Object> notification = new HashMap<>();
                    notification.put("id", share.getId());
                    notification.put("owner", share.getOwnerEmail());
                    notification.put("folderName", share.getFolderName());
                    notification.put("type", "folder");
                    notification.put("message", share.getMessage());
                    notification.put("permissions", share.getPermissions());
                    notification.put("userId", userDetails.getId());
                    return notification;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success("Share notifications retrieved successfully", notifications));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
}
