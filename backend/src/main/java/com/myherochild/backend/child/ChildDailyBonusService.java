package com.myherochild.backend.child;

import com.myherochild.backend.child.dto.ChildDailyBonusResponse;
import com.myherochild.backend.common.exception.BusinessException;
import com.myherochild.backend.parent.ParentAssignedTask;
import com.myherochild.backend.parent.ParentAssignedTaskRepository;
import com.myherochild.backend.user.User;
import com.myherochild.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ChildDailyBonusService {

    public static final int STANDARD_BONUS_REWARD_POINTS = 100;

    private final ChildDailyBonusStateRepository childDailyBonusStateRepository;
    private final ParentAssignedTaskRepository parentAssignedTaskRepository;
    private final ChildNotificationRepository childNotificationRepository;
    private final UserRepository userRepository;

    public ChildDailyBonusResponse getDailyBonus(User child) {
        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();
        ChildDailyBonusState state = getOrPrepareState(child, today, now);

        long totalTasks = parentAssignedTaskRepository
                .countByChildIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        child.getId(),
                        today,
                        today
                );

        long approvedTasks = parentAssignedTaskRepository
                .countByChildIdAndReviewedTrueAndApprovedTrueAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        child.getId(),
                        today,
                        today
                );

        boolean restricted = state.getRestrictedUntil() != null && state.getRestrictedUntil().isAfter(now);
        boolean claimable = !restricted && !state.isClaimed() && totalTasks > 0 && approvedTasks == totalTasks;

        return ChildDailyBonusResponse.builder()
                .rewardPoints(STANDARD_BONUS_REWARD_POINTS)
                .totalTasks((int) totalTasks)
                .approvedTasks((int) approvedTasks)
                .progress(totalTasks == 0 ? 0 : (double) approvedTasks / (double) totalTasks)
                .claimable(claimable)
                .claimed(state.isClaimed())
                .restricted(restricted)
                .restrictedUntil(restricted ? state.getRestrictedUntil().toString() : null)
                .build();
    }

    public ChildDailyBonusResponse claimDailyBonus(String username) {
        User child = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("User not found"));

        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();
        ChildDailyBonusState state = getOrPrepareState(child, today, now);
        ChildDailyBonusResponse status = getDailyBonus(child);

        if (status.isClaimed()) {
            throw new BusinessException("Today's bonus was already claimed");
        }

        if (status.isRestricted()) {
            throw new BusinessException("Today's bonus is unavailable right now");
        }

        if (!status.isClaimable()) {
            throw new BusinessException("Complete and validate all today's tasks before claiming the bonus");
        }

        child.setRewardPoints(child.getRewardPoints() + STANDARD_BONUS_REWARD_POINTS);
        userRepository.save(child);

        state.setClaimed(true);
        state.setClaimedAt(now);
        childDailyBonusStateRepository.save(state);

        createNotification(
                child,
                "DAILY_BONUS_CLAIMED",
                "Daily bonus claimed",
                "Congratulations! You claimed your daily bonus and earned "
                        + STANDARD_BONUS_REWARD_POINTS + " reward points."
        );

        return getDailyBonus(child);
    }

    public void handleApprovedTask(ParentAssignedTask task) {
        if (!isTodayTask(task, LocalDate.now())) {
            return;
        }

        getOrPrepareState(task.getChild(), LocalDate.now(), LocalDateTime.now());
    }

    public void handleRejectedTask(ParentAssignedTask task) {
        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        if (!isTodayTask(task, today)) {
            return;
        }

        ChildDailyBonusState state = getOrPrepareState(task.getChild(), today, now);

        if (state.getRestrictionNotifiedForDate() != null && state.getRestrictionNotifiedForDate().isEqual(today)) {
            return;
        }

        state.setRestrictedUntil(today.plusDays(1).atStartOfDay());
        state.setRestrictionNotifiedForDate(today);
        childDailyBonusStateRepository.save(state);

        createNotification(
                task.getChild(),
                "DAILY_BONUS_RESTRICTED",
                "Daily bonus unavailable",
                "One of today's tasks was not approved, so today's bonus is no longer available."
        );
    }

    private ChildDailyBonusState getOrPrepareState(User child, LocalDate today, LocalDateTime now) {
        ChildDailyBonusState state = childDailyBonusStateRepository.findByChildId(child.getId())
                .orElseGet(() -> ChildDailyBonusState.builder()
                        .child(child)
                        .bonusDate(today)
                        .build());

        boolean changed = false;

        if (!today.equals(state.getBonusDate())) {
            state.setBonusDate(today);
            state.setClaimed(false);
            state.setClaimedAt(null);
            state.setRestrictionNotifiedForDate(null);
            state.setRestrictedUntil(null);
            changed = true;
        }

        if (state.getRestrictedUntil() != null && !state.getRestrictedUntil().isAfter(now)) {
            state.setRestrictedUntil(null);
            changed = true;
        }

        if (changed || state.getId() == null) {
            state = childDailyBonusStateRepository.save(state);
        }

        return state;
    }

    private boolean isTodayTask(ParentAssignedTask task, LocalDate today) {
        return !today.isBefore(task.getStartDate()) && !today.isAfter(task.getEndDate());
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
}
