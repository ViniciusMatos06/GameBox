package com.gamebox.backend.service;

import com.gamebox.backend.domain.GameRating;
import com.gamebox.backend.domain.User;
import com.gamebox.backend.dto.user.ProfileResponse;
import com.gamebox.backend.dto.user.UpdateProfileRequest;
import com.gamebox.backend.dto.user.UserResponse;
import com.gamebox.backend.exception.ApiExceptions.NotFoundException;
import com.gamebox.backend.repository.GameListItemRepository;
import com.gamebox.backend.repository.GameListRepository;
import com.gamebox.backend.repository.GameRatingRepository;
import com.gamebox.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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

    public User getByUsernameOrThrow(String username) {
        return userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));
    }

    @Transactional(readOnly = true)
    public ProfileResponse getPublicProfile(String username) {
        User user = getByUsernameOrThrow(username);

        long listsCreated = gameListRepository.countByOwnerId(user.getId());
        long gamesAdded = gameListItemRepository.countByAddedByUserId(user.getId());
        List<GameRating> ratings = gameRatingRepository.findByUserId(user.getId());
        long gamesRated = ratings.size();
        double avgRating = ratings.isEmpty()
                ? 0.0
                : Math.round(ratings.stream().mapToInt(GameRating::getStars).average().orElse(0.0) * 10) / 10.0;

        return new ProfileResponse(
                user.getName(),
                user.getUsername(),
                user.getBio(),
                user.getAvatarUrl(),
                user.getCreatedAt(),
                new ProfileResponse.Stats(listsCreated, gamesRated, gamesAdded, avgRating)
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
}
