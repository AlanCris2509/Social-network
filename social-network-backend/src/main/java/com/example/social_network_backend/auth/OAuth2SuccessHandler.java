package com.example.social_network_backend.auth;

import com.example.social_network_backend.user.Role;
import com.example.social_network_backend.user.User;
import com.example.social_network_backend.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @org.springframework.beans.factory.annotation.Value("${APP_FRONTEND_URL:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String googleId = oAuth2User.getAttribute("sub");
        String name = oAuth2User.getAttribute("name");

        User user = resolveUser(email, googleId, name);

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        long expiresIn = jwtService.getAccessTokenExpiryMs();

        String redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/callback")
                .queryParam("accessToken", accessToken)
                .queryParam("refreshToken", refreshToken)
                .queryParam("expiresIn", expiresIn)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }

    private User resolveUser(String email, String googleId, String name) {
        return userRepository.findByGoogleId(googleId)
                .orElseGet(() -> userRepository.findByEmail(email)
                        .map(existing -> {
                            existing.setGoogleId(googleId);
                            return userRepository.save(existing);
                        })
                        .orElseGet(() -> {
                            String base = name != null
                                    ? name.replaceAll("\\s+", "_").toLowerCase()
                                    : email.split("@")[0];
                            String username = uniqueUsername(base);
                            User newUser = new User(username, UUID.randomUUID().toString(), email, Role.USER);
                            newUser.setGoogleId(googleId);
                            return userRepository.save(newUser);
                        })
                );
    }

    private String uniqueUsername(String base) {
        String sanitized = base.replaceAll("[^a-zA-Z0-9_]", "_");
        String candidate = sanitized;
        int i = 1;
        while (userRepository.findByUsername(candidate).isPresent()) {
            candidate = sanitized + "_" + i++;
        }
        return candidate;
    }
}
