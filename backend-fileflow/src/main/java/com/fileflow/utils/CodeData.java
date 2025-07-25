package com.fileflow.utils;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CodeData {
    String code;
    LocalDateTime expiresAt;

    public CodeData(String code) {
        this.code = code;
        this.expiresAt = LocalDateTime.now().plusMinutes(10);
    }
}
