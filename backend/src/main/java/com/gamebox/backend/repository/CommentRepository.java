package com.gamebox.backend.repository;

import com.gamebox.backend.domain.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, UUID> {
    List<Comment> findByReviewIdInOrderByCreatedAtAsc(List<UUID> reviewIds);
}
