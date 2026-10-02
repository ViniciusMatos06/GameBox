package com.gamebox.backend.controller;

import com.gamebox.backend.dto.list.AddGameRequest;
import com.gamebox.backend.dto.list.CreateListRequest;
import com.gamebox.backend.dto.list.InvitePreviewResponse;
import com.gamebox.backend.dto.list.ListResponse;
import com.gamebox.backend.service.ListService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ListController {

    private final ListService listService;

    @PostMapping("/lists")
    public ResponseEntity<ListResponse> create(Authentication auth, @Valid @RequestBody CreateListRequest request) {
        return ResponseEntity.ok(listService.createList(auth.getName(), request));
    }

    @GetMapping("/lists")
    public ResponseEntity<List<ListResponse>> myLists(Authentication auth) {
        return ResponseEntity.ok(listService.getListsForUsername(auth.getName()));
    }

    /** Public: lists a given user owns or belongs to — powers their public profile page. */
    @GetMapping("/lists/by-user/{username}")
    public ResponseEntity<List<ListResponse>> listsByUsername(@PathVariable String username) {
        return ResponseEntity.ok(listService.getListsForUsername(username));
    }

    @GetMapping("/lists/{id}")
    public ResponseEntity<ListResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(listService.getById(id));
    }

    @PostMapping("/lists/{id}/games")
    public ResponseEntity<ListResponse> addGame(
            Authentication auth,
            @PathVariable UUID id,
            @Valid @RequestBody AddGameRequest request
    ) {
        return ResponseEntity.ok(listService.addGame(id, auth.getName(), request));
    }

    @DeleteMapping("/lists/{id}/games/{gameId}")
    public ResponseEntity<Void> removeGame(Authentication auth, @PathVariable UUID id, @PathVariable Long gameId) {
        listService.removeGame(id, auth.getName(), gameId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/lists/invite/{inviteCode}")
    public ResponseEntity<InvitePreviewResponse> invitePreview(@PathVariable String inviteCode) {
        return ResponseEntity.ok(listService.getInvitePreview(inviteCode));
    }

    @PostMapping("/lists/invite/{inviteCode}/join")
    public ResponseEntity<ListResponse> joinByInvite(Authentication auth, @PathVariable String inviteCode) {
        return ResponseEntity.ok(listService.joinByInviteCode(inviteCode, auth.getName()));
    }
}
