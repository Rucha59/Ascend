package com.sprout.backend.service;

import com.sprout.backend.dto.request.LoginRequest;
import com.sprout.backend.dto.request.RegisterOAuthRequest;
import com.sprout.backend.dto.request.RegisterRequest;
import com.sprout.backend.dto.response.AuthResponse;
import com.sprout.backend.entity.User;
import com.sprout.backend.exception.ApiException;
import com.sprout.backend.repository.UserRepository;
import com.sprout.backend.security.JwtService;
import com.sprout.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists");
        }
        if (userRepository.existsByUsername(req.username())) {
            throw new ApiException(HttpStatus.CONFLICT, "That username is already taken");
        }

        User user = User.builder()
                .name(req.name())
                .username(req.username())
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .timezone("UTC")
                .challengeStartDate(LocalDate.now())
                .currentStreak(0)
                .longestStreak(0)
                .build();

        user = userRepository.save(user);

        String token = jwtService.generateToken(new UserPrincipal(user));
        return new AuthResponse(token, UserMapper.toResponse(user));
    }

    public AuthResponse login(LoginRequest req) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.username(), req.password())
            );
        } catch (BadCredentialsException e) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Incorrect username or password");
        }

        User user = userRepository.findByUsername(req.username())
                .orElseThrow(() ->
                        new ApiException(HttpStatus.UNAUTHORIZED, "Incorrect username or password"));

        String token = jwtService.generateToken(new UserPrincipal(user));
        return new AuthResponse(token, UserMapper.toResponse(user));
    }

    public AuthResponse registerOAuth(RegisterOAuthRequest req) {
        // If user already exists (e.g. second sign-in), just return their profile
        return userRepository.findByEmail(req.email())
                .map(existing -> new AuthResponse(null, UserMapper.toResponse(existing)))
                .orElseGet(() -> {
                    User user = User.builder()
                            .name(req.name())
                            .username(sanitizeUsername(req.username()))
                            .email(req.email())
                            .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                            .timezone("UTC")
                            .challengeStartDate(LocalDate.now())
                            .currentStreak(0)
                            .longestStreak(0)
                            .build();
                    user = userRepository.save(user);
                    return new AuthResponse(null, UserMapper.toResponse(user));
                });
    }

    private String sanitizeUsername(String username) {
        // Ensure uniqueness if collision
        String base = username;
        int attempts = 0;
        while (userRepository.existsByUsername(base) && attempts++ < 5) {
            base = username + "_" + (int)(Math.random() * 9000 + 1000);
        }
        return base;
    }
}
