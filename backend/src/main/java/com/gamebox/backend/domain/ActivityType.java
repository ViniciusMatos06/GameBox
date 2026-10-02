package com.gamebox.backend.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Serialized as lower_snake_case over the wire to match the front-end's
 * existing ActivityType union type.
 */
public enum ActivityType {
    @JsonProperty("added_game") ADDED_GAME,
    @JsonProperty("rated_game") RATED_GAME,
    @JsonProperty("joined_list") JOINED_LIST,
    @JsonProperty("created_list") CREATED_LIST
}
