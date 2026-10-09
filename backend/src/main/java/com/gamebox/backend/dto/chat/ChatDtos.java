package com.gamebox.backend.dto.chat;

import com.gamebox.backend.dto.user.UserSummary;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public class ChatDtos {

    public record SendMessageRequest(
            @NotBlank(message = "A mensagem não pode estar vazia.")
            @Size(max = 2000, message = "Mensagem muito longa.")
            String content
    ) {}

    public record MessageResponse(
            UUID id,
            String senderUsername,
            String content,
            Instant createdAt,
            boolean read
    ) {}

    public record LastMessagePreview(
            String content,
            String senderUsername,
            Instant createdAt
    ) {}

    public record ConversationSummary(
            UUID id,
            UserSummary otherUser,
            LastMessagePreview lastMessage,
            long unreadCount
    ) {}
}
