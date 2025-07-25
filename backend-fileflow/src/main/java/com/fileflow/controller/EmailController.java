package com.fileflow.controller;


import com.fileflow.dto.SendCodeRequest;
import com.fileflow.dto.VerfiyCodeRequest;
import com.fileflow.service.EmailService;
import com.fileflow.service.EmailVerificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.mail.MessagingException;
import java.io.IOException;

@RestController
@RequestMapping("/api/auth")
public class EmailController {

    private final EmailService emailService;
    private final EmailVerificationService emailVerificationService;

    public EmailController(EmailService emailService, EmailVerificationService emailVerificationService) {
        this.emailService = emailService;
        this.emailVerificationService = emailVerificationService;
    }

    //Pour tester l'envois d'email
    @PostMapping("/oauth2/send-email")
    public ResponseEntity<?> sendEmail(String toEmail, String subject, String body) throws MessagingException, IOException {
        return emailService.sendEmail(toEmail, subject, body);
    }

    @PostMapping("/send-code")
    public ResponseEntity<?> sendCode(@Valid @RequestBody SendCodeRequest codeRequest) throws MessagingException, IOException {
        return emailVerificationService.sendVerificationCode(codeRequest);
    }

    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@Valid @RequestBody VerfiyCodeRequest codeRequest) {
        return emailVerificationService.verifyCode(codeRequest);
    }
}
