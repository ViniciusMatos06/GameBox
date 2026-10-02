package com.gamebox.backend.controller;

import com.gamebox.backend.dto.rating.RatingDtos.RateGameRequest;
import com.gamebox.backend.dto.rating.RatingDtos.RatingsSummaryResponse;
import com.gamebox.backend.service.RatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/lists/{listId}/games/{gameId}/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @GetMapping
    public ResponseEntity<RatingsSummaryResponse> summary(@PathVariable UUID listId, @PathVariable Long gameId) {
        return ResponseEntity.ok(ratingService.getSummary(listId, gameId));
    }

    @PostMapping
    public ResponseEntity<RatingsSummaryResponse> rate(
            Authentication auth,
            @PathVariable UUID listId,
            @PathVariable Long gameId,
            @Valid @RequestBody RateGameRequest request
    ) {
        return ResponseEntity.ok(ratingService.rateGame(listId, gameId, auth.getName(), request));
    }
}
