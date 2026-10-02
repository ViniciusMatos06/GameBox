package com.gamebox.backend.service;

import com.gamebox.backend.domain.*;
import com.gamebox.backend.dto.rating.RatingDtos.RateGameRequest;
import com.gamebox.backend.dto.rating.RatingDtos.RatingItem;
import com.gamebox.backend.dto.rating.RatingDtos.RatingsSummaryResponse;
import com.gamebox.backend.exception.ApiExceptions.ForbiddenException;
import com.gamebox.backend.exception.ApiExceptions.NotFoundException;
import com.gamebox.backend.repository.GameListRepository;
import com.gamebox.backend.repository.GameRatingRepository;
import com.gamebox.backend.repository.ListMemberRepository;
import com.gamebox.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final GameRatingRepository gameRatingRepository;
    private final GameListRepository gameListRepository;
    private final ListMemberRepository listMemberRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final ActivityService activityService;

    @Transactional
    public RatingsSummaryResponse rateGame(UUID listId, Long gameId, String username, RateGameRequest request) {
        GameList list = gameListRepository.findById(listId)
                .orElseThrow(() -> new NotFoundException("Lista não encontrada."));
        User user = userService.getByUsernameOrThrow(username);

        boolean canRate = list.getType() == ListType.PERSONAL
                ? list.getOwnerId().equals(user.getId())
                : listMemberRepository.existsByListIdAndUserId(listId, user.getId());
        if (!canRate) {
            throw new ForbiddenException("Você não tem permissão para avaliar jogos nesta lista.");
        }

        GameRating rating = gameRatingRepository.findByListIdAndGameIdAndUserId(listId, gameId, user.getId())
                .orElseGet(() -> GameRating.builder()
                        .listId(listId)
                        .gameId(gameId)
                        .userId(user.getId())
                        .build());
        rating.setStars(request.stars());
        gameRatingRepository.save(rating);

        activityService.log(user.getId(), ActivityType.RATED_GAME, listId, list.getName(),
                gameId, request.gameName(), request.stars());

        return getSummary(listId, gameId);
    }

    @Transactional(readOnly = true)
    public RatingsSummaryResponse getSummary(UUID listId, Long gameId) {
        List<GameRating> ratings = gameRatingRepository.findByListIdAndGameId(listId, gameId);

        List<RatingItem> items = ratings.stream()
                .map(r -> new RatingItem(
                        userRepository.findById(r.getUserId()).map(User::getUsername).orElse("desconhecido"),
                        r.getStars(),
                        r.getUpdatedAt()
                ))
                .toList();

        Double average = ratings.isEmpty()
                ? null
                : Math.round(ratings.stream().mapToInt(GameRating::getStars).average().orElse(0.0) * 10) / 10.0;

        return new RatingsSummaryResponse(average, ratings.size(), items);
    }
}
