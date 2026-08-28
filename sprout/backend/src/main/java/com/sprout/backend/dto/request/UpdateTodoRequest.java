package com.sprout.backend.dto.request;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

/**
 * All fields optional — only non-null values are applied, same convention used for habits.
 * One consequence: there's no way to *clear* a due date once set through this endpoint (null
 * means "leave unchanged", not "remove it") — same known limitation as Habit's reminderTime.
 * `tags`, however, can be cleared: send an empty array to wipe them, versus omitting the field
 * entirely to leave them untouched.
 */
public record UpdateTodoRequest(

        @Size(max = 200, message = "Title must be 200 characters or fewer")
        String title,

        String notes,

        LocalDate dueDate,

        String priority,

        List<String> tags,

        Boolean completed
) {}
