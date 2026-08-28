package com.sprout.backend.controller;

import com.sprout.backend.dto.request.CreateTodoRequest;
import com.sprout.backend.dto.request.UpdateTodoRequest;
import com.sprout.backend.dto.response.TodayTodoItemResponse;
import com.sprout.backend.dto.response.TodoResponse;
import com.sprout.backend.security.UserPrincipal;
import com.sprout.backend.service.TodoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/todos")
@RequiredArgsConstructor
public class TodoController {

    private final TodoService todoService;

    @PostMapping
    public ResponseEntity<TodoResponse> create(@AuthenticationPrincipal UserPrincipal principal,
                                               @Valid @RequestBody CreateTodoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(todoService.create(principal, request));
    }

    @GetMapping
    public ResponseEntity<List<TodoResponse>> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Boolean completed,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDate) {
        return ResponseEntity.ok(todoService.list(principal, completed, dueDate));
    }

    /** Today's own tasks plus today's calendar events, merged into one chronological-ish list. */
    @GetMapping("/today")
    public ResponseEntity<List<TodayTodoItemResponse>> today(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(todoService.getTodayView(principal));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TodoResponse> update(@AuthenticationPrincipal UserPrincipal principal,
                                               @PathVariable Long id,
                                               @Valid @RequestBody UpdateTodoRequest request) {
        return ResponseEntity.ok(todoService.update(principal, id, request));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<TodoResponse> toggle(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return ResponseEntity.ok(todoService.toggleComplete(principal, id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        todoService.delete(principal, id);
        return ResponseEntity.noContent().build();
    }
}
