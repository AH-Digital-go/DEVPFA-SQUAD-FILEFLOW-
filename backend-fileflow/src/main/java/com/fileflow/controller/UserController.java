package com.fileflow.controller;

import com.fileflow.dto.UserUpdateRequest;
import com.fileflow.security.CustomUserDetails;
import com.fileflow.service.ProfileService;
import com.fileflow.utils.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final ProfileService profileService;



    @GetMapping("/me")
    public ResponseEntity<?> getConnectedUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return profileService.getCurrentUser(userDetails);
    }

    @PatchMapping("/update")
    public ResponseEntity<?> updateProfil(@AuthenticationPrincipal CustomUserDetails userDetails, @Valid @RequestBody UserUpdateRequest updateRequest) {
        return profileService.updateProfile(userDetails, updateRequest);
    }

    @GetMapping("/storage")
    public ResponseEntity<?> getUserStorageInfo(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Map<String, Object> storageInfo = profileService.getUserStorageInfo(userDetails);
        return ResponseEntity.ok(new ApiResponse<>(true, "Storage information retrieved successfully", storageInfo));
    }

    @DeleteMapping("/me/delete")
    public ResponseEntity<?> deleteMyAccount(@AuthenticationPrincipal CustomUserDetails userDetails) {
        profileService.deleteCurrentUser(userDetails);
        return ResponseEntity.ok(new ApiResponse<>(true, "Account deleted successfully" , null));
    }

    @PostMapping("/me/user")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return  profileService.getCurrentUser(userDetails);
    }
}