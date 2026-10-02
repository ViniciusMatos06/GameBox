package com.gamebox.backend.repository;

import com.gamebox.backend.domain.GameRating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GameRatingRepository extends JpaRepository<GameRating, UUID> {
    List<GameRating> findByListIdAndGameId(UUID listId, Long gameId);
    Optional<GameRating> findByListIdAndGameIdAndUserId(UUID listId, Long gameId, UUID userId);
    List<GameRating> findByUserId(UUID userId);
    long countByUserId(UUID userId);

    @org.springframework.data.jpa.repository.Query(
        "select avg(r.stars) from GameRating r where r.listId = :listId and r.gameId = :gameId"
    )
    Double averageStars(UUID listId, Long gameId);
}
