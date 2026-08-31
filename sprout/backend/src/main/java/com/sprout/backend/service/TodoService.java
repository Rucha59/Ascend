package com.sprout.backend.service;

import com.sprout.backend.dto.request.CreateTodoRequest;
import com.sprout.backend.dto.request.QuickCreateTodoRequest;
import com.sprout.backend.dto.request.UpdateTodoRequest;
import com.sprout.backend.dto.response.TodayTodoItemResponse;
import com.sprout.backend.dto.response.TodoResponse;
import com.sprout.backend.entity.Milestone;
import com.sprout.backend.entity.Todo;
import com.sprout.backend.entity.TodoPriority;
import com.sprout.backend.exception.ApiException;
import com.sprout.backend.repository.MilestoneRepository;
import com.sprout.backend.repository.TodoRepository;
import com.sprout.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class TodoService {

    private final TodoRepository todoRepository;
    private final MilestoneRepository milestoneRepository;
    private final GoogleCalendarService googleCalendarService;

    public TodoResponse create(UserPrincipal principal, CreateTodoRequest req) {
        Todo todo = Todo.builder()
                .user(principal.getUser())
                .title(req.title().trim())
                .notes(req.notes())
                .dueDate(req.dueDate())
                .priority(parsePriority(req.priority()))
                .tags(cleanTags(req.tags()))
                .completed(false)
                .build();
        return toResponse(todoRepository.save(todo));
    }

    /**
     * Dashboard "Add today's to-do": always sets dueDate = today so the task appears in
     * the today view immediately AND in the universal to-do list filtered by today.
     */
    public TodoResponse quickCreate(UserPrincipal principal, QuickCreateTodoRequest req) {
        Todo todo = Todo.builder()
                .user(principal.getUser())
                .title(req.title().trim())
                .dueDate(LocalDate.now())
                .priority(parsePriority(req.priority()))
                .tags(new ArrayList<>())
                .completed(false)
                .build();
        return toResponse(todoRepository.save(todo));
    }

    public List<TodoResponse> list(UserPrincipal principal, Boolean completed, LocalDate dueDate) {
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

    /**
     * Merged "today" view shown on the Dashboard:
     *   1. User's own tasks due today — sorted by priority (HIGH first) then created-at.
     *   2. Milestones due today with their checklist items expanded beneath each one.
     *   3. Google Calendar events (chronological), if connected.
     *
     * The three groups are in separate sections on the frontend — never interleaved.
     */
    public List<TodayTodoItemResponse> getTodayView(UserPrincipal principal) {
        LocalDate today = LocalDate.now();
        Long userId = principal.getId();
        List<TodayTodoItemResponse> items = new ArrayList<>();

        // ── 1. Tasks ──────────────────────────────────────────────────────
        todoRepository.findByUserIdAndDueDate(userId, today).stream()
                .sorted(Comparator.comparingInt((Todo t) -> priorityRank(t.getPriority()))
                        .reversed().thenComparing(Todo::getCreatedAt))
                .forEach(t -> items.add(taskRow(t)));

        // ── 2. Milestones + checklist items ───────────────────────────────
        List<Milestone> milestones = milestoneRepository.findByUserIdAndDueDate(userId, today);
        for (Milestone m : milestones) {
            String projectName = m.getProject().getName();
            Long projectId = m.getProject().getId();

            // Header row for the milestone
            items.add(new TodayTodoItemResponse(
                    "MILESTONE", null, null, m.getId(), null, projectId,
                    m.getName(), null, List.of(), false,
                    "Due today · " + projectName,
                    null, null, projectName));

            // One row per checklist item
            m.getChecklistItems().stream()
                    .sorted(Comparator.comparingInt(i -> i.getPosition()))
                    .forEach(item -> items.add(new TodayTodoItemResponse(
                            "CHECKLIST", null, null, m.getId(), item.getId(), projectId,
                            item.getTitle(), null, List.of(),
                            item.getCompleted(), null, null, null, projectName)));
        }

        // ── 3. Calendar events ─────────────────────────────────────────────
        try {
            googleCalendarService.getEventsForDate(principal, today).forEach(ev ->
                    items.add(new TodayTodoItemResponse(
                            "CALENDAR", null, ev.id(), null, null, null,
                            ev.title(), null, List.of(), false,
                            ev.location(), ev.start(), ev.allDay(), null)));
        } catch (ApiException ignored) {
            // Not connected — tasks and milestones still show.
        }

        return items;
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private TodayTodoItemResponse taskRow(Todo t) {
        // Copy the lazy @ElementCollection into a plain list while the session is still open,
        // so Jackson never touches a Hibernate PersistentList after the transaction closes.
        List<String> tags = t.getTags() != null ? new ArrayList<>(t.getTags()) : new ArrayList<>();
        return new TodayTodoItemResponse(
                "TASK", t.getId(), null, null, null, null,
                t.getTitle(), t.getPriority().name(), tags,
                t.getCompleted(), t.getNotes(), null, null, null);
    }

    private int priorityRank(TodoPriority p) {
        return switch (p) { case HIGH -> 2; case MEDIUM -> 1; case LOW -> 0; };
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
        List<String> tags = t.getTags() != null ? new ArrayList<>(t.getTags()) : new ArrayList<>();
        return new TodoResponse(
                t.getId(), t.getTitle(), t.getNotes(), t.getDueDate(),
                t.getPriority().name(), tags, t.getCompleted(),
                t.getCompletedAt(), t.getCreatedAt(), t.getUpdatedAt());
    }
}
