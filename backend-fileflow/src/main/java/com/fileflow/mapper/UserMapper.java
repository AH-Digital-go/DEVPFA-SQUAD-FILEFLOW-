package com.fileflow.mapper;


import com.fileflow.dto.RegisterRequest;
import com.fileflow.dto.UserResponseDTO;
import com.fileflow.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    // Pour inscription
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true) // encodé manuellement
    User toEntity(RegisterRequest dto);

    // Pour exposer l'utilisateur dans une API
    @Mapping(target = "fullName", expression = "java(user.getFirstName() + \" \" + user.getLastName())")
    @Mapping(target = "storageUsedPercentage", expression = "java(calculateStoragePercentage(user.getStorageUsed(), user.getMaxStorage()))")
    UserResponseDTO toDto(User user);

    default Double calculateStoragePercentage(long used, long max) {
        if (max == 0) return 0d;
        return (double) used * 100 / max;
    }
}