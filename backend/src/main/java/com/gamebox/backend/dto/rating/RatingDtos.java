package com.gamebox.backend.dto.rating;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;

public class RatingDtos {

    public record RateGameRequest(
            @NotBlank(message = "Informe o nome do jogo.") String gameName,
            @NotNull @Min(1) @Max(5) Integer stars
    ) {}

    public record RatingItem(String username, Integer stars, Instant updatedAt) {}

    public record RatingsSummaryResponse(
            Double average,
            long count,
            List<RatingItem> ratings
    ) {}
}
