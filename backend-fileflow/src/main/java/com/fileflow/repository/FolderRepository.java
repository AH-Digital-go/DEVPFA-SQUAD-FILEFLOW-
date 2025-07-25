package com.fileflow.repository;

import com.fileflow.entity.Folder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FolderRepository extends JpaRepository<Folder, Long> {
    
    List<Folder> findByUserIdAndParentIsNullOrderByNameAsc(Long userId);
    
    List<Folder> findByUserIdAndParentIdOrderByNameAsc(Long userId, Long parentId);
    
    List<Folder> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    Optional<Folder> findByIdAndUserId(Long id, Long userId);
    
    @Query("SELECT f FROM Folder f WHERE f.user.id = :userId AND f.name = :name AND f.parent.id = :parentId")
    Optional<Folder> findByUserIdAndNameAndParentId(@Param("userId") Long userId, 
                                                    @Param("name") String name, 
                                                    @Param("parentId") Long parentId);
    
    @Query("SELECT f FROM Folder f WHERE f.user.id = :userId AND f.name = :name AND f.parent IS NULL")
    Optional<Folder> findByUserIdAndNameAndParentIsNull(@Param("userId") Long userId, @Param("name") String name);
    
    @Query("SELECT f FROM Folder f WHERE f.user.id = :userId AND f.isFavorite = true ORDER BY f.name ASC")
    List<Folder> findFavoriteFoldersByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(f) FROM Folder f WHERE f.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);
    
    @Query("SELECT f FROM Folder f WHERE f.user.id = :userId AND LOWER(f.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Folder> searchFoldersByName(@Param("userId") Long userId, @Param("search") String search);
}
