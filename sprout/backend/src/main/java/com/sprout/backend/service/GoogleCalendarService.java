package com.sprout.backend.service;

import com.sprout.backend.dto.response.CalendarEventResponse;
import com.sprout.backend.dto.response.CalendarStatusResponse;
import com.sprout.backend.entity.GoogleCalendarConnection;
import com.sprout.backend.exception.ApiException;
import com.sprout.backend.repository.GoogleCalendarConnectionRepository;
import com.sprout.backend.security.OAuthStateStore;
import com.sprout.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Google Calendar, read-only. No client library — just the OAuth token endpoint and the
 * Calendar v3 REST API over plain HTTP, kept consistent with the rest of this backend.
 */
@Service
@RequiredArgsConstructor
public class GoogleCalendarService {

    private static final String AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
    private static final String TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
    private static final String EVENTS_ENDPOINT = "https://www.googleapis.com/calendar/v3/calendars/primary/events";
    private static final String SCOPE = "https://www.googleapis.com/auth/calendar.readonly";

    private final GoogleCalendarConnectionRepository connectionRepository;
    private final OAuthStateStore stateStore;
    private final RestClient restClient = RestClient.create();

    @Value("${sprout.google.client-id:}")
    private String clientId;

    @Value("${sprout.google.client-secret:}")
    private String clientSecret;

    @Value("${sprout.google.redirect-uri:http://localhost:8080/api/calendar/google/callback}")
    private String redirectUri;

    @Value("${sprout.cors.allowed-origin}")
    private String frontendOrigin;

