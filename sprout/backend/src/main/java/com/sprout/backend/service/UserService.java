package com.sprout.backend.service;

import com.sprout.backend.dto.request.UpdateProfileRequest;
import com.sprout.backend.dto.response.UserResponse;
import com.sprout.backend.entity.User;
import com.sprout.backend.exception.ApiException;
import com.sprout.backend.repository.UserRepository;
import com.sprout.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponse getCurrentUser(UserPrincipal principal) {
        return UserMapper.toResponse(principal.getUser());
    }

    public UserResponse updateProfile(UserPrincipal principal, UpdateProfileRequest req) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        if (req.name() != null && !req.name().isBlank()) user.setName(req.name());
        if (req.bio() != null) user.setBio(req.bio());
        if (req.timezone() != null && !req.timezone().isBlank()) user.setTimezone(req.timezone());

        return UserMapper.toResponse(userRepository.save(user));
    }
}
