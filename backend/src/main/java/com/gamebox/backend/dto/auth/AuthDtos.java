package com.gamebox.backend.dto.auth;

import com.gamebox.backend.dto.user.UserResponse;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class AuthDtos {

    public record RegisterRequest(
            @NotBlank(message = "Informe seu nome.") String name,

            @NotBlank(message = "Informe um nome de usuário.")
            @Pattern(regexp = "^[a-zA-Z0-9_.]{3,20}$", message = "Use de 3 a 20 letras, números, \"_\" ou \".\".")
            String username,

            @NotBlank(message = "Informe um email.")
            @Email(message = "Informe um email válido.")
            String email,

            @NotBlank(message = "Informe uma senha.")
            @Size(min = 6, message = "A senha deve ter ao menos 6 caracteres.")
            String password
    ) {}

    public record LoginRequest(
            @NotBlank(message = "Informe email ou usuário.") String identifier,
            @NotBlank(message = "Informe a senha.") String password
    ) {}

    public record AuthResponse(String token, UserResponse user) {}
}
