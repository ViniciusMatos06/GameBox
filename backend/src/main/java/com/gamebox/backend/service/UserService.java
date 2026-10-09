package com.gamebox.backend.service;

import com.gamebox.backend.domain.GameRating;
import com.gamebox.backend.domain.User;
import com.gamebox.backend.dto.user.ProfileResponse;
import com.gamebox.backend.dto.user.UpdateProfileRequest;
import com.gamebox.backend.dto.user.UserResponse;
import com.gamebox.backend.dto.user.UserSummary;
import com.gamebox.backend.exception.ApiExceptions.NotFoundException;
import com.gamebox.backend.repository.FollowRepository;
import com.gamebox.backend.repository.GameListItemRepository;
import com.gamebox.backend.repository.GameListRepository;
import com.gamebox.backend.repository.GameRatingRepository;
import com.gamebox.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final GameListRepository gameListRepository;
    private final GameListItemRepository gameListItemRepository;
    private final GameRatingRepository gameRatingRepository;
    private final FollowRepository followRepository;

    public User getByUsernameOrThrow(String username) {
        return userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));
    }

    /**
     * @param viewerUsername the currently authenticated user's username, or null if the
     *                        request is anonymous — used only to compute isFollowing.
     */
    @Transactional(readOnly = true)
    public ProfileResponse getPublicProfile(String username, String viewerUsername) {
        User user = getByUsernameOrThrow(username);

        long listsCreated = gameListRepository.countByOwnerId(user.getId());
        long gamesAdded = gameListItemRepository.countByAddedByUserId(user.getId());
        List<GameRating> ratings = gameRatingRepository.findByUserId(user.getId());
        long gamesRated = ratings.size();
        double avgRating = ratings.isEmpty()
                ? 0.0
                : Math.round(ratings.stream().mapToInt(GameRating::getStars).average().orElse(0.0) * 10) / 10.0;

        long followersCount = followRepository.countByFollowingId(user.getId());
        long followingCount = followRepository.countByFollowerId(user.getId());

        boolean isFollowing = false;
        if (viewerUsername != null && !viewerUsername.equalsIgnoreCase(username)) {
            User viewer = userRepository.findByUsernameIgnoreCase(viewerUsername).orElse(null);
            if (viewer != null) {
                isFollowing = followRepository.existsByFollowerIdAndFollowingId(viewer.getId(), user.getId());
            }
        }

        return new ProfileResponse(
                user.getName(),
                user.getUsername(),
                user.getBio(),
                user.getAvatarUrl(),
                user.getCreatedAt(),
                new ProfileResponse.Stats(listsCreated, gamesRated, gamesAdded, avgRating),
                followersCount,
                followingCount,
                isFollowing
        );
    }

    @Transactional
    public UserResponse updateProfile(String username, UpdateProfileRequest request) {
        User user = getByUsernameOrThrow(username);

        if (request.name() != null && !request.name().isBlank()) user.setName(request.name());
        if (request.bio() != null) user.setBio(request.bio());
        if (request.avatarUrl() != null && !request.avatarUrl().isBlank()) user.setAvatarUrl(request.avatarUrl());
        if (request.email() != null && !request.email().isBlank()) user.setEmail(request.email());

        user = userRepository.save(user);
        return AuthService.toResponse(user);
    }

    /** A few users to suggest following — excludes the viewer and anyone already followed. */
    @Transactional(readOnly = true)
    public List<UserSummary> getSuggestions(String viewerUsername, int limit) {
        User viewer = getByUsernameOrThrow(viewerUsername);
        var alreadyFollowing = followRepository.findByFollowerIdOrderByCreatedAtDesc(viewer.getId()).stream()
                .map(f -> f.getFollowingId())
                .collect(java.util.stream.Collectors.toSet());
        var candidates = userRepository.findAll().stream()
                .filter(u -> !u.getId().equals(viewer.getId()))
                .filter(u -> !alreadyFollowing.contains(u.getId()))
                .collect(java.util.stream.Collectors.toList());
        java.util.Collections.shuffle(candidates);
        return candidates.stream().limit(limit).map(UserService::toSummary).toList();
    }

    @Transactional(readOnly = true)
    public List<UserSummary> search(String query, String excludeUsername) {
        if (query == null || query.isBlank()) return List.of();
        return userRepository
                .findByUsernameContainingIgnoreCaseOrNameContainingIgnoreCase(query, query, PageRequest.of(0, 20))
                .stream()
                .filter(u -> excludeUsername == null || !u.getUsername().equalsIgnoreCase(excludeUsername))
                .map(u -> new UserSummary(u.getUsername(), u.getName(), u.getAvatarUrl()))
                .toList();
    }

    public static UserSummary toSummary(User user) {
        return new UserSummary(user.getUsername(), user.getName(), user.getAvatarUrl());
    }
}