    public String buildAuthUrl(UserPrincipal principal) {
        if (clientId.isBlank() || clientSecret.isBlank()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Google Calendar isn't configured on this server yet (missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET).");
        }
        String state = stateStore.create(principal.getId());
        return UriComponentsBuilder.fromHttpUrl(AUTH_ENDPOINT)
                .queryParam("client_id", clientId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("response_type", "code")
                .queryParam("scope", SCOPE)
                .queryParam("access_type", "offline")
                .queryParam("prompt", "consent")
                .queryParam("state", state)
                .build()
                .toUriString();
    }

    /** Returns the frontend URL to redirect the browser to once the exchange is done (success or not). */
    @SuppressWarnings("unchecked")
    public String handleCallback(String code, String state) {
        Long userId = stateStore.consume(state);
        if (userId == null) {
            return frontendOrigin + "/habits?calendar=error";
        }

        Map<String, Object> tokenResponse;
        try {
            tokenResponse = restClient.post()
                    .uri(TOKEN_ENDPOINT)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(formEncode(Map.of(
                            "code", code,
                            "client_id", clientId,
                            "client_secret", clientSecret,
                            "redirect_uri", redirectUri,
                            "grant_type", "authorization_code"
                    )))
                    .retrieve()
                    .body(Map.class);
        } catch (Exception e) {
            return frontendOrigin + "/habits?calendar=error";
        }

        if (tokenResponse == null || tokenResponse.get("access_token") == null) {
            return frontendOrigin + "/habits?calendar=error";
        }

        GoogleCalendarConnection connection = connectionRepository.findById(userId)
                .orElseGet(() -> GoogleCalendarConnection.builder().userId(userId).connectedAt(Instant.now()).build());

        connection.setAccessToken((String) tokenResponse.get("access_token"));
        // Google only sends a refresh_token on the very first consent — keep the old one otherwise.
        Object refreshToken = tokenResponse.get("refresh_token");
        if (refreshToken != null) connection.setRefreshToken((String) refreshToken);
        connection.setAccessTokenExpiresAt(Instant.now().plusSeconds(((Number) tokenResponse.get("expires_in")).longValue()));
        if (connection.getConnectedAt() == null) connection.setConnectedAt(Instant.now());

        if (connection.getRefreshToken() == null) {
            // First-ever attempt with no refresh_token (e.g. re-consent edge case) — nothing usable to store.
            return frontendOrigin + "/habits?calendar=error";
        }

        connectionRepository.save(connection);
        return frontendOrigin + "/habits?calendar=connected";
    }

    public CalendarStatusResponse getStatus(UserPrincipal principal) {
        return connectionRepository.findById(principal.getId())
                .map(c -> new CalendarStatusResponse(true, c.getConnectedAt()))
                .orElse(new CalendarStatusResponse(false, null));
    }

    public void disconnect(UserPrincipal principal) {
        connectionRepository.deleteById(principal.getId());
    }

    @SuppressWarnings("unchecked")
    public List<CalendarEventResponse> getEventsForDate(UserPrincipal principal, LocalDate date) {
        GoogleCalendarConnection connection = connectionRepository.findById(principal.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Google Calendar isn't connected yet"));

        String accessToken = ensureFreshAccessToken(connection);
        ZoneId zone = resolveZone(principal.getUser().getTimezone());
        ZonedDateTime startOfDay = date.atStartOfDay(zone);
        ZonedDateTime endOfDay = startOfDay.plusDays(1);

        String url = UriComponentsBuilder.fromHttpUrl(EVENTS_ENDPOINT)
                .queryParam("timeMin", startOfDay.toOffsetDateTime().toString())
                .queryParam("timeMax", endOfDay.toOffsetDateTime().toString())
                .queryParam("singleEvents", "true")
                .queryParam("orderBy", "startTime")
                .build()
                .toUriString();

        Map<String, Object> response;
        try {
            response = restClient.get()
                    .uri(url)
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .body(Map.class);
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Couldn't reach Google Calendar. Try again shortly.");
        }

        List<Map<String, Object>> items = response == null
                ? List.of()
                : (List<Map<String, Object>>) response.getOrDefault("items", List.of());

        // Google is asked to order these already; sorting again here is a belt-and-suspenders
        // guarantee of the "chronological order" requirement regardless of what the API returns.
        return items.stream()
                .sorted(Comparator.comparing(this::sortKey))
                .map(this::toEventResponse)
                .toList();
    }

    private String ensureFreshAccessToken(GoogleCalendarConnection connection) {
        if (connection.getAccessTokenExpiresAt().isAfter(Instant.now().plusSeconds(30))) {
            return connection.getAccessToken();
        }

        Map<String, Object> tokenResponse;
        try {
            tokenResponse = restClient.post()
                    .uri(TOKEN_ENDPOINT)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(formEncode(Map.of(
                            "refresh_token", connection.getRefreshToken(),
                            "client_id", clientId,
                            "client_secret", clientSecret,
                            "grant_type", "refresh_token"
                    )))
                    .retrieve()
                    .body(Map.class);
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY,
                    "Google Calendar access expired and couldn't be refreshed. Please reconnect it.");
        }

        if (tokenResponse == null || tokenResponse.get("access_token") == null) {
            throw new ApiException(HttpStatus.BAD_GATEWAY,
                    "Google Calendar access expired and couldn't be refreshed. Please reconnect it.");
        }

        String accessToken = (String) tokenResponse.get("access_token");
        connection.setAccessToken(accessToken);
        connection.setAccessTokenExpiresAt(Instant.now().plusSeconds(((Number) tokenResponse.get("expires_in")).longValue()));
        connectionRepository.save(connection);
        return accessToken;
    }

    @SuppressWarnings("unchecked")
    private Instant sortKey(Map<String, Object> item) {
        Map<String, Object> start = (Map<String, Object>) item.get("start");
        if (start.get("dateTime") != null) {
            return OffsetDateTime.parse((String) start.get("dateTime")).toInstant();
        }
        return LocalDate.parse((String) start.get("date")).atStartOfDay(ZoneOffset.UTC).toInstant();
    }

    @SuppressWarnings("unchecked")
    private CalendarEventResponse toEventResponse(Map<String, Object> item) {
        Map<String, Object> startObj = (Map<String, Object>) item.get("start");
        Map<String, Object> endObj = (Map<String, Object>) item.get("end");
        boolean allDay = startObj.get("dateTime") == null;

        return new CalendarEventResponse(
                (String) item.get("id"),
                (String) item.getOrDefault("summary", "(untitled event)"),
                allDay ? (String) startObj.get("date") : (String) startObj.get("dateTime"),
                allDay ? (String) endObj.get("date") : (String) endObj.get("dateTime"),
                allDay,
                (String) item.get("location")
        );
    }

    private ZoneId resolveZone(String timezone) {
        try {
            return timezone != null && !timezone.isBlank() ? ZoneId.of(timezone) : ZoneId.systemDefault();
        } catch (Exception e) {
            return ZoneId.systemDefault();
        }
    }

    private String formEncode(Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> e : new LinkedHashMap<>(params).entrySet()) {
            if (sb.length() > 0) sb.append('&');
            sb.append(URLEncoder.encode(e.getKey(), StandardCharsets.UTF_8))
                    .append('=')
                    .append(URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8));
        }
        return sb.toString();
    }
}
