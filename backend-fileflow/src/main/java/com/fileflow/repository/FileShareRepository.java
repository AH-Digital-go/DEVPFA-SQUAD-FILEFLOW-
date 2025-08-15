package com.fileflow.repository;


import com.fileflow.entity.File;
import com.fileflow.entity.FileShare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FileShareRepository extends JpaRepository<FileShare,Long> {

    @Query("Select sh.targetUser.email from FileShare sh where sh.file.id = :fileId")
    List<String> getSharedUsersEmailsByFileId(Long fileId);

    @Query("Select sh.file from FileShare sh where sh.targetUser.id = :targetId and sh.response = true")
    List<File> findByTargetId(Long targetId);

    @Query("select sh from FileShare sh where sh.targetUser.id = :TargetUserId and sh.response = false")
    List<FileShare> findFileSharesByTargetUserId(Long TargetUserId);

    @Query("Select distinct sh.file from FileShare sh where sh.file.user.id = :userId")
    List<File> findSharedFilesByMe(Long userId);

    @Query("Select sh from FileShare sh where sh.file.id = :fileId and sh.targetUser.id = :targetUserId")
    Optional<FileShare> findByFileIdAndTargetUserId(Long fileId, Long targetUserId);

    boolean existsByFileIdAndTargetUserId(Long fileId, Long targetUserId);

    List<FileShare> findByTargetUserIdAndIsActiveTrue(Long userId);

    @Query("SELECT sh FROM FileShare sh WHERE sh.file.user.id = :userId AND sh.shareType = :shareType")
    List<FileShare> findByFileUserIdAndShareType(Long userId, String shareType);

    @Query("SELECT sh FROM FileShare sh WHERE sh.file.id = :fileId AND sh.targetUser.id = :targetUserId AND sh.file.user.id = :ownerId")
    Optional<FileShare> findByFileIdAndTargetUserIdAndFileUserId(Long fileId, Long targetUserId, Long ownerId);

    // Additional methods for FileSharingService
    @Query("SELECT sh FROM FileShare sh WHERE sh.file.id = :fileId AND sh.file.user.id = :userId AND sh.isActive = true")
    List<FileShare> findActiveSharesByFileAndUser(@Param("fileId") Long fileId, @Param("userId") Long userId);

    @Query("SELECT sh FROM FileShare sh WHERE sh.shareToken = :shareToken AND sh.isActive = true AND (sh.expiresAt IS NULL OR sh.expiresAt > :currentTime)")
    Optional<FileShare> findActiveShareByToken(@Param("shareToken") String shareToken, @Param("currentTime") LocalDateTime currentTime);

    @Modifying
    @Query("UPDATE FileShare sh SET sh.accessCount = sh.accessCount + 1 WHERE sh.id = :shareId")
    void incrementAccessCount(@Param("shareId") Long shareId);

    @Query("SELECT sh FROM FileShare sh WHERE sh.file.user.id = :userId ORDER BY sh.createdAt DESC")
    List<FileShare> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);
}
