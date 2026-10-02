package com.gamebox.backend.dto.list;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AddGameRequest(
        @NotNull(message = "Informe o jogo.") Long gameId,
        @NotBlank(message = "Informe o nome do jogo.") String gameName
) {}
