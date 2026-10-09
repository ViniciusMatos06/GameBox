package com.gamebox.backend.dto.user;

import com.gamebox.backend.domain.ActivityType;

import java.time.Instant;
import java.util.UUID;

public record FeedActivityResponse(
        UUID id, UserSummary author, ActivityType type, UUID listId, String listName,
        Long gameId, String gameName, Integer stars, Instant createdAt
) {}
