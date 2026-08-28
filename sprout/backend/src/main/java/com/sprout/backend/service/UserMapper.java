package com.sprout.backend.service;

import com.sprout.backend.dto.response.UserResponse;
import com.sprout.backend.entity.User;

public final class UserMapper {

    private UserMapper() {}

    public static UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getEmail(),
                user.getBio(),
                user.getTimezone(),
                user.getChallengeStartDate(),
                user.getCurrentStreak(),
                user.getLongestStreak(),
                user.getCreatedAt()
        );
    }
}
