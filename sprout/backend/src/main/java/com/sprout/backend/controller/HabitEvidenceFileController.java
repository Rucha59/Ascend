package com.sprout.backend.controller;

import com.sprout.backend.security.UserPrincipal;
import com.sprout.backend.service.HabitEvidenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Separate from HabitEvidenceController because this route doesn't nest under a habit/date —
 * ownership is verified straight off the photo (habitLog.user), same pattern as journal images.
 */
@RestController
@RequestMapping("/api/habits/evidence/images")
@RequiredArgsConstructor
public class HabitEvidenceFileController {

    private final HabitEvidenceService habitEvidenceService;

    @GetMapping("/{photoId}/file")
    public ResponseEntity<Resource> getPhotoFile(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long photoId) {
        HabitEvidenceService.ImageFile file = habitEvidenceService.loadPhotoFile(principal, photoId);
        String disposition = "inline; filename=\"" + (file.fileName() != null ? file.fileName() : "image") + "\"";
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                .body(file.resource());
    }
}
