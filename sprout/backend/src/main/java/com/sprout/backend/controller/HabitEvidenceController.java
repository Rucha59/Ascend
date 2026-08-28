package com.sprout.backend.controller;

import com.sprout.backend.dto.request.AddHabitStatRequest;
import com.sprout.backend.dto.response.HabitPhotoResponse;
import com.sprout.backend.dto.response.HabitStatResponse;
import com.sprout.backend.security.UserPrincipal;
import com.sprout.backend.service.HabitEvidenceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/habits/{habitId}/logs")
@RequiredArgsConstructor
public class HabitEvidenceController {

    private final HabitEvidenceService habitEvidenceService;

    @PostMapping("/stats")
    public ResponseEntity<HabitStatResponse> addStat(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long habitId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Valid @RequestBody AddHabitStatRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(habitEvidenceService.addStat(principal, habitId, date, request));
    }

    @DeleteMapping("/stats/{statId}")
    public ResponseEntity<Void> deleteStat(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long habitId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @PathVariable Long statId) {
        habitEvidenceService.deleteStat(principal, habitId, date, statId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<HabitPhotoResponse> addPhoto(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long habitId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(habitEvidenceService.addPhoto(principal, habitId, date, file));
    }

    @DeleteMapping("/images/{photoId}")
    public ResponseEntity<Void> deletePhoto(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long habitId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @PathVariable Long photoId) {
        habitEvidenceService.deletePhoto(principal, habitId, date, photoId);
        return ResponseEntity.noContent().build();
    }
}
