package com.gamebox.backend.service;

import com.gamebox.backend.domain.ActivityType;
import com.gamebox.backend.domain.Comment;
import com.gamebox.backend.domain.Follow;
import com.gamebox.backend.domain.Review;
import com.gamebox.backend.domain.User;
import com.gamebox.backend.dto.review.ReviewDtos.AddCommentRequest;
import com.gamebox.backend.dto.review.ReviewDtos.CommentResponse;
import com.gamebox.backend.dto.review.ReviewDtos.ReviewResponse;
import com.gamebox.backend.dto.review.ReviewDtos.UpsertReviewRequest;
import com.gamebox.backend.exception.ApiExceptions.NotFoundException;
import com.gamebox.backend.repository.CommentRepository;
import com.gamebox.backend.repository.FollowRepository;
import com.gamebox.backend.repository.ReviewRepository;
import com.gamebox.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final UserService userService;
    private final ActivityService activityService;

    @Transactional
    public ReviewResponse upsertReview(Long gameId, String username, UpsertReviewRequest request) {
        User user = userService.getByUsernameOrThrow(username);

        Review review = reviewRepository.findByGameIdAndUserId(gameId, user.getId())
                .orElseGet(() -> Review.builder().gameId(gameId).userId(user.getId()).build());
        review.setStars(request.stars());
        review.setText(request.text() == null ? "" : request.text().trim());
        review = reviewRepository.save(review);

        activityService.log(user.getId(), ActivityType.RATED_GAME, null, null, gameId, request.gameName(), request.stars());

        return new ReviewResponse(review.getId(), review.getGameId(), UserService.toSummary(user),
                review.getStars(), review.getText(), review.getCreatedAt(), review.getUpdatedAt(), List.of());
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsForGame(Long gameId, String viewerUsername, String filter) {
        List<Review> reviews = reviewRepository.findByGameIdOrderByCreatedAtDesc(gameId);

        if ("following".equalsIgnoreCase(filter)) {
            if (viewerUsername == null) return List.of();
            User viewer = userRepository.findByUsernameIgnoreCase(viewerUsername).orElse(null);
            if (viewer == null) return List.of();
            Set<UUID> followingIds = followRepository.findByFollowerIdOrderByCreatedAtDesc(viewer.getId()).stream()
                    .map(Follow::getFollowingId).collect(Collectors.toSet());
            reviews = reviews.stream().filter(r -> followingIds.contains(r.getUserId())).toList();
        }
        if (reviews.isEmpty()) return List.of();

        Map<UUID, User> authors = userRepository.findAllById(
                reviews.stream().map(Review::getUserId).distinct().toList()
        ).stream().collect(Collectors.toMap(User::getId, u -> u));

        Map<UUID, List<Comment>> commentsByReview = commentRepository
                .findByReviewIdInOrderByCreatedAtAsc(reviews.stream().map(Review::getId).toList())
                .stream().collect(Collectors.groupingBy(Comment::getReviewId));

        Map<UUID, User> commentAuthors = userRepository.findAllById(
                commentsByReview.values().stream().flatMap(List::stream).map(Comment::getUserId).distinct().toList()
        ).stream().collect(Collectors.toMap(User::getId, u -> u));

        return reviews.stream().map(r -> {
            List<CommentResponse> comments = commentsByReview.getOrDefault(r.getId(), List.of()).stream()
                    .map(c -> new CommentResponse(c.getId(), UserService.toSummary(commentAuthors.get(c.getUserId())),
                            c.getText(), c.getCreatedAt()))
                    .toList();
            return new ReviewResponse(r.getId(), r.getGameId(), UserService.toSummary(authors.get(r.getUserId())),
                    r.getStars(), r.getText(), r.getCreatedAt(), r.getUpdatedAt(), comments);
        }).toList();
    }

    @Transactional
    public CommentResponse addComment(UUID reviewId, String username, AddCommentRequest request) {
        reviewRepository.findById(reviewId).orElseThrow(() -> new NotFoundException("Avaliação não encontrada."));
        User user = userService.getByUsernameOrThrow(username);

        Comment comment = commentRepository.save(Comment.builder()
                .reviewId(reviewId).userId(user.getId()).text(request.text().trim()).build());
        return new CommentResponse(comment.getId(), UserService.toSummary(user), comment.getText(), comment.getCreatedAt());
    }
}
