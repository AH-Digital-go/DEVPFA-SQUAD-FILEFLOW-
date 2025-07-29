package com.fileflow.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;



@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
@Table(
        name = "file_share",
        uniqueConstraints = @UniqueConstraint(columnNames = {"file_id", "target_id"})
)
public class FileShare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private boolean response=false;

    @ManyToOne
    @JoinColumn(name = "target_id",nullable = false)
    private User targetUser;

    @ManyToOne
    @JoinColumn(name = "file_id",nullable = false)
    private File file;
}
