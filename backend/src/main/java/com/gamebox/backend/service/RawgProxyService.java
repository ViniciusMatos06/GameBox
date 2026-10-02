package com.gamebox.backend.service;

import com.gamebox.backend.exception.ApiExceptions.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * The only place in the backend that talks to the RAWG Video Games Database
 * API. The API key lives only here (server-side), never reaching the
 * front-end. Responses are forwarded through as-is (generic JSON maps) so we
 * don't have to duplicate RAWG's full response schema on the backend.
 */
@Service
public class RawgProxyService {

    private final RestClient restClient;
    private final String apiKey;

    public RawgProxyService(
            @Value("${gamebox.rawg.base-url}") String baseUrl,
            @Value("${gamebox.rawg.api-key}") String apiKey
    ) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
        this.apiKey = apiKey;
    }

    public boolean hasApiKey() {
        return apiKey != null && !apiKey.isBlank();
    }

    public Map<String, Object> games(Map<String, String> params) {
        return get("/games", params);
    }

    public Map<String, Object> gameDetails(String id) {
        return get("/games/" + id, Map.of());
    }

    public Map<String, Object> screenshots(String id) {
        return get("/games/" + id + "/screenshots", Map.of());
    }

    public Map<String, Object> genres() {
        return get("/genres", Map.of());
    }

    public Map<String, Object> platforms() {
        return get("/platforms", Map.of());
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> get(String path, Map<String, String> params) {
        if (!hasApiKey()) {
            throw new BadRequestException(
                    "RAWG_API_KEY não está configurada no backend. Adicione-a nas variáveis de ambiente do servidor."
            );
        }

        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromPath(path).queryParam("key", apiKey);
        params.forEach((k, v) -> {
            if (v != null && !v.isBlank()) uriBuilder.queryParam(k, v);
        });

        try {
            Map<String, Object> body = restClient.get()
                    .uri(uriBuilder.build().toUriString())
                    .retrieve()
                    .body(Map.class);
            return body == null ? new LinkedHashMap<>() : body;
        } catch (org.springframework.web.client.RestClientResponseException e) {
            HttpStatusCode status = e.getStatusCode();
            throw new BadRequestException("RAWG API respondeu com erro " + status.value() + " para " + path);
        }
    }
}
