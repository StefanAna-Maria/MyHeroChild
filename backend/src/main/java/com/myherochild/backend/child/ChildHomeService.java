package com.myherochild.backend.child;

import com.myherochild.backend.child.dto.ChildAssignedRewardResponse;
import com.myherochild.backend.child.dto.ChildAssignedTaskResponse;
import com.myherochild.backend.child.dto.ChildHomeResponse;
import com.myherochild.backend.child.dto.ChildNotificationResponse;
import com.myherochild.backend.child.dto.ChildTaskValidationRequest;
import com.myherochild.backend.common.exception.BusinessException;
import com.myherochild.backend.parent.ParentAssignedReward;
import com.myherochild.backend.parent.ParentAssignedRewardRepository;
import com.myherochild.backend.parent.ParentAssignedTask;
import com.myherochild.backend.parent.ParentAssignedTaskRepository;
import com.myherochild.backend.user.User;
import com.myherochild.backend.user.UserRepository;
import com.myherochild.backend.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class ChildHomeService {

    private final UserRepository userRepository;
    private final ParentAssignedTaskRepository parentAssignedTaskRepository;
    private final ParentAssignedRewardRepository parentAssignedRewardRepository;
    private final ChildNotificationRepository childNotificationRepository;

    public ChildHomeResponse getHome(String username) {
        User child = getChild(username);
        LocalDate today = LocalDate.now();
        java.util.List<ChildNotification> unseenNotifications = childNotificationRepository
                .findAllByChildIdAndSeenFalseOrderByCreatedAtAsc(child.getId());

        ChildHomeResponse response = ChildHomeResponse.builder()
                .todaysTasks(parentAssignedTaskRepository
                        .findAllByChildIdAndCompletedFalseAndStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByEndDateAscTitleAsc(
                                child.getId(),
                                today,
                                today
                        )
                        .stream()
                        .map(this::mapTask)
                        .toList())
                .rewardShop(parentAssignedRewardRepository
                        .findAllByChildIdAndClaimedFalseAndStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByEndDateAscTitleAsc(
                                child.getId(),
                                today,
                                today
                        )
                        .stream()
                        .map(this::mapReward)
                        .toList())
                .myRewards(parentAssignedRewardRepository
                        .findAllByChildIdAndClaimedTrueOrderByClaimedAtDescCreatedAtDesc(child.getId())
                        .stream()
                        .map(this::mapReward)
                        .toList())
                .wishlist(Collections.emptyList())
                .notifications(unseenNotifications.stream().map(this::mapNotification).toList())
                .build();

        if (!unseenNotifications.isEmpty()) {
            unseenNotifications.forEach(notification -> notification.setSeen(true));
            childNotificationRepository.saveAll(unseenNotifications);
        }

        return response;
    }

    public ChildAssignedTaskResponse updateTaskValidationRequest(
            String username,
            Long taskId,
            ChildTaskValidationRequest request
    ) {
        User child = getChild(username);

        ParentAssignedTask task = parentAssignedTaskRepository.findByIdAndChildId(taskId, child.getId())
                .orElseThrow(() -> new BusinessException("Task not found"));

        if (task.isCompleted()) {
            throw new BusinessException("Completed tasks can no longer be updated");
        }

        task.setCompletionRequested(request.isCompletionRequested());
        task.setCompletionRequestedAt(request.isCompletionRequested() ? LocalDateTime.now() : null);

        ParentAssignedTask savedTask = parentAssignedTaskRepository.save(task);
        return mapTask(savedTask);
    }

    private User getChild(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("User not found"));

        if (user.getRole() != UserRole.CHILD) {
            throw new BusinessException("Only children can access this page");
        }

        return user;
    }

    private ChildAssignedTaskResponse mapTask(ParentAssignedTask task) {
        return ChildAssignedTaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .xp(task.getXp())
                .rewardPoints(task.getRewardPoints())
                .type(task.getType().getValue())
                .startDate(task.getStartDate().toString())
                .endDate(task.getEndDate().toString())
                .completionRequested(task.isCompletionRequested())
                .build();
    }

    private ChildAssignedRewardResponse mapReward(ParentAssignedReward reward) {
        return ChildAssignedRewardResponse.builder()
                .id(reward.getId())
                .title(reward.getTitle())
                .price(reward.getPrice())
                .type(reward.getType().getValue())
                .startDate(reward.getStartDate().toString())
                .endDate(reward.getEndDate().toString())
                .claimed(reward.isClaimed())
                .build();
    }

    private ChildNotificationResponse mapNotification(ChildNotification notification) {
        return ChildNotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .build();
    }
}
