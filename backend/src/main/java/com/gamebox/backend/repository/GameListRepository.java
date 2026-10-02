package com.gamebox.backend.repository;

import com.gamebox.backend.domain.GameList;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface GameListRepository extends JpaRepository<GameList, UUID> {
    Optional<GameList> findByInviteCode(String inviteCode);
    boolean existsByInviteCode(String inviteCode);
    long countByOwnerId(UUID ownerId);
}
