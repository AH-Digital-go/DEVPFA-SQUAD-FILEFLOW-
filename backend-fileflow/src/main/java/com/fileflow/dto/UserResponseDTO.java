package com.fileflow.dto;


import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserResponseDTO {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private long storageUsed;
    private long maxStorage;
    private Double storageUsedPercentage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
