package com.fileflow.controller;

import com.fileflow.dto.ApiResponse;
import com.fileflow.dto.FileShareDTO;
import com.fileflow.security.CustomUserDetails;
import com.fileflow.service.FileSharingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sharing")
@RequiredArgsConstructor
@Tag(name = "File Sharing", description = "File sharing management APIs")
public class FileSharingController {

    private final FileSharingService fileSharingService;

    @PostMapping("/{fileId}/share")
    @Operation(summary = "Share a file with expiration and access control")
    public ResponseEntity<ApiResponse<FileShareDTO>> shareFile(
            @PathVariable Long fileId,
            @RequestBody Map<String, Object> shareRequest,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            
            String shareType = (String) shareRequest.get("shareType"); // "public", "private"
            Integer expirationDays = (Integer) shareRequest.get("expirationDays");
            String password = (String) shareRequest.get("password");
            Boolean allowDownload = (Boolean) shareRequest.getOrDefault("allowDownload", true);
            
            FileShareDTO shareInfo = fileSharingService.createFileShare(
                fileId, userDetails.getId(), shareType, expirationDays, password, allowDownload
            );
            
            return ResponseEntity.ok(ApiResponse.success("File shared successfully", shareInfo));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{fileId}/shares")
    @Operation(summary = "Get all shares for a file")
    public ResponseEntity<ApiResponse<List<FileShareDTO>>> getFileShares(
            @PathVariable Long fileId,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            List<FileShareDTO> shares = fileSharingService.getFileShares(fileId, userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("File shares retrieved successfully", shares));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/shared/{shareToken}")
    @Operation(summary = "Access shared file by token")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSharedFile(
            @PathVariable String shareToken,
            @RequestParam(required = false) String password) {
        try {
            Map<String, Object> sharedFileInfo = fileSharingService.getSharedFile(shareToken, password);
            return ResponseEntity.ok(ApiResponse.success("Shared file accessed successfully", sharedFileInfo));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/shares/{shareId}")
    @Operation(summary = "Revoke a file share")
    public ResponseEntity<ApiResponse<Void>> revokeShare(
            @PathVariable Long shareId,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            fileSharingService.revokeShare(shareId, userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("Share revoked successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/my-shares")
    @Operation(summary = "Get all shares created by current user")
    public ResponseEntity<ApiResponse<List<FileShareDTO>>> getMyShares(Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            List<FileShareDTO> shares = fileSharingService.getUserShares(userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("User shares retrieved successfully", shares));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
}
