package com.sprout.backend.controller;

import com.sprout.backend.dto.request.CreateHabitRequest;
import com.sprout.backend.dto.request.UpdateHabitRequest;
import com.sprout.backend.dto.response.HabitResponse;
import com.sprout.backend.security.UserPrincipal;
import com.sprout.backend.service.HabitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/habits")
@RequiredArgsConstructor
public class HabitController {

    private final HabitService habitService;

    @PostMapping
    public ResponseEntity<HabitResponse> create(@AuthenticationPrincipal UserPrincipal principal,
                                                 @Valid @RequestBody CreateHabitRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(habitService.createHabit(principal, request));
    }

    @GetMapping
    public ResponseEntity<List<HabitResponse>> list(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(habitService.listHabits(principal));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<HabitResponse> update(@AuthenticationPrincipal UserPrincipal principal,
                                                 @PathVariable Long id,
                                                 @Valid @RequestBody UpdateHabitRequest request) {
        return ResponseEntity.ok(habitService.updateHabit(principal, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        habitService.deleteHabit(principal, id);
        return ResponseEntity.noContent().build();
    }
}
