package com.gamebox.backend.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * Stores only the RAWG game id inside a GameBox list. The actual game data
 * (cover, name, genres, etc.) always comes from the RAWG API and is never
 * duplicated here — see RawgProxyController / RawgClient.
 */
@Entity
@Table(name = "game_list_items", uniqueConstraints = {
        @UniqueConstraint(name = "uk_game_list_items_list_game", columnNames = {"list_id", "game_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameListItem {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "list_id", nullable = false)
    private UUID listId;

    @Column(name = "game_id", nullable = false)
    private Long gameId;

    @Column(name = "added_by_user_id", nullable = false)
    private UUID addedByUserId;

    @Column(nullable = false, updatable = false)
    private Instant addedAt;

    @PrePersist
    void onCreate() {
        if (addedAt == null) addedAt = Instant.now();
    }
}
