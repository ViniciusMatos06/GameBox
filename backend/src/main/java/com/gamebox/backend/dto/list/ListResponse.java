package com.gamebox.backend.dto.list;

import com.gamebox.backend.domain.ListType;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ListResponse(
        UUID id,
        String name,
        String description,
        ListType type,
        String ownerUsername,
        List<String> memberUsernames,
        List<GameItem> games,
        String inviteCode,
        Instant createdAt,
        Instant updatedAt
) {
    public record GameItem(Long gameId, String addedByUsername, Instant addedAt) {}
}
