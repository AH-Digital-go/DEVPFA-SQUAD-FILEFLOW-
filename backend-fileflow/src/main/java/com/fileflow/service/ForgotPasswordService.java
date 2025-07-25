package com.fileflow.service;


import com.fileflow.utils.ApiResponse;
import com.fileflow.dto.ForgetPasswordRequest;
import com.fileflow.dto.ResetPasswordRequest;
import com.fileflow.entity.PasswordResetToken;
import com.fileflow.entity.User;
import com.fileflow.exception.TokenExpiredException;
import com.fileflow.exception.TokenNotFoundException;
import com.fileflow.exception.UserNotFoundException;
import com.fileflow.repository.PasswordResetTokenRepository;
import com.fileflow.repository.UserAuthRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static com.fileflow.utils.EmailTemplate.loadEmailTemplate;

@Service
public class ForgotPasswordService {
    private final UserAuthRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public ForgotPasswordService(UserAuthRepository userRepository, PasswordResetTokenRepository tokenRepository, EmailService emailService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    public ResponseEntity<?> sendResetEmail(ForgetPasswordRequest emailRequest) throws MessagingException, IOException {
        // Preparation de donnees
        User user = userRepository.findByEmail(emailRequest.getEmail())
                .orElseThrow(() -> new UserNotFoundException("Email non trouvé !"));

        Optional<PasswordResetToken> existingToken = tokenRepository.findByUser(user);
        existingToken.ifPresent(tokenRepository::delete);

        String token = UUID.randomUUID().toString();
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(30);

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryDate(expiry);
        // enregistrer les donnees
        tokenRepository.save(resetToken);

        String resetUrl = "http://localhost:3000/reset-password?token=" + token;

        Map<String, String> vars = new HashMap<>();
        vars.put("[[USERNAME]]", user.getFirstName());
        vars.put("[[CODE]]", token);

        String body = loadEmailTemplate("reset-password-email.html", vars);

        emailService.sendEmail(user.getEmail(), "Réinitialisation de mot de passe", body);

        return ResponseEntity.ok(new ApiResponse<>(true, "Lien envoyé avec succès", resetUrl));
    }

    public ResponseEntity<?> resetPassword(ResetPasswordRequest request, String token) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new TokenNotFoundException("Token invalide ou expiré"));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new TokenExpiredException("Token expiré, veuillez refaire la demande.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        tokenRepository.delete(resetToken);

        return ResponseEntity.ok(new ApiResponse<>(true, "Mot de passe réinitialisé avec succès", null));
    }
}

