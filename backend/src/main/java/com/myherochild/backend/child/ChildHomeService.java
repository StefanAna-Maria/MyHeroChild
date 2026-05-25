package com.myherochild.backend.child;

import com.myherochild.backend.child.dto.ChildAssignedRewardResponse;
import com.myherochild.backend.child.dto.ChildAssignedTaskResponse;
import com.myherochild.backend.child.dto.ChildDailyBonusResponse;
import com.myherochild.backend.child.dto.ChildHomeResponse;
import com.myherochild.backend.child.dto.ChildNotificationResponse;
import com.myherochild.backend.child.dto.ChildRewardsResponse;
import com.myherochild.backend.child.dto.ChildTaskValidationRequest;
import com.myherochild.backend.child.dto.ChildTasksResponse;
import com.myherochild.backend.child.dto.ChildWishlistRewardRequest;
import com.myherochild.backend.child.dto.ChildWishlistRewardResponse;
import com.myherochild.backend.common.exception.BusinessException;
import com.myherochild.backend.common.model.RewardType;
import com.myherochild.backend.parent.ParentAssignedReward;
import com.myherochild.backend.parent.ParentAssignedRewardRepository;
import com.myherochild.backend.parent.ParentAssignedRewardStatusService;
import com.myherochild.backend.parent.ParentAssignedTask;
import com.myherochild.backend.parent.ParentAssignedTaskRepository;
import com.myherochild.backend.parent.ParentAssignedTaskStatusService;
import com.myherochild.backend.user.User;
import com.myherochild.backend.user.UserRepository;
import com.myherochild.backend.user.UserRole;
import jakarta.transaction.Transactional;
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
    private final ParentAssignedTaskStatusService parentAssignedTaskStatusService;
    private final ParentAssignedRewardStatusService parentAssignedRewardStatusService;
    private final ChildDailyBonusService childDailyBonusService;
    private final ChildWishlistRewardRepository childWishlistRewardRepository;

    public ChildHomeResponse getHome(String username) {
        User child = getChild(username);
        LocalDate today = LocalDate.now();
        parentAssignedTaskStatusService.syncExpiredTasks();
        parentAssignedRewardStatusService.syncExpiredRewards();
        java.util.List<ChildNotification> unseenNotifications = childNotificationRepository
                .findAllByChildIdAndSeenFalseOrderByCreatedAtAsc(child.getId());

        ChildHomeResponse response = ChildHomeResponse.builder()
                .todaysTasks(parentAssignedTaskRepository
                        .findAllByChildIdAndReviewedFalseAndExpiredFalseAndStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByEndDateAscTitleAsc(
                                child.getId(),
                                today,
                                today
                        )
                        .stream()
                        .map(this::mapTask)
                        .toList())
                .dailyBonus(childDailyBonusService.getDailyBonus(child))
                .rewardShop(parentAssignedRewardRepository
                        .findAllByChildIdAndClaimedFalseAndExpiredFalseAndStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByEndDateAscTitleAsc(
                                child.getId(),
                                today,
                                today
                        )
                        .stream()
                        .map(this::mapReward)
                        .toList())
                .myRewards(parentAssignedRewardRepository
                        .findAllByChildIdAndClaimedTrueAndGrantedFalseOrderByClaimedAtDescCreatedAtDesc(child.getId())
                        .stream()
                        .map(this::mapReward)
                        .toList())
                .wishlist(childWishlistRewardRepository
                        .findAllByChildIdAndAddedToParentCatalogueFalseOrderByCreatedAtDesc(child.getId())
                        .stream()
                        .map(ChildWishlistReward::getTitle)
                        .toList())
                .notifications(unseenNotifications.stream().map(this::mapNotification).toList())
                .build();

        if (!unseenNotifications.isEmpty()) {
            unseenNotifications.forEach(notification -> notification.setSeen(true));
            childNotificationRepository.saveAll(unseenNotifications);
        }

        return response;
    }

    public ChildTasksResponse getTasks(String username) {
        User child = getChild(username);
        LocalDate today = LocalDate.now();
        parentAssignedTaskStatusService.syncExpiredTasks();
        parentAssignedRewardStatusService.syncExpiredRewards();
        java.util.List<ChildNotification> unseenNotifications = childNotificationRepository
                .findAllByChildIdAndSeenFalseOrderByCreatedAtAsc(child.getId());

        ChildTasksResponse response = ChildTasksResponse.builder()
                .tasks(parentAssignedTaskRepository
                        .findAllByChildIdAndReviewedFalseAndExpiredFalseAndEndDateGreaterThanEqualOrderByStartDateAscEndDateAscTitleAsc(
                                child.getId(),
                                today
                        )
                        .stream()
                        .map(this::mapTask)
                        .toList())
                .dailyBonus(childDailyBonusService.getDailyBonus(child))
                .notifications(unseenNotifications.stream().map(this::mapNotification).toList())
                .build();

        if (!unseenNotifications.isEmpty()) {
            unseenNotifications.forEach(notification -> notification.setSeen(true));
            childNotificationRepository.saveAll(unseenNotifications);
        }

        return response;
    }

    public ChildRewardsResponse getRewards(String username) {
        User child = getChild(username);
        LocalDate today = LocalDate.now();
        parentAssignedRewardStatusService.syncExpiredRewards();
        java.util.List<ChildNotification> unseenNotifications = childNotificationRepository
                .findAllByChildIdAndSeenFalseOrderByCreatedAtAsc(child.getId());

        ChildRewardsResponse response = ChildRewardsResponse.builder()
                .rewardShop(parentAssignedRewardRepository
                        .findAllByChildIdAndClaimedFalseAndExpiredFalseAndStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByEndDateAscTitleAsc(
                                child.getId(),
                                today,
                                today
                        )
                        .stream()
                        .map(this::mapReward)
                        .toList())
                .myRewards(parentAssignedRewardRepository
                        .findAllByChildIdAndClaimedTrueAndGrantedFalseOrderByClaimedAtDescCreatedAtDesc(child.getId())
                        .stream()
                        .map(this::mapReward)
                        .toList())
                .rewardHistory(parentAssignedRewardRepository
                        .findAllByChildIdAndGrantedTrueOrderByGrantedAtDescClaimedAtDescCreatedAtDesc(child.getId())
                        .stream()
                        .map(this::mapReward)
                        .toList())
                .wishlist(childWishlistRewardRepository
                        .findAllByChildIdAndAddedToParentCatalogueFalseOrderByCreatedAtDesc(child.getId())
                        .stream()
                        .map(this::mapWishlistReward)
                        .toList())
                .notifications(unseenNotifications.stream().map(this::mapNotification).toList())
                .build();

        if (!unseenNotifications.isEmpty()) {
            unseenNotifications.forEach(notification -> notification.setSeen(true));
            childNotificationRepository.saveAll(unseenNotifications);
        }

        return response;
    }

    public ChildDailyBonusResponse claimDailyBonus(String username) {
        return childDailyBonusService.claimDailyBonus(username);
    }

    public ChildWishlistRewardResponse createWishlistReward(String username, ChildWishlistRewardRequest request) {
        User child = getChild(username);

        String title = request.getTitle() == null ? "" : request.getTitle().trim();
        if (title.isEmpty()) {
            throw new BusinessException("Title is required");
        }

        RewardType type = request.getType() == null ? RewardType.DEFAULT : request.getType();

        ChildWishlistReward reward = ChildWishlistReward.builder()
                .child(child)
                .title(title)
                .type(type)
                .createdAt(LocalDateTime.now())
                .build();

        return mapWishlistReward(childWishlistRewardRepository.save(reward));
    }

    @Transactional
    public ChildAssignedRewardResponse buyReward(String username, Long rewardId) {
        User child = getChild(username);
        LocalDate today = LocalDate.now();
        parentAssignedRewardStatusService.syncExpiredRewards();

        ParentAssignedReward reward = parentAssignedRewardRepository.findByIdAndChildId(rewardId, child.getId())
                .orElseThrow(() -> new BusinessException("Reward not found"));

        if (reward.isClaimed()) {
            throw new BusinessException("This reward was already purchased");
        }

        if (reward.isExpired() || reward.getEndDate().isBefore(today)) {
            throw new BusinessException("This reward is no longer available");
        }

        if (reward.getStartDate().isAfter(today)) {
            throw new BusinessException("This reward is not active yet");
        }

        if (child.getRewardPoints() < reward.getPrice()) {
            throw new BusinessException("You do not have enough reward points for this reward");
        }

        child.setRewardPoints(child.getRewardPoints() - reward.getPrice());
        userRepository.save(child);

        reward.setClaimed(true);
        reward.setClaimedAt(LocalDateTime.now());

        return mapReward(parentAssignedRewardRepository.save(reward));
    }

    public ChildAssignedTaskResponse updateTaskValidationRequest(
            String username,
            Long taskId,
            ChildTaskValidationRequest request
    ) {
        User child = getChild(username);
        parentAssignedTaskStatusService.syncExpiredTasks();

        ParentAssignedTask task = parentAssignedTaskRepository.findByIdAndChildId(taskId, child.getId())
                .orElseThrow(() -> new BusinessException("Task not found"));

        if (task.isReviewed()) {
            throw new BusinessException("Reviewed tasks can no longer be updated");
        }

        if (task.isExpired()) {
            throw new BusinessException("Expired tasks can no longer be updated");
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
                .granted(reward.isGranted())
                .grantedAt(reward.getGrantedAt() == null ? null : reward.getGrantedAt().toString())
                .build();
    }

    private ChildWishlistRewardResponse mapWishlistReward(ChildWishlistReward reward) {
        return ChildWishlistRewardResponse.builder()
                .id(reward.getId())
                .title(reward.getTitle())
                .type(reward.getType().getValue())
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
