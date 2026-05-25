package com.myherochild.backend.parent;

import com.myherochild.backend.child.ChildDailyBonusService;
import com.myherochild.backend.child.ChildNotification;
import com.myherochild.backend.child.ChildNotificationRepository;
import com.myherochild.backend.common.exception.BusinessException;
import com.myherochild.backend.level.LevelProgress;
import com.myherochild.backend.level.UserLevelService;
import com.myherochild.backend.parent.dto.ParentEvaluationChildResponse;
import com.myherochild.backend.parent.dto.ParentEvaluationTaskResponse;
import com.myherochild.backend.user.User;
import com.myherochild.backend.user.UserRepository;
import com.myherochild.backend.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ParentEvaluationService {

    private final UserRepository userRepository;
    private final ParentAssignedTaskRepository parentAssignedTaskRepository;
    private final ChildNotificationRepository childNotificationRepository;
    private final UserLevelService userLevelService;
    private final ParentAssignedTaskStatusService parentAssignedTaskStatusService;
    private final ChildDailyBonusService childDailyBonusService;

    public List<ParentEvaluationChildResponse> getPendingTasks(String username) {
        User parent = getParent(username);
        parentAssignedTaskStatusService.syncExpiredTasks();

        List<ParentAssignedTask> pendingTasks = parentAssignedTaskRepository
                .findAllByParentIdAndCompletionRequestedTrueAndReviewedFalseOrderByCompletionRequestedAtAscCreatedAtAsc(
                        parent.getId()
                );

        Map<Long, ParentEvaluationChildResponse> grouped = new LinkedHashMap<>();

        for (ParentAssignedTask task : pendingTasks) {
            User child = userLevelService.syncLevel(task.getChild());

            ParentEvaluationChildResponse existing = grouped.get(child.getId());

            if (existing == null) {
                existing = ParentEvaluationChildResponse.builder()
                        .id(child.getId())
                        .username(child.getUsername())
                        .avatar(child.getAvatar())
                        .tasks(new java.util.ArrayList<>())
                        .build();
                grouped.put(child.getId(), existing);
            }

            existing.getTasks().add(
                    ParentEvaluationTaskResponse.builder()
                            .id(task.getId())
                            .title(task.getTitle())
                            .build()
            );
        }

        return grouped.values().stream()
                .filter(child -> !child.getTasks().isEmpty())
                .toList();
    }

    public void approveTask(String username, Long taskId) {
        User parent = getParent(username);
        ParentAssignedTask task = getPendingTask(parent, taskId);
        User child = userLevelService.syncLevel(task.getChild());

        int previousLevel = child.getLevel();

        child.setXp(child.getXp() + task.getXp());
        child.setRewardPoints(child.getRewardPoints() + task.getRewardPoints());
        userRepository.save(child);

        User leveledChild = userLevelService.syncLevel(child);

        createNotification(
                leveledChild,
                "TASK_APPROVED",
                "Task validated",
                "Great job! \"" + task.getTitle() + "\" was validated and you earned "
                        + task.getXp() + " XP and " + task.getRewardPoints() + " reward points."
        );

        if (leveledChild.getLevel() > previousLevel) {
            LevelProgress progress = userLevelService.resolveProgress(leveledChild.getXp());
            createNotification(
                    leveledChild,
                    "LEVEL_UP",
                    "Level up!",
                    "Amazing work! You reached level " + progress.getLevel() + ". Keep going!"
            );
        }

        task.setReviewed(true);
        task.setApproved(true);
        task.setReviewedAt(LocalDateTime.now());
        task.setCompletionRequested(false);
        task.setCompletionRequestedAt(null);
        parentAssignedTaskRepository.save(task);
        childDailyBonusService.handleApprovedTask(task);
    }

    public void rejectTask(String username, Long taskId) {
        User parent = getParent(username);
        ParentAssignedTask task = getPendingTask(parent, taskId);

        createNotification(
                task.getChild(),
                "TASK_REJECTED",
                "Task not approved",
                "Unfortunately, your completion for \"" + task.getTitle()
                        + "\" was not approved this time, so you did not receive rewards."
        );

        task.setReviewed(true);
        task.setApproved(false);
        task.setReviewedAt(LocalDateTime.now());
        task.setCompletionRequested(false);
        task.setCompletionRequestedAt(null);
        parentAssignedTaskRepository.save(task);
        childDailyBonusService.handleRejectedTask(task);
    }

    private void createNotification(User child, String type, String title, String message) {
        childNotificationRepository.save(
                ChildNotification.builder()
                        .child(child)
                        .type(type)
                        .title(title)
                        .message(message)
                        .createdAt(LocalDateTime.now())
                        .build()
        );
    }

    private User getParent(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("User not found"));

        if (user.getRole() != UserRole.PARENT) {
            throw new BusinessException("Only parents can evaluate tasks");
        }

        return user;
    }

    private ParentAssignedTask getPendingTask(User parent, Long taskId) {
        ParentAssignedTask task = parentAssignedTaskRepository.findById(taskId)
                .orElseThrow(() -> new BusinessException("Task not found"));

        if (!task.getParent().getId().equals(parent.getId())) {
            throw new BusinessException("This task does not belong to the current parent");
        }

        if (task.isReviewed() || !task.isCompletionRequested()) {
            throw new BusinessException("This task is not pending validation");
        }

        return task;
    }
}
