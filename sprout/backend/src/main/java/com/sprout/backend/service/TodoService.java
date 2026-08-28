package com.sprout.backend.service;

import com.sprout.backend.dto.request.CreateTodoRequest;
import com.sprout.backend.dto.request.UpdateTodoRequest;
import com.sprout.backend.dto.response.TodayTodoItemResponse;
import com.sprout.backend.dto.response.TodoResponse;
import com.sprout.backend.entity.Todo;
import com.sprout.backend.entity.TodoPriority;
import com.sprout.backend.exception.ApiException;
import com.sprout.backend.repository.TodoRepository;
import com.sprout.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * One-time tasks, distinct from Habit's daily recurrence. getTodayView() is the one place this
 * merges with Calendar — it reuses GoogleCalendarService rather than re-implementing any of the
 * OAuth/event-fetching logic, so there's exactly one code path that talks to Google.
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class TodoService {

    private final TodoRepository todoRepository;
    private final GoogleCalendarService googleCalendarService;

    public TodoResponse create(UserPrincipal principal, CreateTodoRequest req) {
        log.info("Todo create requested: userId={}, title='{}', dueDate={}, priority={}, tagsCount={}",
                principal.getId(), req.title(), req.dueDate(), req.priority(), req.tags() == null ? null : req.tags().size());
        Todo todo = Todo.builder()
                .user(principal.getUser())
                .title(req.title().trim())
                .notes(req.notes())
                .dueDate(req.dueDate())
                .priority(parsePriority(req.priority()))
                .tags(cleanTags(req.tags()))
                .completed(false)
                .build();
        Todo saved = todoRepository.save(todo);
        log.info("Todo created: id={}, userId={}, dueDate={}, priority={}, tags={}",
                saved.getId(), principal.getId(), saved.getDueDate(), saved.getPriority(), safeTags(saved));
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TodoResponse> list(UserPrincipal principal, Boolean completed, LocalDate dueDate) {
        log.info("Todo list requested: userId={}, completed={}, dueDate={}", principal.getId(), completed, dueDate);
        return todoRepository.findByUserIdOrderByDueDateAscCreatedAtDesc(principal.getId()).stream()
                .filter(t -> completed == null || completed.equals(t.getCompleted()))
                .filter(t -> dueDate == null || dueDate.equals(t.getDueDate()))
                .map(this::toResponse)
                .toList();
    }

    public TodoResponse update(UserPrincipal principal, Long id, UpdateTodoRequest req) {
        Todo todo = getOwned(principal.getId(), id);

        if (req.title() != null && !req.title().isBlank()) todo.setTitle(req.title().trim());
        if (req.notes() != null) todo.setNotes(req.notes());
        if (req.dueDate() != null) todo.setDueDate(req.dueDate());
        if (req.priority() != null && !req.priority().isBlank()) todo.setPriority(parsePriority(req.priority()));
        if (req.tags() != null) todo.setTags(cleanTags(req.tags()));
        if (req.completed() != null) applyCompleted(todo, req.completed());

        return toResponse(todoRepository.save(todo));
    }

    public TodoResponse toggleComplete(UserPrincipal principal, Long id) {
        Todo todo = getOwned(principal.getId(), id);
        applyCompleted(todo, !todo.getCompleted());
        return toResponse(todoRepository.save(todo));
    }

    public void delete(UserPrincipal principal, Long id) {
        todoRepository.delete(getOwned(principal.getId(), id));
    }

    /** Today's tasks, in priority order, followed by today's calendar events, chronologically. */
    @Transactional(readOnly = true)
    public List<TodayTodoItemResponse> getTodayView(UserPrincipal principal) {
        LocalDate today = LocalDate.now();
        List<TodayTodoItemResponse> items = new ArrayList<>();

        todoRepository.findByUserIdAndDueDate(principal.getId(), today).stream()
                .sorted(Comparator.comparingInt((Todo t) -> priorityRank(t.getPriority())).reversed()
                        .thenComparing(Todo::getCreatedAt))
                .forEach(t -> items.add(new TodayTodoItemResponse(
                        "TASK", t.getId(), null, t.getTitle(), t.getPriority().name(),
                        new ArrayList<>(t.getTags()), t.getCompleted(), t.getNotes(), null, null)));

        try {
            googleCalendarService.getEventsForDate(principal, today).forEach(ev -> items.add(new TodayTodoItemResponse(
                    "CALENDAR", null, ev.id(), ev.title(), null, List.of(), false,
                    ev.location(), ev.start(), ev.allDay())));
        } catch (ApiException ignored) {
            // Not connected, or Google unreachable right now — today's tasks still show on their own.
        }

        return items;
    }

    private int priorityRank(TodoPriority p) {
        return switch (p) {
            case HIGH -> 2;
            case MEDIUM -> 1;
            case LOW -> 0;
        };
    }

    private void applyCompleted(Todo todo, boolean completed) {
        todo.setCompleted(completed);
        todo.setCompletedAt(completed ? Instant.now() : null);
    }

    private Todo getOwned(Long userId, Long id) {
        return todoRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "To-do not found"));
    }

    private TodoPriority parsePriority(String value) {
        if (value == null || value.isBlank()) return TodoPriority.MEDIUM;
        try {
            return TodoPriority.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Priority must be one of: LOW, MEDIUM, HIGH");
        }
    }

    private List<String> cleanTags(List<String> tags) {
        if (tags == null) return new ArrayList<>();
        List<String> cleaned = new ArrayList<>();
        for (String t : tags) {
            if (t != null && !t.isBlank() && !cleaned.contains(t.trim())) cleaned.add(t.trim());
        }
        return cleaned;
    }

    private TodoResponse toResponse(Todo t) {
        return new TodoResponse(
                t.getId(), t.getTitle(), t.getNotes(), t.getDueDate(), t.getPriority().name(),
                new ArrayList<>(t.getTags()), t.getCompleted(), t.getCompletedAt(), t.getCreatedAt(), t.getUpdatedAt());
    }

    private List<String> safeTags(Todo todo) {
        try {
            return new ArrayList<>(todo.getTags());
        } catch (Exception ex) {
            return List.of();
        }
    }
}
