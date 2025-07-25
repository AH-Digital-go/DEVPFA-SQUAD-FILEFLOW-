package com.fileflow.controller;



import com.fileflow.dto.ForgetPasswordRequest;
import com.fileflow.dto.RegisterRequest;
import com.fileflow.dto.LoginRequest;
import com.fileflow.dto.ResetPasswordRequest;
import com.fileflow.service.AuthService;
import com.fileflow.service.FileService;
import com.fileflow.service.ForgotPasswordService;
import com.fileflow.service.RefreshTokenService;
import com.fileflow.utils.CookieUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.mail.MessagingException;
import java.io.IOException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final ForgotPasswordService forgotPasswordService;

    public AuthController(AuthService authService, RefreshTokenService refreshTokenService, ForgotPasswordService forgotPasswordService) {
        this.authService = authService;
        this.refreshTokenService = refreshTokenService;
        this.forgotPasswordService = forgotPasswordService;

    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest, HttpServletResponse response) {
        return authService.register(registerRequest, response);
    }

    @PostMapping("/login")
    public ResponseEntity<?>  login(@Valid @RequestBody LoginRequest loginRequest, HttpServletResponse response){
        return authService.login(loginRequest, response);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        return refreshTokenService.refreshAccessToken(request, response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        String token = CookieUtils.extractTokenFromCookie(request);
        return refreshTokenService.logout(token);
    }

    @PostMapping("/forget-password")
    public ResponseEntity<?> forgetPassword(@Valid @RequestBody ForgetPasswordRequest request) throws MessagingException, IOException {
        return forgotPasswordService.sendResetEmail(request);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam("token") String token, @Valid @RequestBody ResetPasswordRequest request) {
        return forgotPasswordService.resetPassword(request, token);
    }
}