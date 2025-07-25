package com.fileflow.service;

import com.fileflow.utils.ApiResponse;
import com.fileflow.dto.UserDTO;
import com.fileflow.dto.UserUpdateRequest;
import com.fileflow.entity.User;
import com.fileflow.exception.EmailAlreadyExistException;
import com.fileflow.exception.UserNotFoundException;
import com.fileflow.mapper.UserMapper;
import com.fileflow.repository.FileRepository;
import com.fileflow.repository.UserAuthRepository;
import com.fileflow.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final UserAuthRepository userRepository;
    private final FileRepository fileRepository;

    public UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setFullName(user.getFirstName() + " " + user.getLastName());
        dto.setStorageUsed(user.getStorageUsed());
        dto.setMaxStorage(user.getMaxStorage());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }

    public ResponseEntity<?> getCurrentUser(CustomUserDetails userDetails) {

        var user = userDetails.getUser();

        if (user == null) {
            throw new UserNotFoundException("Utilisateur introuvable");
        }

        var dto = userMapper.toDto(user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Utilisateur connecté", dto));
    }

    public ResponseEntity<?> updateProfile(CustomUserDetails userDetails, UserUpdateRequest request) {

        User user = userDetails.getUser();

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistException("Cet email est déjà utilisé");
        }

        // Mettre à jour les champs
        if (request.getFirstName() != null)
            user.setFirstName(request.getFirstName());

        if (request.getLastName() != null)
            user.setLastName(request.getLastName());

        if (request.getEmail() != null)
            user.setEmail(request.getEmail());

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            String hashedPassword = passwordEncoder.encode(request.getNewPassword());
            user.setPassword(hashedPassword);
        }

        userRepository.save(user);

        return ResponseEntity.ok(new ApiResponse<>(true, "Profil mis à jour avec succès", userMapper.toDto(user)));
    }

    public Map<String, Object> getUserStorageInfo(CustomUserDetails userDetails) {
        Long userId = userDetails.getUser().getId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long fileCount = fileRepository.countByUserId(userId);
        Long storageUsed = fileRepository.sumFileSizeByUserId(userId);
        if (storageUsed == null) storageUsed = 0L;

        user.setStorageUsed(storageUsed);
        userRepository.save(user);

        Map<String, Object> storageInfo = new HashMap<>();
        storageInfo.put("fileCount", fileCount);
        storageInfo.put("storageUsed", storageUsed);
        storageInfo.put("maxStorage", user.getMaxStorage());
        storageInfo.put("storageUsedPercentage",
                user.getMaxStorage() > 0 ? (storageUsed.doubleValue() / user.getMaxStorage()) * 100 : 0.0);
        storageInfo.put("availableStorage", user.getMaxStorage() - storageUsed);

        return storageInfo;
    }


}
