package com.gamebox.backend.dto.list;

import java.util.UUID;

public record InvitePreviewResponse(
        UUID listId,
        String name,
        String description,
        String ownerUsername,
        long gameCount,
        long memberCount
) {}
