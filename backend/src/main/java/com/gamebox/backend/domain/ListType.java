package com.gamebox.backend.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Serialized in lowercase over the wire ("personal" / "group") to match the
 * front-end's existing ListType union type.
 */
public enum ListType {
    @JsonProperty("personal") PERSONAL,
    @JsonProperty("group") GROUP
}
