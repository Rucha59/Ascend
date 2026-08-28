package com.sprout.backend.service;

import com.sprout.backend.entity.User;
import com.sprout.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class GoogleOAuth2Service {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public GoogleOAuth2Result findOrCreateUser(String email, String name) {
        return userRepository.findByEmail(email)
                .map(user -> new GoogleOAuth2Result(user, false))
                .orElseGet(() -> new GoogleOAuth2Result(userRepository.save(createUser(email, name)), true));
    }

    private User createUser(String email, String name) {
        String displayName = (name == null || name.isBlank()) ? email.split("@")[0] : name.trim();
        String baseUsername = slugify(displayName);
        String username = uniqueUsername(baseUsername);

        return User.builder()
                .name(displayName)
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(randomPassword()))
                .timezone("UTC")
                .challengeStartDate(LocalDate.now())
                .currentStreak(0)
                .longestStreak(0)
                .build();
    }

    private String uniqueUsername(String baseUsername) {
        String candidate = baseUsername.isBlank() ? "user" : baseUsername;
        int suffix = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = baseUsername + suffix++;
        }
        return candidate;
    }

    private String slugify(String value) {
        String slug = value.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "").trim();
        return slug.isBlank() ? "user" : slug;
    }

    private String randomPassword() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
