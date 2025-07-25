package com.fileflow.repository;

import com.fileflow.entity.FileMetadata;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepository extends JpaRepository<FileMetadata, Long> {
    
    List<FileMetadata> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    Page<FileMetadata> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    List<FileMetadata> findByUserIdAndIsFavoriteTrueOrderByCreatedAtDesc(Long userId);
    
    Optional<FileMetadata> findByIdAndUserId(Long id, Long userId);
    
    Optional<FileMetadata> findByFileUuidAndUserId(String fileUuid, Long userId);
    
    boolean existsByFileNameAndUserId(String fileName, Long userId);
    
    @Query("SELECT f FROM FileMetadata f WHERE f.user.id = :userId AND " +
           "(LOWER(f.fileName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(f.originalFileName) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<FileMetadata> searchFilesByUserIdAndName(@Param("userId") Long userId, 
                                                  @Param("searchTerm") String searchTerm);
    
    @Query("SELECT COUNT(f) FROM FileMetadata f WHERE f.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COALESCE(SUM(f.fileSize), 0) FROM FileMetadata f WHERE f.user.id = :userId")
    Long sumFileSizeByUserId(@Param("userId") Long userId);
    // .... to a wil
    @Query("SELECT f FROM FileMetadata f WHERE f.user.id = :userId AND LOWER(f.originalFileName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<FileMetadata> findByUserIdAndOriginalFileNameContainingIgnoreCase(@Param("userId") Long userId, @Param("name") String name);
}
