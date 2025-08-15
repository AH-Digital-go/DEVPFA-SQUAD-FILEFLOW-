package com.fileflow.repository;


import com.fileflow.entity.File;
import com.fileflow.entity.FileShare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

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
    FileShare findByFileIdAndTargetUserId(Long fileId, Long targetUserId);

    boolean existsByFileIdAndTargetUserId(Long fileId, Long targetUserId);

    List<FileShare> findByTargetUserIdAndIsActiveTrue(Long userId);

    @Query("SELECT sh FROM FileShare sh WHERE sh.file.user.id = :userId AND sh.shareType = :shareType")
    List<FileShare> findByFileUserIdAndShareType(Long userId, String shareType);

    @Query("SELECT sh FROM FileShare sh WHERE sh.file.id = :fileId AND sh.targetUser.id = :targetUserId AND sh.file.user.id = :ownerId")
    FileShare findByFileIdAndTargetUserIdAndFileUserId(Long fileId, Long targetUserId, Long ownerId);
}
