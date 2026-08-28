package com.sprout.backend.controller;

import com.sprout.backend.dto.response.CalendarEventResponse;
import com.sprout.backend.dto.response.CalendarStatusResponse;
import com.sprout.backend.security.UserPrincipal;
import com.sprout.backend.service.GoogleCalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final GoogleCalendarService googleCalendarService;

    /** Frontend calls this (authenticated) to get the URL, then does a full browser redirect to it. */
    @GetMapping("/google/auth-url")
    public ResponseEntity<Map<String, String>> authUrl(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(Map.of("url", googleCalendarService.buildAuthUrl(principal)));
    }

    /** Google redirects the browser here directly — no JWT on this request, hence permitAll in SecurityConfig. */
    @GetMapping("/google/callback")
    public ResponseEntity<Void> callback(@RequestParam String code, @RequestParam String state) {
        String redirectTo = googleCalendarService.handleCallback(code, state);
        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(redirectTo)).build();
    }

    @GetMapping("/google/status")
    public ResponseEntity<CalendarStatusResponse> status(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(googleCalendarService.getStatus(principal));
    }

    @DeleteMapping("/google")
    public ResponseEntity<Void> disconnect(@AuthenticationPrincipal UserPrincipal principal) {
        googleCalendarService.disconnect(principal);
        return ResponseEntity.noContent().build();
    }

    /** Today's events unless a date is given — kept as its own list, never merged with habits. */
    @GetMapping("/events")
    public ResponseEntity<List<CalendarEventResponse>> events(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(googleCalendarService.getEventsForDate(principal, date != null ? date : LocalDate.now()));
    }
}
