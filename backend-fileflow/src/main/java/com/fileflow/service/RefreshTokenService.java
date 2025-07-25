package com.fileflow.service;

import com.fileflow.utils.ApiResponse;
import com.fileflow.dto.RefreshTokenResponse;
import com.fileflow.entity.RefreshToken;
import com.fileflow.entity.User;
import com.fileflow.exception.TokenRefreshException;
import com.fileflow.repository.RefreshTokenRepository;
import com.fileflow.repository.UserAuthRepository;
import com.fileflow.security.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {
    @Value("${jwt.refresh-token.expiration}")
    private Long refreshTokenDurationMs;

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserAuthRepository userRepository;
    private final JwtUtil jwtUtil;


    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, UserAuthRepository userRepository, JwtUtil jwtUtil) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    // Créer un nouveau refresh token
    public RefreshToken createRefreshToken(User user) {
        RefreshToken token = new RefreshToken(
                UUID.randomUUID().toString(),
                Instant.now().plusMillis(refreshTokenDurationMs),
                user
        );
        return refreshTokenRepository.save(token);
    }

    // Valider le refresh token
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new TokenRefreshException("Refresh token expiré. Veuillez vous reconnecter.");
        }
        return token;
    }

    // Trouver un token par sa valeur
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    // refrecher l'access Token
    public ResponseEntity<?> refreshAccessToken(HttpServletRequest request, HttpServletResponse response) {
        // Récupérer cookie "refreshToken"
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse<>(false, "Cookie refreshToken manquant", null));
        }

        String refreshToken = null;
        for (Cookie cookie : cookies) {
            if ("refreshToken".equals(cookie.getName())) {
                refreshToken = cookie.getValue();
                break;
            }
        }

        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse<>(false, "Refresh token non trouvé", null));
        }

        // Vérifier la validité du token dans la base et expiration
        RefreshToken token = this.findByToken(refreshToken)
                .map(this::verifyExpiration)
                .orElseThrow(() -> new TokenRefreshException("Token non trouvé dans la base"));

        User user = token.getUser();
        String accessToken = jwtUtil.generateToken(user.getEmail());

        // Préparer la réponse (pas besoin de renvoyer refresh token, il est déjà en cookie)
        RefreshTokenResponse data = new RefreshTokenResponse(refreshToken, accessToken);

        return ResponseEntity.ok(new ApiResponse<>(true, "Nouveau token généré", data));
    }

    // Logout from the account
    public ResponseEntity<?> logout(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new TokenRefreshException("Token invalide ou déjà supprimé"));

        refreshTokenRepository.delete(refreshToken);
        Map<String, Object> data = new HashMap<>();
        data.put("logoutAt", LocalDateTime.now());

        return ResponseEntity.ok(new ApiResponse(true, "Déconnexion réussie", data));
    }

    // Supprimer tous les tokens d’un utilisateur (dans logout global par exemple)
    @jakarta.transaction.Transactional
    public void deleteByUser(User user) {
        refreshTokenRepository.deleteByUser(user);
    }
}