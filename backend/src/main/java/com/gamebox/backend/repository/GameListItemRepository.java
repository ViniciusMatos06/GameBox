package com.gamebox.backend.repository;

import com.gamebox.backend.domain.GameListItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GameListItemRepository extends JpaRepository<GameListItem, UUID> {
    List<GameListItem> findByListIdOrderByAddedAtAsc(UUID listId);
    Optional<GameListItem> findByListIdAndGameId(UUID listId, Long gameId);
    boolean existsByListIdAndGameId(UUID listId, Long gameId);
    void deleteByListIdAndGameId(UUID listId, Long gameId);
    long countByListId(UUID listId);
    long countByListIdAndAddedByUserId(UUID listId, UUID userId);
    long countByAddedByUserId(UUID userId);
}
