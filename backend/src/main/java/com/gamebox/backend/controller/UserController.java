package com.gamebox.backend.controller;

import com.gamebox.backend.dto.user.ProfileResponse;
import com.gamebox.backend.dto.user.UpdateProfileRequest;
import com.gamebox.backend.dto.user.UserResponse;
import com.gamebox.backend.dto.user.UserSummary;
import com.gamebox.backend.service.AuthService;
import com.gamebox.backend.service.FollowService;
import com.gamebox.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final FollowService followService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Authentication authentication) {
        return ResponseEntity.ok(AuthService.toResponse(userService.getByUsernameOrThrow(authentication.getName())));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserResponse> updateMe(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(userService.updateProfile(authentication.getName(), request));
    }

    /** Public: returns matches by username or name. Requires a logged-in viewer so random bots can't scrape the user base. */
    @GetMapping("/search")
    public ResponseEntity<List<UserSummary>> search(Authentication authentication, @RequestParam("q") String query) {
        return ResponseEntity.ok(userService.search(query, authentication.getName()));
    }

    /** A few people to suggest following, for the Amigos page. */
    @GetMapping("/suggestions")
    public ResponseEntity<List<UserSummary>> suggestions(Authentication authentication) {
        return ResponseEntity.ok(userService.getSuggestions(authentication.getName(), 5));
    }

    @GetMapping("/{username}")
    public ResponseEntity<ProfileResponse> getPublicProfile(Authentication authentication, @PathVariable String username) {
        return ResponseEntity.ok(userService.getPublicProfile(username, currentUsernameOrNull(authentication)));
    }

    @PostMapping("/{username}/follow")
    public ResponseEntity<Void> follow(Authentication authentication, @PathVariable String username) {
        followService.follow(authentication.getName(), username);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{username}/follow")
    public ResponseEntity<Void> unfollow(Authentication authentication, @PathVariable String username) {
        followService.unfollow(authentication.getName(), username);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{username}/followers")
    public ResponseEntity<List<UserSummary>> followers(@PathVariable String username) {
        return ResponseEntity.ok(followService.getFollowers(username));
    }

    @GetMapping("/{username}/following")
    public ResponseEntity<List<UserSummary>> following(@PathVariable String username) {
        return ResponseEntity.ok(followService.getFollowing(username));
    }

    private String currentUsernameOrNull(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }
        return null;
    }
}
