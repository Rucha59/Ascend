package com.sprout.backend.service;

import com.sprout.backend.dto.request.LoginRequest;
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
                    new UsernamePasswordAuthenticationToken(req.email(), req.password())
            );
        } catch (BadCredentialsException e) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Incorrect email or password");
        }

        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Incorrect email or password"));

        String token = jwtService.generateToken(new UserPrincipal(user));
        return new AuthResponse(token, UserMapper.toResponse(user));
    }
}
