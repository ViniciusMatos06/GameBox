package com.gamebox.backend.controller;

import com.gamebox.backend.service.RawgProxyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/rawg")
@RequiredArgsConstructor
public class RawgController {

    private final RawgProxyService rawgProxyService;

    @GetMapping("/games")
    public ResponseEntity<Map<String, Object>> games(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "1") String page,
            @RequestParam(required = false, defaultValue = "20") String page_size,
            @RequestParam(required = false) String genres,
            @RequestParam(required = false) String platforms,
            @RequestParam(required = false) String ordering,
            @RequestParam(required = false) String dates,
            @RequestParam(required = false) String metacritic
    ) {
        Map<String, String> params = new LinkedHashMap<>();
        params.put("search", search);
        params.put("page", page);
        params.put("page_size", page_size);
        params.put("genres", genres);
        params.put("platforms", platforms);
        params.put("ordering", ordering);
        params.put("dates", dates);
        params.put("metacritic", metacritic);
        if (search != null && !search.isBlank()) params.put("search_precise", "true");

        return ResponseEntity.ok(rawgProxyService.games(params));
    }

    @GetMapping("/games/{id}")
    public ResponseEntity<Map<String, Object>> gameDetails(@PathVariable String id) {
        return ResponseEntity.ok(rawgProxyService.gameDetails(id));
    }

    @GetMapping("/games/{id}/screenshots")
    public ResponseEntity<Map<String, Object>> screenshots(@PathVariable String id) {
        return ResponseEntity.ok(rawgProxyService.screenshots(id));
    }

    @GetMapping("/genres")
    public ResponseEntity<Map<String, Object>> genres() {
        return ResponseEntity.ok(rawgProxyService.genres());
    }

    @GetMapping("/platforms")
    public ResponseEntity<Map<String, Object>> platforms() {
        return ResponseEntity.ok(rawgProxyService.platforms());
    }
}
