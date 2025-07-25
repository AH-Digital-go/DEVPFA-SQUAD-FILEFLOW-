package com.fileflow.repository;

import com.fileflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserAuthRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);

    @Query("SELECT COUNT(f) FROM FileMetadata f WHERE f.user.id = :userId")
    Long countFilesByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(f.fileSize), 0) FROM FileMetadata f WHERE f.user.id = :userId")
    Long getTotalStorageUsedByUserId(@Param("userId") Long userId);
}
