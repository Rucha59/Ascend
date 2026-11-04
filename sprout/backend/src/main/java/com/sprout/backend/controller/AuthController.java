package com.sprout.backend.controller;

import com.sprout.backend.dto.request.LoginRequest;
import com.sprout.backend.dto.request.RegisterOAuthRequest;
import com.sprout.backend.dto.request.RegisterRequest;
import com.sprout.backend.dto.response.AuthResponse;
import com.sprout.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtDecoder supabaseJwtDecoder;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }


    @PostMapping({"/register-oauth", "/supabase"})
    public ResponseEntity<AuthResponse> registerOAuth(
            @RequestHeader(value = "Authorization", required = false)
            String authorization) {

        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Missing Supabase access token"
            );
        }

        Jwt jwt;

        try {
            jwt = supabaseJwtDecoder.decode(authorization.substring(7));
        } catch (JwtException ex) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid Supabase access token"
            );
        }

        String email = jwt.getClaimAsString("email");
        Map<String, Object> metadata = jwt.getClaimAsMap("user_metadata");

        if (email == null || email.isBlank() || !email.contains("@")) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Valid email is required"
            );
        }

        String fallbackUsername = email.substring(0, email.indexOf("@"));

        String name = metadata != null &&
                metadata.get("name") instanceof String value
                ? value
                : fallbackUsername;

        String username = metadata != null &&
                metadata.get("username") instanceof String value
                ? value
                : metadata != null &&
                metadata.get("user_name") instanceof String value
                  ? value
                  : fallbackUsername;

        RegisterOAuthRequest request =
                new RegisterOAuthRequest(email, name, username);

        return ResponseEntity.ok(authService.registerOAuth(request));
    }

}
