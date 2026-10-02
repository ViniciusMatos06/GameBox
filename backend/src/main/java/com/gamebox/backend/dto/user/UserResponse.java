package com.gamebox.backend.dto.user;

import java.time.Instant;
import java.util.UUID;

/** Full user record, returned only to the user themself (login/register/me). */
public record UserResponse(
        UUID id,
        String name,
        String username,
        String email,
        String bio,
        String avatarUrl,
        Instant createdAt
) {}
