package com.gamebox.backend.dto.user;

import jakarta.validation.constraints.Email;

public record UpdateProfileRequest(
        String name,
        String bio,
        String avatarUrl,
        @Email(message = "Informe um email válido.") String email
) {}
