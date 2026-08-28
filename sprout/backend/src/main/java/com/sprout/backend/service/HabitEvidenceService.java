package com.sprout.backend.service;

import com.sprout.backend.dto.request.AddHabitStatRequest;
import com.sprout.backend.dto.response.HabitPhotoResponse;
import com.sprout.backend.dto.response.HabitStatResponse;
import com.sprout.backend.entity.HabitEvidencePhoto;
import com.sprout.backend.entity.HabitEvidenceStat;
import com.sprout.backend.entity.HabitLog;
import com.sprout.backend.exception.ApiException;
import com.sprout.backend.repository.HabitEvidencePhotoRepository;
import com.sprout.backend.repository.HabitEvidenceStatRepository;
import com.sprout.backend.repository.HabitLogRepository;
import com.sprout.backend.repository.HabitRepository;
import com.sprout.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

/**
 * Evidence attached to a habit's completion for a given day — numeric stats and photos, kept in
 * their own tables rather than crammed into HabitLog, so a future analytics pass can query them
 * directly (e.g. "average distance per run") without touching the log/status data at all.
 *
 * Evidence always attaches to an existing HabitLog: mark the habit first (COMPLETED, MISSED, or
 * SKIPPED), then optionally attach richer detail. This mirrors the dashboard's own UX, where the
 * note field only unlocks once a status has been picked.
 */
@Service
@RequiredArgsConstructor
public class HabitEvidenceService {

    private static final Set<String> ALLOWED_CONTENT_TYPES =
            Set.of("image/png", "image/jpeg", "image/webp", "image/gif");
    private static final long MAX_FILE_SIZE_BYTES = 8L * 1024 * 1024; // 8MB

    private final HabitRepository habitRepository;
    private final HabitLogRepository habitLogRepository;
    private final HabitEvidenceStatRepository statRepository;
    private final HabitEvidencePhotoRepository photoRepository;

    @Value("${sprout.uploads.dir:./uploads}")
    private String uploadsDir;

    public HabitStatResponse addStat(UserPrincipal principal, Long habitId, LocalDate date, AddHabitStatRequest req) {
        HabitLog log = getOwnedLog(principal.getId(), habitId, date);

        HabitEvidenceStat stat = HabitEvidenceStat.builder()
                .habitLog(log)
                .label(req.label().trim())
                .value(req.value())
                .unit(req.unit() != null && !req.unit().isBlank() ? req.unit().trim() : null)
                .build();

        return HabitMapper.toResponse(statRepository.save(stat));
    }

    public void deleteStat(UserPrincipal principal, Long habitId, LocalDate date, Long statId) {
        HabitLog log = getOwnedLog(principal.getId(), habitId, date);
        HabitEvidenceStat stat = statRepository.findByIdAndHabitLogId(statId, log.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Stat not found"));
        statRepository.delete(stat);
    }

    public HabitPhotoResponse addPhoto(UserPrincipal principal, Long habitId, LocalDate date, MultipartFile file) {
        HabitLog log = getOwnedLog(principal.getId(), habitId, date);
        validateFile(file);

        String storedName = UUID.randomUUID() + extensionFor(file.getContentType());
        try {
            Path dir = Paths.get(uploadsDir, "habit-evidence", String.valueOf(principal.getId()));
            Files.createDirectories(dir);
            Files.copy(file.getInputStream(), dir.resolve(storedName), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Couldn't save the image. Please try again.");
        }

        HabitEvidencePhoto photo = HabitEvidencePhoto.builder()
                .habitLog(log)
                .storedFileName(storedName)
                .originalFileName(file.getOriginalFilename())
                .contentType(file.getContentType())
                .sizeBytes(file.getSize())
                .build();

        return HabitMapper.toResponse(photoRepository.save(photo));
    }

    public void deletePhoto(UserPrincipal principal, Long habitId, LocalDate date, Long photoId) {
        HabitLog log = getOwnedLog(principal.getId(), habitId, date);
        HabitEvidencePhoto photo = photoRepository.findByIdAndHabitLogId(photoId, log.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Photo not found"));

        Path filePath = Paths.get(uploadsDir, "habit-evidence", String.valueOf(principal.getId()), photo.getStoredFileName());
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {
            // Best-effort — an orphaned file on disk isn't worth failing the request over.
        }

        photoRepository.delete(photo);
    }

    public record ImageFile(Resource resource, String contentType, String fileName) {}

    public ImageFile loadPhotoFile(UserPrincipal principal, Long photoId) {
        HabitEvidencePhoto photo = photoRepository.findByIdAndHabitLogUserId(photoId, principal.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Photo not found"));

        Path filePath = Paths.get(uploadsDir, "habit-evidence", String.valueOf(principal.getId()), photo.getStoredFileName());
        if (!Files.exists(filePath)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Photo not found");
        }

        return new ImageFile(new FileSystemResource(filePath), photo.getContentType(), photo.getOriginalFileName());
    }

    private HabitLog getOwnedLog(Long userId, Long habitId, LocalDate date) {
        habitRepository.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Habit not found"));

        LocalDate logDate = date != null ? date : LocalDate.now();
        return habitLogRepository.findByHabitIdAndLogDate(habitId, logDate)
                .filter(log -> log.getUser().getId().equals(userId))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                        "Mark this habit for that day before attaching evidence"));
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "No file was uploaded");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Images must be 8MB or smaller");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only PNG, JPEG, WEBP, or GIF images are allowed");
        }
    }

    private String extensionFor(String contentType) {
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/jpeg" -> ".jpg";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> "";
        };
    }
}
