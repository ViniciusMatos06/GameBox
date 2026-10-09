package com.gamebox.backend.controller;

import com.gamebox.backend.dto.chat.ChatDtos.ConversationSummary;
import com.gamebox.backend.dto.chat.ChatDtos.MessageResponse;
import com.gamebox.backend.dto.chat.ChatDtos.SendMessageRequest;
import com.gamebox.backend.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ChatService chatService;

    @GetMapping
    public ResponseEntity<List<ConversationSummary>> list(Authentication auth) {
        return ResponseEntity.ok(chatService.listForUser(auth.getName()));
    }

    @PostMapping("/with/{username}")
    public ResponseEntity<ConversationSummary> getOrCreateWith(Authentication auth, @PathVariable String username) {
        return ResponseEntity.ok(chatService.getOrCreateWith(auth.getName(), username));
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<MessageResponse>> messages(Authentication auth, @PathVariable UUID id) {
        return ResponseEntity.ok(chatService.getMessages(id, auth.getName()));
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<MessageResponse> sendMessage(
            Authentication auth,
            @PathVariable UUID id,
            @Valid @RequestBody SendMessageRequest request
    ) {
        return ResponseEntity.ok(chatService.sendMessage(id, auth.getName(), request.content()));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markRead(Authentication auth, @PathVariable UUID id) {
        chatService.markRead(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
}
