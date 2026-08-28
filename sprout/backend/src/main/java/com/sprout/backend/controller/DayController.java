package com.sprout.backend.controller;

import com.sprout.backend.dto.response.TodayResponse;
import com.sprout.backend.security.UserPrincipal;
import com.sprout.backend.service.DayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/days")
@RequiredArgsConstructor
public class DayController {

    private final DayService dayService;

    @GetMapping("/today")
    public ResponseEntity<TodayResponse> today(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(dayService.getToday(principal));
    }

    @GetMapping("/{dayNumber}")
    public ResponseEntity<TodayResponse> forDay(@AuthenticationPrincipal UserPrincipal principal,
                                                @PathVariable int dayNumber) {
        return ResponseEntity.ok(dayService.getForDayNumber(principal, dayNumber));
    }
}
