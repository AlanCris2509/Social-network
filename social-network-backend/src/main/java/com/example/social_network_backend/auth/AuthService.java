package com.example.social_network_backend.auth;

import com.example.social_network_backend.auth.dto.*;
import com.example.social_network_backend.shared.exception.AppException;
import com.example.social_network_backend.shared.exception.UnauthorizedException;
import com.example.social_network_backend.user.Role;
import com.example.social_network_backend.user.User;
import com.example.social_network_backend.user.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            JwtService jwtService,
            BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new UnauthorizedException("Invalid username or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new UnauthorizedException("Invalid username or password");
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        return new LoginResponse(accessToken, refreshToken, jwtService.getAccessTokenExpiryMs(), toUserInfo(user));
    }

    public LoginResponse register(RegisterRequest request) {
        if (userRepository.findByUsername(request.username()).isPresent()) {
            throw new AppException("Username already taken", HttpStatus.CONFLICT);
        }
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new AppException("Email already registered", HttpStatus.CONFLICT);
        }
        User user = new User(request.username(), passwordEncoder.encode(request.password()), request.email(), Role.USER);
        User saved = userRepository.save(user);
        String accessToken = jwtService.generateAccessToken(saved);
        String refreshToken = jwtService.generateRefreshToken(saved);
        return new LoginResponse(accessToken, refreshToken, jwtService.getAccessTokenExpiryMs(), toUserInfo(saved));
    }

    public RefreshResponse refresh(String rawToken) {
        Claims claims;
        try {
            claims = jwtService.validateRefreshToken(rawToken);
        } catch (JwtException e) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        Long userId = Long.parseLong(claims.getSubject());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        String newAccessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);
        return new RefreshResponse(newAccessToken, newRefreshToken, jwtService.getAccessTokenExpiryMs());
    }

    public void logout(String rawToken) {
        // Stateless — client discards the tokens; nothing to do server-side.
    }

    public UserInfo me(String accessToken) {
        Claims claims = jwtService.validateAndGetClaims(accessToken);
        Long userId = Long.parseLong(claims.getSubject());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        return toUserInfo(user);
    }

    private UserInfo toUserInfo(User user) {
        return new UserInfo(user.getId(), user.getUsername(), user.getEmail(), user.getRole().name());
    }
}
