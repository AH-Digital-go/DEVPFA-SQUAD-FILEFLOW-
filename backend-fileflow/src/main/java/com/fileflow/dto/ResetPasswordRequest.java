package com.fileflow.dto;


import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$",
            message = "Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial"
    )
    private String newPassword;
    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$",
            message = "Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial"
    )
    private String confirmPassword;

    @AssertTrue(message = "Les mots de passe ne correspondent pas")
    public boolean isPasswordsMatching() {
        System.out.println("mot de pass: "+newPassword);
        System.out.println("confirm mot de pass: "+confirmPassword);
        if (newPassword == null || confirmPassword == null) return false;
        return newPassword.equals(confirmPassword);
    }
}
