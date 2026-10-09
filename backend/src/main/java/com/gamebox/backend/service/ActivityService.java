package com.gamebox.backend.service;

import com.gamebox.backend.domain.Activity;
import com.gamebox.backend.domain.ActivityType;
import com.gamebox.backend.domain.Follow;
import com.gamebox.backend.domain.User;
import com.gamebox.backend.dto.user.ActivityResponse;
import com.gamebox.backend.dto.user.FeedActivityResponse;
import com.gamebox.backend.repository.ActivityRepository;
import com.gamebox.backend.repository.FollowRepository;
import com.gamebox.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private static final int FEED_LIMIT = 30;

    private final ActivityRepository activityRepository;
    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Transactional
    public void log(UUID userId, ActivityType type, UUID listId, String listName, Long gameId, String gameName, Integer stars) {
        activityRepository.save(Activity.builder()
                .userId(userId).type(type).listId(listId).listName(listName)
                .gameId(gameId).gameName(gameName).stars(stars).build());
    }

    @Transactional(readOnly = true)
    public List<ActivityResponse> getForUsername(String username) {
        User user = userService.getByUsernameOrThrow(username);
        return activityRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(a -> new ActivityResponse(a.getId(), a.getType(), a.getListId(), a.getListName(),
                        a.getGameId(), a.getGameName(), a.getStars(), a.getCreatedAt()))
                .toList();
    }

    /** Activity from people the given user follows — powers the Amigos feed. */
    @Transactional(readOnly = true)
    public List<FeedActivityResponse> getFeedForUsername(String username) {
        User user = userService.getByUsernameOrThrow(username);
        List<UUID> followingIds = followRepository.findByFollowerIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(Follow::getFollowingId).toList();
        if (followingIds.isEmpty()) return List.of();

        Map<UUID, User> usersById = userRepository.findAllById(followingIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        return activityRepository.findByUserIdInOrderByCreatedAtDesc(followingIds).stream()
                .limit(FEED_LIMIT)
                .map(a -> new FeedActivityResponse(a.getId(), UserService.toSummary(usersById.get(a.getUserId())),
                        a.getType(), a.getListId(), a.getListName(), a.getGameId(), a.getGameName(),
                        a.getStars(), a.getCreatedAt()))
                .toList();
    }
}
