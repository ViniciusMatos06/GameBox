package com.gamebox.backend.dto.list;

import com.gamebox.backend.domain.ListType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateListRequest(
        @NotBlank(message = "Dê um nome para a sua lista.") String name,
        String description,
        @NotNull(message = "Escolha o tipo da lista.") ListType type
) {}
