package com.sprout.backend.service;

import com.sprout.backend.entity.User;

public record GoogleOAuth2Result(User user, boolean created) {
}
