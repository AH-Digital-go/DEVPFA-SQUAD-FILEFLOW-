package com.fileflow.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserUpdateRequest {
    private String firstName;
    private String lastName;
    @Email(message = "Format d'email invalide")
    @Pattern(
            regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
            message = "Adresse email non valide"
    )
    private String email;
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$",
            message = "Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial"
    )
    private String newPassword;
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$",
            message = "Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial"
    )
    private String confirmPassword;

    @AssertTrue(message = "Les mots de passe ne correspondent pas")
    public boolean isPasswordsMatching() {
        // Si aucun des deux n’est renseigné, on ne valide rien (ok).
        if ((newPassword == null || newPassword.isBlank()) &&
                (confirmPassword == null || confirmPassword.isBlank())) {
            return true;
        }

        // Si un seul est rempli, ou ils ne correspondent pas → erreur
        if (newPassword == null || confirmPassword == null) return false;

        return newPassword.equals(confirmPassword);
    }
}
