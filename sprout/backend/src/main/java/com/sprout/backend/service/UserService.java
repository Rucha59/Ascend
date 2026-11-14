package com.sprout.backend.service;

import com.sprout.backend.dto.request.ResetChallengeRequest;
import com.sprout.backend.dto.request.UpdateProfileRequest;
import com.sprout.backend.dto.response.UserResponse;
import com.sprout.backend.entity.User;
import com.sprout.backend.exception.ApiException;
import com.sprout.backend.repository.UserRepository;
import com.sprout.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponse getCurrentUser(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElse(principal.getUser());
        return UserMapper.toResponse(user);
    }

    public UserResponse updateProfile(UserPrincipal principal, UpdateProfileRequest req) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        if (req.name() != null && !req.name().isBlank()) user.setName(req.name());
        if (req.bio() != null) user.setBio(req.bio());
        if (req.timezone() != null && !req.timezone().isBlank()) user.setTimezone(req.timezone());
        if (req.challengeDays() != null && req.challengeDays() > 0 && req.challengeDays() <= 365) {
            user.setChallengeDays(req.challengeDays());
        }
        if (req.challengeStartDate() != null) {
            user.setChallengeStartDate(req.challengeStartDate());
        }

        return UserMapper.toResponse(userRepository.save(user));
    }

    public UserResponse resetChallenge(UserPrincipal principal, ResetChallengeRequest req) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        user.setChallengeStartDate(LocalDate.now());

        if (req != null && req.challengeDays() != null && req.challengeDays() > 0 && req.challengeDays() <= 365) {
            user.setChallengeDays(req.challengeDays());
        }

        String mode = req != null && req.mode() != null ? req.mode() : "keep";
        if ("fresh".equalsIgnoreCase(mode)) {
            user.setCurrentStreak(0);
            user.setLongestStreak(0);
        }

        return UserMapper.toResponse(userRepository.save(user));
    }
}
