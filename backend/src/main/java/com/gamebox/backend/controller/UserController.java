package com.gamebox.backend.controller;

import com.gamebox.backend.dto.user.ProfileResponse;
import com.gamebox.backend.dto.user.UpdateProfileRequest;
import com.gamebox.backend.dto.user.UserResponse;
import com.gamebox.backend.service.AuthService;
import com.gamebox.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

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

    @GetMapping("/{username}")
    public ResponseEntity<ProfileResponse> getPublicProfile(@PathVariable String username) {
        return ResponseEntity.ok(userService.getPublicProfile(username));
    }
}
