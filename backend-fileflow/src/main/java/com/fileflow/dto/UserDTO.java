package com.fileflow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private Long storageUsed;
    private Long maxStorage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public Double getStorageUsedPercentage() {
        if (maxStorage == 0) return 0.0;
        return (storageUsed.doubleValue() / maxStorage.doubleValue()) * 100;
    }
}
