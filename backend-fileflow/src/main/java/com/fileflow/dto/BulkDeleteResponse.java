package com.fileflow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkDeleteResponse {
    
    private int deletedCount;
    private int totalRequested;
    private String message;
    
    public BulkDeleteResponse(int deletedCount, int totalRequested) {
        this.deletedCount = deletedCount;
        this.totalRequested = totalRequested;
        this.message = String.format("Successfully deleted %d out of %d folders", deletedCount, totalRequested);
    }
}
