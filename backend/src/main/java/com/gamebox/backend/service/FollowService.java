package com.gamebox.backend.service;

import com.gamebox.backend.domain.Follow;
import com.gamebox.backend.domain.User;
import com.gamebox.backend.dto.user.UserSummary;
import com.gamebox.backend.exception.ApiExceptions.BadRequestException;
import com.gamebox.backend.repository.FollowRepository;
import com.gamebox.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Transactional
    public void follow(String followerUsername, String targetUsername) {
        if (followerUsername.equalsIgnoreCase(targetUsername)) {
            throw new BadRequestException("Você não pode seguir a si mesmo.");
        }
        User follower = userService.getByUsernameOrThrow(followerUsername);
        User target = userService.getByUsernameOrThrow(targetUsername);

        if (!followRepository.existsByFollowerIdAndFollowingId(follower.getId(), target.getId())) {
            followRepository.save(Follow.builder()
                    .followerId(follower.getId())
                    .followingId(target.getId())
                    .build());
        }
    }

    @Transactional
    public void unfollow(String followerUsername, String targetUsername) {
        User follower = userService.getByUsernameOrThrow(followerUsername);
        User target = userService.getByUsernameOrThrow(targetUsername);
        followRepository.deleteByFollowerIdAndFollowingId(follower.getId(), target.getId());
    }

    @Transactional(readOnly = true)
    public List<UserSummary> getFollowers(String username) {
        User user = userService.getByUsernameOrThrow(username);
        List<Follow> follows = followRepository.findByFollowingIdOrderByCreatedAtDesc(user.getId());
        return toSummaries(follows.stream().map(Follow::getFollowerId).toList());
    }

    @Transactional(readOnly = true)
    public List<UserSummary> getFollowing(String username) {
        User user = userService.getByUsernameOrThrow(username);
        List<Follow> follows = followRepository.findByFollowerIdOrderByCreatedAtDesc(user.getId());
        return toSummaries(follows.stream().map(Follow::getFollowingId).toList());
    }

    private List<UserSummary> toSummaries(List<java.util.UUID> userIds) {
        return userRepository.findByIdIn(userIds).stream()
                .map(UserService::toSummary)
                .toList();
    }
}
