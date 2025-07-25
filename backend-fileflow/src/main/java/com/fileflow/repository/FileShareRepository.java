package com.fileflow.repository;

import com.fileflow.entity.FileShare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FileShareRepository extends JpaRepository<FileShare, Long> {
    
    Optional<FileShare> findByShareToken(String shareToken);
    
    List<FileShare> findByFileIdAndUserId(Long fileId, Long userId);
    
    List<FileShare> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    @Query("SELECT fs FROM FileShare fs WHERE fs.file.id = :fileId AND fs.user.id = :userId AND fs.isActive = true")
    List<FileShare> findActiveSharesByFileAndUser(@Param("fileId") Long fileId, @Param("userId") Long userId);
    
    @Query("SELECT fs FROM FileShare fs WHERE fs.shareToken = :token AND fs.isActive = true AND (fs.expiresAt IS NULL OR fs.expiresAt > :now)")
    Optional<FileShare> findActiveShareByToken(@Param("token") String token, @Param("now") LocalDateTime now);
    
    @Query("UPDATE FileShare fs SET fs.accessCount = fs.accessCount + 1 WHERE fs.id = :shareId")
    void incrementAccessCount(@Param("shareId") Long shareId);
}
