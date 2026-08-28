package com.sprout.backend.service;

import com.sprout.backend.dto.request.UpsertJournalRequest;
import com.sprout.backend.dto.response.JournalImageResponse;
import com.sprout.backend.dto.response.JournalResponse;
import com.sprout.backend.entity.JournalEntry;
import com.sprout.backend.entity.JournalImage;
import com.sprout.backend.entity.JournalMood;
import com.sprout.backend.entity.User;
import com.sprout.backend.exception.ApiException;
import com.sprout.backend.repository.JournalEntryRepository;
import com.sprout.backend.repository.JournalImageRepository;
import com.sprout.backend.security.UserPrincipal;
import com.sprout.backend.util.ChallengeDayCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * One journal entry per user per calendar date. A GET for a date with nothing saved yet
 * returns a "virtual" entry (id: null, everything else empty) rather than a 404 — every day
 * conceptually has a journal entry, it just might not have been written yet.
 */
@Service
@RequiredArgsConstructor
public class JournalService {

    private static final Set<String> ALLOWED_CONTENT_TYPES =
            Set.of("image/png", "image/jpeg", "image/webp", "image/gif");
    private static final long MAX_FILE_SIZE_BYTES = 8L * 1024 * 1024; // 8MB

    private final JournalEntryRepository journalEntryRepository;
    private final JournalImageRepository journalImageRepository;

    @Value("${sprout.uploads.dir:./uploads}")
    private String uploadsDir;

    @Transactional(readOnly = true)
    public JournalResponse getForDate(UserPrincipal principal, LocalDate date) {
        JournalEntry entry = journalEntryRepository
                .findByUserIdAndEntryDate(principal.getId(), date)
                .orElse(null);
        return toResponse(principal.getUser(), date, entry);
    }

    @Transactional
    public JournalResponse upsert(UserPrincipal principal, LocalDate date, UpsertJournalRequest req) {
        JournalEntry entry = journalEntryRepository
                .findByUserIdAndEntryDate(principal.getId(), date)
                .orElseGet(() -> JournalEntry.builder()
                        .user(principal.getUser())
                        .entryDate(date)
                        .build());

        entry.setMood(parseMood(req.mood()));
        entry.setGratitude(req.gratitude());
        entry.setWentWell(req.wentWell());
        entry.setCouldImprove(req.couldImprove());
        entry.setContent(req.content());

        entry = journalEntryRepository.save(entry);
        return toResponse(principal.getUser(), date, entry);
    }

    @Transactional
    public JournalImageResponse uploadImage(UserPrincipal principal, LocalDate date, MultipartFile file) {
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

        JournalEntry entry = journalEntryRepository
                .findByUserIdAndEntryDate(principal.getId(), date)
                .orElseGet(() -> journalEntryRepository.save(JournalEntry.builder()
                        .user(principal.getUser())
                        .entryDate(date)
                        .build()));

        String storedName = UUID.randomUUID() + extensionFor(contentType);

        try {
            Path dir = Paths.get(uploadsDir, "journal", String.valueOf(principal.getId()));
            Files.createDirectories(dir);
            Files.copy(file.getInputStream(), dir.resolve(storedName), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Couldn't save the image. Please try again.");
        }

        JournalImage image = JournalImage.builder()
                .journalEntry(entry)
                .storedFileName(storedName)
                .originalFileName(file.getOriginalFilename())
                .contentType(contentType)
                .sizeBytes(file.getSize())
                .build();

        return toImageResponse(journalImageRepository.save(image));
    }

    @Transactional
    public void deleteImage(UserPrincipal principal, LocalDate date, Long imageId) {
        JournalImage image = journalImageRepository.findByIdAndJournalEntryUserId(imageId, principal.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Image not found"));

        if (!image.getJournalEntry().getEntryDate().equals(date)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Image not found");
        }

        Path filePath = Paths.get(uploadsDir, "journal", String.valueOf(principal.getId()), image.getStoredFileName());
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {
            // Best-effort — an orphaned file on disk isn't worth failing the request over.
        }

        journalImageRepository.delete(image);
    }

    /**
     * Returns only the dates within a given year-month that have an entry — used by the
     * calendar view to mark filled days without loading any entry content.
     */
    @Transactional(readOnly = true)
    public List<LocalDate> getFilledDatesInMonth(UserPrincipal principal, int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        return journalEntryRepository.findEntryDatesByUserIdBetween(
                principal.getId(), ym.atDay(1), ym.atEndOfMonth());
    }

    public record ImageFile(Resource resource, String contentType, String fileName) {}

    @Transactional(readOnly = true)
    public ImageFile loadImageFile(UserPrincipal principal, Long imageId) {
        JournalImage image = journalImageRepository.findByIdAndJournalEntryUserId(imageId, principal.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Image not found"));

        Path filePath = Paths.get(uploadsDir, "journal", String.valueOf(principal.getId()), image.getStoredFileName());
        if (!Files.exists(filePath)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Image not found");
        }

        return new ImageFile(new FileSystemResource(filePath), image.getContentType(), image.getOriginalFileName());
    }

    private JournalResponse toResponse(User user, LocalDate date, JournalEntry entry) {
        int dayNumber = ChallengeDayCalculator.dayNumberFor(user.getChallengeStartDate(), date);

        if (entry == null) {
            return new JournalResponse(null, date, dayNumber, null, null, null, null, null, List.of(), null, null);
        }

        List<JournalImageResponse> images = entry.getImages().stream().map(this::toImageResponse).toList();

        return new JournalResponse(
                entry.getId(), date, dayNumber,
                entry.getMood() != null ? entry.getMood().name() : null,
                entry.getGratitude(), entry.getWentWell(), entry.getCouldImprove(), entry.getContent(),
                images, entry.getCreatedAt(), entry.getUpdatedAt()
        );
    }

    private JournalImageResponse toImageResponse(JournalImage image) {
        return new JournalImageResponse(
                image.getId(), image.getOriginalFileName(), image.getContentType(),
                image.getSizeBytes(), image.getCreatedAt(), "/journal/images/" + image.getId() + "/file"
        );
    }

    private JournalMood parseMood(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return JournalMood.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Mood must be one of: " + Arrays.toString(JournalMood.values()));
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
