package com.gamebox.backend.controller;

import com.gamebox.backend.dto.user.ActivityResponse;
import com.gamebox.backend.dto.user.FeedActivityResponse;
import com.gamebox.backend.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping("/{username}")
    public ResponseEntity<List<ActivityResponse>> forUser(@PathVariable String username) {
        return ResponseEntity.ok(activityService.getForUsername(username));
    }

    /** Activity from people the logged-in user follows — powers the Amigos page. */
    @GetMapping("/feed")
    public ResponseEntity<List<FeedActivityResponse>> feed(Authentication auth) {
        return ResponseEntity.ok(activityService.getFeedForUsername(auth.getName()));
    }
}
