package com.fileflow.email.service;



import com.fileflow.auth.entity.User;
import com.fileflow.auth.exception.CodeInvalidException;
import com.fileflow.auth.exception.EmailAlreadyExistException;
import com.fileflow.auth.repository.UserAuthRepository;
import com.fileflow.auth.utils.ApiResponse;
import com.fileflow.email.dto.SendCodeRequest;
import com.fileflow.email.dto.VerfiyCodeRequest;
import com.fileflow.email.utils.CodeData;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import static com.fileflow.email.utils.EmailTemplate.loadEmailTemplate;


@Service
public class EmailVerificationService {

    private final UserAuthRepository userRepository;
    private final EmailService emailService;

    private final Map<String, CodeData> codeMap = new ConcurrentHashMap<>();


    public EmailVerificationService(UserAuthRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }


    public ResponseEntity<?> sendVerificationCode(SendCodeRequest codeRequest) throws MessagingException, IOException {
        String code = String.format("%06d", new Random().nextInt(999999));
        Optional<User> optionalUser = userRepository.findByEmail(codeRequest.getEmail());

        if (optionalUser.isPresent()) {
            throw new EmailAlreadyExistException("Cet email est déjà associé à un compte");
        }

        codeMap.put(codeRequest.getEmail(), new CodeData(code));

        Map<String, String> vars = new HashMap<>();
        vars.put("[[CODE]]", code);

        String body = loadEmailTemplate("verification-code-email.html", vars);


        // Envoi du mail avec le code via EmailService
        emailService.sendEmail(codeRequest.getEmail(), "Code de vérification", body);

        return ResponseEntity.ok(new ApiResponse<>(true, "Code de vérification envoyé avec succès", null));
    }

    public boolean isSameCode(String email, String code) {
        CodeData data = codeMap.get(email);
        if (data == null) return false;
        if (data.getExpiresAt().isBefore(LocalDateTime.now())) {
            codeMap.remove(email);
            return false;
        }
        if (!data.getCode().equals(code)) return false;
        codeMap.remove(email);
        return true;
    }
    //  to complete after rest
    public ResponseEntity<?> verifyCode(VerfiyCodeRequest codeRequest) {
        boolean valid = isSameCode(codeRequest.getEmail(), codeRequest.getCode());
        if (!valid) {
            throw new CodeInvalidException("Code invalide ou expiré");
        }
        return ResponseEntity.ok(new ApiResponse<>(true, "Code vérifié avec succès", null));
    }

    public boolean isEmailVerified(String email) {
        return !codeMap.containsKey(email);
    }

    public void clearVerification(String email) {
        codeMap.remove(email);
    }

    @Scheduled(fixedDelay = 720000) // toutes les 12 minutes
    public void cleanupExpiredCodes() {
        LocalDateTime now = LocalDateTime.now();
        codeMap.entrySet().removeIf(entry -> entry.getValue().getExpiresAt().isBefore(now));
    }


}
