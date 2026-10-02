package com.gamebox.backend.dto.user;

import java.time.Instant;

/** Public-facing profile, safe to show to anyone (no email). */
public record ProfileResponse(
        String name,
        String username,
        String bio,
        String avatarUrl,
        Instant createdAt,
        Stats stats
) {
    public record Stats(
            long listsCreated,
            long gamesRated,
            long gamesAdded,
            double avgRating
    ) {}
}
