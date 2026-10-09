package com.gamebox.backend.controller;

import com.gamebox.backend.dto.review.ReviewDtos.AddCommentRequest;
import com.gamebox.backend.dto.review.ReviewDtos.CommentResponse;
import com.gamebox.backend.dto.review.ReviewDtos.ReviewResponse;
import com.gamebox.backend.dto.review.ReviewDtos.UpsertReviewRequest;
import com.gamebox.backend.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/api/games/{gameId}/reviews")
    public ResponseEntity<List<ReviewResponse>> getReviews(
            Authentication authentication,
            @PathVariable Long gameId,
            @RequestParam(defaultValue = "all") String filter
    ) {
        String viewer = authentication != null && authentication.getPrincipal() instanceof UserDetails ud
                ? ud.getUsername() : null;
        return ResponseEntity.ok(reviewService.getReviewsForGame(gameId, viewer, filter));
    }

    @PostMapping("/api/games/{gameId}/reviews")
    public ResponseEntity<ReviewResponse> upsertReview(
            Authentication authentication, @PathVariable Long gameId, @Valid @RequestBody UpsertReviewRequest request
    ) {
        return ResponseEntity.ok(reviewService.upsertReview(gameId, authentication.getName(), request));
    }

    @PostMapping("/api/reviews/{reviewId}/comments")
    public ResponseEntity<CommentResponse> addComment(
            Authentication authentication, @PathVariable UUID reviewId, @Valid @RequestBody AddCommentRequest request
    ) {
        return ResponseEntity.ok(reviewService.addComment(reviewId, authentication.getName(), request));
    }
}
