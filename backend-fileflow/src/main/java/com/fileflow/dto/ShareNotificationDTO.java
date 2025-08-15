package com.fileflow.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShareNotificationDTO {

    private Long Id;
    private String FileName;
    private Long userId;
    private String owner;
}
