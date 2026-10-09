package com.gamebox.backend.repository;

import com.gamebox.backend.domain.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    List<Message> findByConversationIdOrderByCreatedAtAsc(UUID conversationId);

    long countByConversationIdAndSenderIdNotAndReadAtIsNull(UUID conversationId, UUID senderId);

    Message findTopByConversationIdOrderByCreatedAtDesc(UUID conversationId);

    @Modifying
    @Query("update Message m set m.readAt = :now where m.conversationId = :conversationId and m.senderId <> :readerId and m.readAt is null")
    int markRead(@Param("conversationId") UUID conversationId, @Param("readerId") UUID readerId, @Param("now") Instant now);
}
