package com.fileflow.service;

import com.fileflow.utils.ApiResponse;
import com.fileflow.dto.LoginRequest;
import com.fileflow.dto.RegisterRequest;
import com.fileflow.dto.UserResponseDTO;
import com.fileflow.entity.RefreshToken;
import com.fileflow.entity.User;

import com.fileflow.exception.EmailAlreadyExistException;
import com.fileflow.exception.EmailNotVerifiedException;
import com.fileflow.exception.InvalidPasswordException;
import com.fileflow.exception.UserNotFoundException;
import com.fileflow.mapper.UserMapper;
import com.fileflow.repository.UserAuthRepository;
import com.fileflow.security.JwtUtil;
import com.fileflow.utils.CookieUtils;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {
    // Inject dependecies
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final UserAuthRepository userRepository;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final EmailVerificationService verificationService;
    // Constructor for injecting dependecies
    @Autowired
    public AuthService(UserMapper userMapper, PasswordEncoder passwordEncoder, UserAuthRepository userRepository, JwtUtil jwtUtil, RefreshTokenService refreshTokenService, EmailVerificationService verificationService) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.refreshTokenService = refreshTokenService;
        this.verificationService = verificationService;
    }

    // Method for register users
    public ResponseEntity<?> register(RegisterRequest registerRequest, HttpServletResponse response) {
        User user = userMapper.toEntity(registerRequest);

        if (!verificationService.isEmailVerified(user.getEmail())) {
            throw new EmailNotVerifiedException("Veuillez vérifier votre email avant de vous inscrire.");
        }



        // if email already exist don't register
        if(userRepository.existsByEmail(user.getEmail())) {
            throw new EmailAlreadyExistException("Email déjà utilisé !");
        }
        // Hashing Password with Bcrypt algorithme
        String hashedPassword = passwordEncoder.encode(registerRequest.getPassword());
        user.setPassword(hashedPassword);
        user.setMaxStorage(10L * 1024 * 1024 * 1024); // 10 Go par défaut
        user.setStorageUsed(0L);
        // saving data to database
        User savedUser = userRepository.save(user);

        // Générer tokens
        String token = jwtUtil.generateToken(user.getEmail());
        refreshTokenService.deleteByUser(savedUser);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(savedUser);
        CookieUtils.addRefreshTokenToCookie(response, refreshToken.getToken());
        UserResponseDTO userResponse = userMapper.toDto(savedUser);
        Map<String, Object> data = new HashMap<>();
        data.put("user", userResponse);
        data.put("accessToken", token);
        verificationService.clearVerification(user.getEmail());
        return ResponseEntity.ok(new ApiResponse<>(true, "Inscription réussie", data));
    }


    // Method to login
    public ResponseEntity<?> login(LoginRequest request, HttpServletResponse response) {
        System.out.println(request.getEmail());
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());

        if (optionalUser.isEmpty()) {
            throw new UserNotFoundException("Email non trouvé !");
        }

        User user = optionalUser.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidPasswordException("Mot de passe incorrect");
        }


        // Génère le token JWT
        String token = jwtUtil.generateToken(user.getEmail());
        // Supprimer le refresh token précédent s’il existe
        refreshTokenService.deleteByUser(user);
        // Création et sauvegarde du refresh token
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);
        CookieUtils.addRefreshTokenToCookie(response, refreshToken.getToken());
        // Creation de reponse:
        UserResponseDTO dto = userMapper.toDto(user);
        Map<String, Object> data = new HashMap<>();
        data.put("user", dto);
        data.put("accessToken", token);


        return ResponseEntity.ok(new ApiResponse<>(true, "Connexion réussie !", data));
    }


}
