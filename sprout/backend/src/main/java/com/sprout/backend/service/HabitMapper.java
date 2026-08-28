package com.sprout.backend.service;

import com.sprout.backend.dto.response.HabitLogResponse;
import com.sprout.backend.dto.response.HabitPhotoResponse;
import com.sprout.backend.dto.response.HabitResponse;
import com.sprout.backend.dto.response.HabitStatResponse;
import com.sprout.backend.entity.Habit;
import com.sprout.backend.entity.HabitEvidencePhoto;
import com.sprout.backend.entity.HabitEvidenceStat;
import com.sprout.backend.entity.HabitLog;

import java.util.List;

public final class HabitMapper {

    private HabitMapper() {}

    public static HabitResponse toResponse(Habit habit) {
        return new HabitResponse(
                habit.getId(),
                habit.getTitle(),
                habit.getIcon(),
                habit.getColor(),
                habit.getReminderTime(),
                habit.getActive(),
                habit.getCreatedAt()
        );
    }

    public static HabitLogResponse toResponse(HabitLog log) {
        return new HabitLogResponse(
                log.getId(),
                log.getHabit().getId(),
                log.getLogDate(),
                log.getStatus().name(),
                log.getNote(),
                log.getStats().stream().map(HabitMapper::toResponse).toList(),
                log.getPhotos().stream().map(HabitMapper::toResponse).toList(),
                log.getCompletedAt()
        );
    }

    public static HabitStatResponse toResponse(HabitEvidenceStat stat) {
        return new HabitStatResponse(stat.getId(), stat.getLabel(), stat.getValue(), stat.getUnit(), stat.getCreatedAt());
    }

    public static HabitPhotoResponse toResponse(HabitEvidencePhoto photo) {
        return new HabitPhotoResponse(
                photo.getId(), photo.getOriginalFileName(), photo.getContentType(), photo.getSizeBytes(),
                photo.getCreatedAt(), "/habits/evidence/images/" + photo.getId() + "/file"
        );
    }

    /** Overload used by DayService, which already has the stat/photo lists loaded for the day. */
    public static List<HabitStatResponse> statsOf(HabitLog log) {
        return log.getStats().stream().map(HabitMapper::toResponse).toList();
    }

    public static List<HabitPhotoResponse> photosOf(HabitLog log) {
        return log.getPhotos().stream().map(HabitMapper::toResponse).toList();
    }
}
