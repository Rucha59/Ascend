package com.sprout.backend.controller;

import com.sprout.backend.dto.request.UpsertJournalRequest;
import com.sprout.backend.dto.response.JournalImageResponse;
import com.sprout.backend.dto.response.JournalResponse;
import com.sprout.backend.security.UserPrincipal;
import com.sprout.backend.service.JournalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/journal")
@RequiredArgsConstructor
public class JournalController {

    private final JournalService journalService;

    /**
     * Returns the dates within a year-month that have an entry — the calendar view calls this
     * when navigating months instead of fetching all entry content.
     * Example: GET /api/journal/month?year=2026&month=8
     */
    @GetMapping("/month")
    public ResponseEntity<List<LocalDate>> filledDatesInMonth(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(journalService.getFilledDatesInMonth(principal, year, month));
    }

    @GetMapping("/{date}")
    public ResponseEntity<JournalResponse> getForDate(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(journalService.getForDate(principal, date));
    }

    /** Full replace — send the whole entry every save, same as the frontend's "Save Entry" pattern. */
    @PutMapping("/{date}")
    public ResponseEntity<JournalResponse> upsert(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Valid @RequestBody UpsertJournalRequest request) {
        return ResponseEntity.ok(journalService.upsert(principal, date, request));
    }

    @PostMapping(value = "/{date}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<JournalImageResponse> uploadImage(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(journalService.uploadImage(principal, date, file));
    }

    @DeleteMapping("/{date}/images/{imageId}")
    public ResponseEntity<Void> deleteImage(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @PathVariable Long imageId) {
        journalService.deleteImage(principal, date, imageId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Streams the raw image bytes. Requires the same Bearer auth as everything else, which
     * means a plain <img src="..."> tag won't carry the token — the frontend fetches this via
     * axios and renders it as a blob URL instead. Keeps journal photos private per-user rather
     * than reachable at a guessable public URL.
     */
    @GetMapping("/images/{imageId}/file")
    public ResponseEntity<Resource> getImageFile(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long imageId) {
        JournalService.ImageFile file = journalService.loadImageFile(principal, imageId);
        String disposition = "inline; filename=\"" + (file.fileName() != null ? file.fileName() : "image") + "\"";
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                .body(file.resource());
    }
}
