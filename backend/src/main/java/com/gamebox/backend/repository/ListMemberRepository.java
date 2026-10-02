package com.gamebox.backend.repository;

import com.gamebox.backend.domain.ListMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ListMemberRepository extends JpaRepository<ListMember, UUID> {
    List<ListMember> findByListId(UUID listId);
    List<ListMember> findByUserId(UUID userId);
    Optional<ListMember> findByListIdAndUserId(UUID listId, UUID userId);
    boolean existsByListIdAndUserId(UUID listId, UUID userId);
    long countByListId(UUID listId);
}
