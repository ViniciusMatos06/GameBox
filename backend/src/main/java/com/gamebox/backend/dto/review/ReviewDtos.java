package com.gamebox.backend.dto.review;

import com.gamebox.backend.dto.user.UserSummary;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class ReviewDtos {

    public record UpsertReviewRequest(
            @NotBlank(message = "Informe o nome do jogo.") String gameName,
            @NotNull @Min(1) @Max(5) Integer stars,
            @Size(max = 2000, message = "Texto muito longo.") String text
    ) {}

    public record AddCommentRequest(
            @NotBlank(message = "O comentário não pode estar vazio.")
            @Size(max = 1000, message = "Comentário muito longo.")
            String text
    ) {}

    public record CommentResponse(UUID id, UserSummary author, String text, Instant createdAt) {}

    public record ReviewResponse(
            UUID id, Long gameId, UserSummary author, Integer stars, String text,
            Instant createdAt, Instant updatedAt, List<CommentResponse> comments
    ) {}
}
