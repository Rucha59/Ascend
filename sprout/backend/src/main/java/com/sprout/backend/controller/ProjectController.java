package com.sprout.backend.controller;

import com.sprout.backend.dto.request.*;
import com.sprout.backend.dto.response.*;
import com.sprout.backend.security.UserPrincipal;
import com.sprout.backend.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    // ── Projects ─────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<ProjectResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateProjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(principal, request));
    }

    @GetMapping
    public ResponseEntity<List<ProjectSummaryResponse>> list(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(projectService.listProjects(principal));
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> get(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long projectId) {
        return ResponseEntity.ok(projectService.getProject(principal, projectId));
    }

    @PatchMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long projectId,
            @Valid @RequestBody UpdateProjectRequest request) {
        return ResponseEntity.ok(projectService.updateProject(principal, projectId, request));
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long projectId) {
        projectService.deleteProject(principal, projectId);
        return ResponseEntity.noContent().build();
    }

    // ── Milestones ────────────────────────────────────────────────────────

    @PostMapping("/{projectId}/milestones")
    public ResponseEntity<ProjectResponse> addMilestone(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long projectId,
            @Valid @RequestBody CreateMilestoneRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.addMilestone(principal, projectId, request));
    }

    @PatchMapping("/{projectId}/milestones/{milestoneId}")
    public ResponseEntity<ProjectResponse> updateMilestone(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long projectId,
            @PathVariable Long milestoneId,
            @Valid @RequestBody UpdateMilestoneRequest request) {
        return ResponseEntity.ok(projectService.updateMilestone(principal, projectId, milestoneId, request));
    }

    @DeleteMapping("/{projectId}/milestones/{milestoneId}")
    public ResponseEntity<ProjectResponse> deleteMilestone(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long projectId,
            @PathVariable Long milestoneId) {
        return ResponseEntity.ok(projectService.deleteMilestone(principal, projectId, milestoneId));
    }

    // ── Checklist items ───────────────────────────────────────────────────

    @PostMapping("/{projectId}/milestones/{milestoneId}/items")
    public ResponseEntity<ProjectResponse> addItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long projectId,
            @PathVariable Long milestoneId,
            @Valid @RequestBody CreateChecklistItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                projectService.addChecklistItem(principal, projectId, milestoneId, request));
    }

    @PatchMapping("/{projectId}/milestones/{milestoneId}/items/{itemId}/toggle")
    public ResponseEntity<ProjectResponse> toggleItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long projectId,
            @PathVariable Long milestoneId,
            @PathVariable Long itemId) {
        return ResponseEntity.ok(projectService.toggleChecklistItem(principal, projectId, milestoneId, itemId));
    }

    @DeleteMapping("/{projectId}/milestones/{milestoneId}/items/{itemId}")
    public ResponseEntity<ProjectResponse> deleteItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long projectId,
            @PathVariable Long milestoneId,
            @PathVariable Long itemId) {
        return ResponseEntity.ok(projectService.deleteChecklistItem(principal, projectId, milestoneId, itemId));
    }
    @PatchMapping("/{projectId}/milestones/{milestoneId}/items/{itemId}")
    public ResponseEntity<ProjectResponse> updateChecklistItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long projectId,
            @PathVariable Long milestoneId,
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateChecklistItemRequest request) {

        return ResponseEntity.ok(
                projectService.updateChecklistItem(
                        principal,
                        projectId,
                        milestoneId,
                        itemId,
                        request
                )
        );
    }
}
