package com.fileflow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkOperationRequest {
    
    private List<Long> folderIds;
    private Long newParentId;
}
