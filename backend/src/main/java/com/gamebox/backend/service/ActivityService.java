package com.gamebox.backend.service;

import com.gamebox.backend.domain.Activity;
import com.gamebox.backend.domain.ActivityType;
import com.gamebox.backend.domain.User;
import com.gamebox.backend.dto.user.ActivityResponse;
import com.gamebox.backend.repository.ActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final UserService userService;

    @Transactional
    public void log(UUID userId, ActivityType type, UUID listId, String listName, Long gameId, String gameName, Integer stars) {
        Activity activity = Activity.builder()
                .userId(userId)
                .type(type)
                .listId(listId)
                .listName(listName)
                .gameId(gameId)
                .gameName(gameName)
                .stars(stars)
                .build();
        activityRepository.save(activity);
    }

    @Transactional(readOnly = true)
    public List<ActivityResponse> getForUsername(String username) {
        User user = userService.getByUsernameOrThrow(username);
        return activityRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(a -> new ActivityResponse(
                        a.getId(), a.getType(), a.getListId(), a.getListName(),
                        a.getGameId(), a.getGameName(), a.getStars(), a.getCreatedAt()
                ))
                .toList();
    }
}
