package com.fileflow.controller;

import com.fileflow.utils.ApiResponse;
import com.fileflow.dto.FileDTO;
import com.fileflow.security.CustomUserDetails;
import com.fileflow.service.FileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favourites")
@RequiredArgsConstructor
@Tag(name = "Favourites", description = "File favourites management APIs")
public class FavouritesController {

    private final FileService fileService;

    @GetMapping
    @Operation(summary = "Get user's favourite files")
    public ResponseEntity<ApiResponse<List<FileDTO>>> getFavouriteFiles(Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            List<FileDTO> favourites = fileService.getFavoriteFiles(userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("Favourite files retrieved successfully", favourites));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}")
    @Operation(summary = "Toggle file favourite status")
    public ResponseEntity<ApiResponse<FileDTO>> toggleFavourite(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            FileDTO file = fileService.toggleFavorite(id, userDetails.getId());
            String message = file.getIsFavorite() ? "File added to favourites" : "File removed from favourites";
            return ResponseEntity.ok(ApiResponse.success(message, file));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }


}
