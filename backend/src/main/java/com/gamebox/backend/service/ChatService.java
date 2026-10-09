package com.gamebox.backend.service;

import com.gamebox.backend.domain.Conversation;
import com.gamebox.backend.domain.Message;
import com.gamebox.backend.domain.User;
import com.gamebox.backend.dto.chat.ChatDtos.ConversationSummary;
import com.gamebox.backend.dto.chat.ChatDtos.LastMessagePreview;
import com.gamebox.backend.dto.chat.ChatDtos.MessageResponse;
import com.gamebox.backend.exception.ApiExceptions.BadRequestException;
import com.gamebox.backend.exception.ApiExceptions.ForbiddenException;
import com.gamebox.backend.exception.ApiExceptions.NotFoundException;
import com.gamebox.backend.repository.ConversationRepository;
import com.gamebox.backend.repository.MessageRepository;
import com.gamebox.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Transactional
    public ConversationSummary getOrCreateWith(String meUsername, String otherUsername) {
        if (meUsername.equalsIgnoreCase(otherUsername)) {
            throw new BadRequestException("Você não pode iniciar uma conversa consigo mesmo.");
        }
        User me = userService.getByUsernameOrThrow(meUsername);
        User other = userService.getByUsernameOrThrow(otherUsername);

        UUID a = me.getId().compareTo(other.getId()) < 0 ? me.getId() : other.getId();
        UUID b = me.getId().compareTo(other.getId()) < 0 ? other.getId() : me.getId();

        Conversation conversation = conversationRepository.findByUserAIdAndUserBId(a, b)
                .orElseGet(() -> conversationRepository.save(
                        Conversation.builder().userAId(a).userBId(b).build()
                ));

        return toSummary(conversation, me.getId());
    }

    @Transactional(readOnly = true)
    public List<ConversationSummary> listForUser(String username) {
        User me = userService.getByUsernameOrThrow(username);
        return conversationRepository.findForUser(me.getId()).stream()
                .map(c -> toSummary(c, me.getId()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getMessages(UUID conversationId, String username) {
        Conversation conversation = getConversationOrThrow(conversationId);
        User me = userService.getByUsernameOrThrow(username);
        requireParticipant(conversation, me.getId());

        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        Map<UUID, String> usernamesById = userRepository.findAllById(
                messages.stream().map(Message::getSenderId).distinct().toList()
        ).stream().collect(Collectors.toMap(User::getId, User::getUsername));

        return messages.stream()
                .map(m -> new MessageResponse(
                        m.getId(),
                        usernamesById.getOrDefault(m.getSenderId(), "desconhecido"),
                        m.getContent(),
                        m.getCreatedAt(),
                        m.getReadAt() != null
                ))
                .toList();
    }

    @Transactional
    public MessageResponse sendMessage(UUID conversationId, String username, String content) {
        Conversation conversation = getConversationOrThrow(conversationId);
        User me = userService.getByUsernameOrThrow(username);
        requireParticipant(conversation, me.getId());

        Message message = Message.builder()
                .conversationId(conversationId)
                .senderId(me.getId())
                .content(content.trim())
                .build();
        message = messageRepository.save(message);

        conversation.setLastMessageAt(message.getCreatedAt());
        conversationRepository.save(conversation);

        return new MessageResponse(message.getId(), me.getUsername(), message.getContent(), message.getCreatedAt(), false);
    }

    @Transactional
    public void markRead(UUID conversationId, String username) {
        Conversation conversation = getConversationOrThrow(conversationId);
        User me = userService.getByUsernameOrThrow(username);
        requireParticipant(conversation, me.getId());
        messageRepository.markRead(conversationId, me.getId(), Instant.now());
    }

    // --- helpers -----------------------------------------------------------

    private Conversation getConversationOrThrow(UUID id) {
        return conversationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Conversa não encontrada."));
    }

    private void requireParticipant(Conversation conversation, UUID userId) {
        if (!conversation.hasParticipant(userId)) {
            throw new ForbiddenException("Você não faz parte desta conversa.");
        }
    }

    private ConversationSummary toSummary(Conversation conversation, UUID meId) {
        UUID otherId = conversation.otherParticipant(meId);
        User other = userRepository.findById(otherId)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));

        Message last = messageRepository.findTopByConversationIdOrderByCreatedAtDesc(conversation.getId());
        LastMessagePreview preview = null;
        if (last != null) {
            // "me" is a sentinel the front-end recognizes to mean "the logged-in user sent this",
            // so the preview row can say "Você: ..." without needing to know its own username here.
            String senderUsername = last.getSenderId().equals(meId) ? "me" : other.getUsername();
            preview = new LastMessagePreview(last.getContent(), senderUsername, last.getCreatedAt());
        }

        long unread = messageRepository.countByConversationIdAndSenderIdNotAndReadAtIsNull(conversation.getId(), meId);

        return new ConversationSummary(
                conversation.getId(),
                UserService.toSummary(other),
                preview,
                unread
        );
    }
}
