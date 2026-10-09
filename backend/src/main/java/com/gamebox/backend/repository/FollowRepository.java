package com.gamebox.backend.repository;

import com.gamebox.backend.domain.Follow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FollowRepository extends JpaRepository<Follow, UUID> {
    boolean existsByFollowerIdAndFollowingId(UUID followerId, UUID followingId);
    Optional<Follow> findByFollowerIdAndFollowingId(UUID followerId, UUID followingId);
    void deleteByFollowerIdAndFollowingId(UUID followerId, UUID followingId);

    long countByFollowingId(UUID followingId); // followers count
    long countByFollowerId(UUID followerId);   // following count

    List<Follow> findByFollowingIdOrderByCreatedAtDesc(UUID followingId); // who follows this user
    List<Follow> findByFollowerIdOrderByCreatedAtDesc(UUID followerId);   // who this user follows
}
