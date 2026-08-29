package com.sprout.backend.service;

import com.sprout.backend.dto.request.*;
import com.sprout.backend.dto.response.*;
import com.sprout.backend.entity.*;
import com.sprout.backend.exception.ApiException;
import com.sprout.backend.repository.*;
import com.sprout.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final MilestoneRepository milestoneRepository;
    private final ChecklistItemRepository checklistItemRepository;


    @PersistenceContext
    private EntityManager entityManager;
    // ───────────────────────────── Projects ─────────────────────────────

    public ProjectResponse createProject(UserPrincipal principal, CreateProjectRequest req) {
        Project project = Project.builder()
                .user(principal.getUser())
                .name(req.name().trim())
                .description(req.description())
                .deadline(req.deadline())
                .build();
        return toResponse(projectRepository.save(project));
    }

    @Transactional(readOnly = true)
    public List<ProjectSummaryResponse> listProjects(UserPrincipal principal) {
        return projectRepository.findByUserIdOrderByCreatedAtDesc(principal.getId()).stream()
                .map(this::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProject(UserPrincipal principal, Long projectId) {
        return toResponse(getOwnedProject(principal.getId(), projectId));
    }

    public ProjectResponse updateProject(UserPrincipal principal, Long projectId, UpdateProjectRequest req) {
        Project project = getOwnedProject(principal.getId(), projectId);
        if (req.name() != null && !req.name().isBlank()) project.setName(req.name().trim());
        if (req.description() != null) project.setDescription(req.description());
        if (req.deadline() != null) project.setDeadline(req.deadline());
        return toResponse(projectRepository.save(project));
    }

    public void deleteProject(UserPrincipal principal, Long projectId) {
        projectRepository.delete(getOwnedProject(principal.getId(), projectId));
    }

    // ─────────────────────────── Milestones ─────────────────────────────

    public ProjectResponse addMilestone(UserPrincipal principal, Long projectId, CreateMilestoneRequest req) {
        Project project = getOwnedProject(principal.getId(), projectId);
        int nextPos = project.getMilestones().size();
        Milestone milestone = Milestone.builder()
                .project(project)
                .name(req.name().trim())
                .dueDate(req.dueDate())
                .position(nextPos)
                .build();
        milestoneRepository.save(milestone);
        // Keep the owning side consistent in-memory too, so the returned project includes the new milestone.
        project.getMilestones().add(milestone);
        return toResponse(project);
    }

    public ProjectResponse updateMilestone(UserPrincipal principal, Long projectId, Long milestoneId, UpdateMilestoneRequest req) {
        getOwnedProject(principal.getId(), projectId);
        Milestone milestone = getOwnedMilestone(projectId, milestoneId);
        if (req.name() != null && !req.name().isBlank()) milestone.setName(req.name().trim());
        if (req.dueDate() != null) milestone.setDueDate(req.dueDate());
        milestoneRepository.save(milestone);
        return toResponse(getOwnedProject(principal.getId(), projectId));
    }

    public ProjectResponse deleteMilestone(UserPrincipal principal, Long projectId, Long milestoneId) {
        Project project = getOwnedProject(principal.getId(), projectId);
        Milestone milestone = getOwnedMilestone(projectId, milestoneId);
        milestoneRepository.delete(milestone);
        project.getMilestones().removeIf(m -> m.getId().equals(milestoneId));
        return toResponse(project);
    }

    // ─────────────────────────── Checklist items ─────────────────────────────

    public ProjectResponse addChecklistItem(UserPrincipal principal, Long projectId, Long milestoneId, CreateChecklistItemRequest req) {
        getOwnedProject(principal.getId(), projectId);
        Milestone milestone = getOwnedMilestone(projectId, milestoneId);
        int nextPos = milestone.getChecklistItems().size();
        ChecklistItem item = ChecklistItem.builder()
                .milestone(milestone)
                .title(req.title().trim())
                .position(nextPos)
                .build();
        checklistItemRepository.saveAndFlush(item);
        return toResponse(getOwnedProject(principal.getId(), projectId));
    }

    public ProjectResponse toggleChecklistItem(UserPrincipal principal, Long projectId, Long milestoneId, Long itemId) {
        getOwnedProject(principal.getId(), projectId);
        getOwnedMilestone(projectId, milestoneId);
        ChecklistItem item = checklistItemRepository.findByIdAndMilestoneId(itemId, milestoneId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Checklist item not found"));
        item.setCompleted(!item.getCompleted());
        checklistItemRepository.save(item);
        return toResponse(getOwnedProject(principal.getId(), projectId));
    }

    public ProjectResponse deleteChecklistItem(UserPrincipal principal, Long projectId, Long milestoneId, Long itemId) {
        getOwnedProject(principal.getId(), projectId);
        getOwnedMilestone(projectId, milestoneId);
        ChecklistItem item = checklistItemRepository.findByIdAndMilestoneId(itemId, milestoneId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Checklist item not found"));
        System.out.println("Deleting item " + item.getId());
        checklistItemRepository.delete(item);
        System.out.println(
                checklistItemRepository.findById(item.getId()).isPresent()
        );
        entityManager.flush();
        entityManager.clear();

        Project project = getOwnedProject(principal.getId(), projectId);
        return toResponse(project);    }

    public ProjectResponse updateChecklistItem(
            UserPrincipal principal,
            Long projectId,
            Long milestoneId,
            Long itemId,
            UpdateChecklistItemRequest request) {

        getOwnedProject(principal.getId(), projectId);
        getOwnedMilestone(projectId, milestoneId);

        ChecklistItem item = checklistItemRepository
                .findByIdAndMilestoneId(itemId, milestoneId)
                .orElseThrow(() ->
                        new ApiException(HttpStatus.NOT_FOUND, "Checklist item not found"));

        item.setTitle(request.title().trim());

        checklistItemRepository.save(item);

        entityManager.flush();
        entityManager.clear();

        return toResponse(getOwnedProject(principal.getId(), projectId));
    }

    // ─────────────────────────── Mapping ─────────────────────────────

    private ProjectResponse toResponse(Project p) {
        List<MilestoneResponse> milestones = p.getMilestones().stream().map(this::toMilestoneResponse).toList();
        int projectProgress = milestones.isEmpty() ? 0
                : (int) Math.round(milestones.stream().mapToInt(MilestoneResponse::progressPercent).average().orElse(0));
        return new ProjectResponse(
                p.getId(), p.getName(), p.getDescription(), p.getDeadline(),
                milestones, projectProgress, p.getCreatedAt(), p.getUpdatedAt());
    }

    private ProjectSummaryResponse toSummary(Project p) {
        List<MilestoneResponse> ms = p.getMilestones().stream().map(this::toMilestoneResponse).toList();
        int progress = ms.isEmpty() ? 0
                : (int) Math.round(ms.stream().mapToInt(MilestoneResponse::progressPercent).average().orElse(0));
        long completed = ms.stream().filter(m -> m.progressPercent() == 100).count();
        return new ProjectSummaryResponse(
                p.getId(), p.getName(), p.getDescription(), p.getDeadline(),
                progress, ms.size(), (int) completed, p.getCreatedAt(), p.getUpdatedAt());
    }

    private MilestoneResponse toMilestoneResponse(Milestone m) {
        List<ChecklistItemResponse> items = m.getChecklistItems().stream()
                .map(i -> new ChecklistItemResponse(i.getId(), i.getTitle(), i.getCompleted(), i.getPosition(), i.getCreatedAt()))
                .toList();
        int total = items.size();
        int done = (int) items.stream().filter(ChecklistItemResponse::completed).count();
        int pct = total == 0 ? 0 : (int) Math.round((done * 100.0) / total);
        return new MilestoneResponse(m.getId(), m.getName(), m.getDueDate(), m.getPosition(),
                items, pct, done, total, m.getCreatedAt(), m.getUpdatedAt());
    }

    private Project getOwnedProject(Long userId, Long projectId) {
        return projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Project not found"));
    }

    private Milestone getOwnedMilestone(Long projectId, Long milestoneId) {
        return milestoneRepository.findByIdAndProjectId(milestoneId, projectId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Milestone not found"));
    }
}
