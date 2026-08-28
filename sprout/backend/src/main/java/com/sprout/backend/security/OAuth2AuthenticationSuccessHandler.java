package com.sprout.backend.security;

import com.sprout.backend.service.GoogleOAuth2Result;
import com.sprout.backend.service.GoogleOAuth2Service;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final GoogleOAuth2Service googleOAuth2Service;
    private final JwtService jwtService;

    @Value("${sprout.oauth2.frontend-redirect-uri}")
    private String frontendRedirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {
        Map<String, Object> attributes = extractAttributes(authentication);
        String email = asString(attributes.get("email"));
        String name = asString(attributes.get("name"));

        if (email == null || email.isBlank()) {
            response.sendRedirect(UriComponentsBuilder.fromUriString(frontendRedirectUri)
                    .queryParam("error", "google_email_missing")
                    .build()
                    .toUriString());
            return;
        }

        GoogleOAuth2Result result = googleOAuth2Service.findOrCreateUser(email, name);
        String token = jwtService.generateToken(new UserPrincipal(result.user()));

        String redirect = UriComponentsBuilder.fromUriString(frontendRedirectUri)
                .queryParam("token", token)
                .queryParam("created", result.created())
                .build()
                .toUriString();
        response.sendRedirect(redirect);
    }

    private Map<String, Object> extractAttributes(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof OidcUser oidcUser) {
            return oidcUser.getClaims();
        }
        if (principal instanceof OAuth2User oauth2User) {
            return oauth2User.getAttributes();
        }
        return Map.of();
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
