package com.sprout.backend.controller;

import com.sprout.backend.dto.request.MarkHabitLogRequest;
import com.sprout.backend.dto.response.HabitLogResponse;
import com.sprout.backend.security.UserPrincipal;
import com.sprout.backend.service.HabitLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/habits/{habitId}/logs")
@RequiredArgsConstructor
public class HabitLogController {

    private final HabitLogService habitLogService;

    /** Upsert: marks (or re-marks) the habit's status + note for a date. Defaults to today. */
    @PutMapping
    public ResponseEntity<HabitLogResponse> mark(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long habitId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Valid @RequestBody MarkHabitLogRequest request) {
        return ResponseEntity.ok(habitLogService.markLog(principal, habitId, date, request));
    }

    @GetMapping
    public ResponseEntity<List<HabitLogResponse>> history(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long habitId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(habitLogService.getHistory(principal, habitId, from, to));
    }
}
