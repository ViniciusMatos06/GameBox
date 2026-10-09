package com.gamebox.backend.repository;

import com.gamebox.backend.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByGameIdOrderByCreatedAtDesc(Long gameId);
    Optional<Review> findByGameIdAndUserId(Long gameId, UUID userId);
}
