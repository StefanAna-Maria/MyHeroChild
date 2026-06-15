package com.myherochild.backend.admin;

import com.myherochild.backend.admin.dto.AdminAnalyticsResponse;
import com.myherochild.backend.admin.dto.AdminMonthlyActivityPointResponse;
import com.myherochild.backend.admin.dto.AdminOverviewMetricsResponse;
import com.myherochild.backend.admin.dto.AdminWeeklyEngagementPointResponse;
import com.myherochild.backend.child.ChildWishlistReward;
import com.myherochild.backend.child.ChildWishlistRewardRepository;
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

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class AdminAnalyticsService {

    private final UserRepository userRepository;
    private final ParentAssignedTaskRepository parentAssignedTaskRepository;
    private final ParentAssignedRewardRepository parentAssignedRewardRepository;
    private final ChildWishlistRewardRepository childWishlistRewardRepository;

    public AdminAnalyticsResponse getAnalytics(String username) {
        User admin = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("User not found"));

        if (admin.getRole() != UserRole.ADMIN) {
            throw new BusinessException("Only admins can access platform analytics");
        }

        List<User> allUsers = userRepository.findAll();
        List<User> parents = userRepository.findAllByRole(UserRole.PARENT);
        List<ParentAssignedTask> tasks = parentAssignedTaskRepository.findAll();
        List<ParentAssignedReward> rewards = parentAssignedRewardRepository.findAll();
        List<ChildWishlistReward> wishlistRewards = childWishlistRewardRepository.findAll();

        AdminOverviewMetricsResponse overview = buildOverview(allUsers, parents, tasks, rewards);

        return AdminAnalyticsResponse.builder()
                .overview(overview)
                .activeFamiliesByMonth(buildActiveFamiliesByMonth(tasks, rewards, wishlistRewards))
                .completedTasksVsClaimedRewards(buildWeeklyCompletedVsClaimed(tasks, rewards))
                .build();
    }

    private AdminOverviewMetricsResponse buildOverview(
            List<User> allUsers,
            List<User> parents,
            List<ParentAssignedTask> tasks,
            List<ParentAssignedReward> rewards
    ) {
        LocalDate today = LocalDate.now();
        LocalDate currentWeekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate nextWeekStart = currentWeekStart.plusWeeks(1);
        LocalDate previousWeekStart = currentWeekStart.minusWeeks(1);

        long completedTasksThisWeek = tasks.stream()
                .map(this::resolveTaskCompletionTimestamp)
                .filter(timestamp -> isWithinDateRange(timestamp, currentWeekStart, nextWeekStart))
                .count();

        long distributedTasksThisWeek = tasks.stream()
                .map(ParentAssignedTask::getCreatedAt)
                .filter(timestamp -> isWithinDateRange(timestamp, currentWeekStart, nextWeekStart))
                .count();

        long currentWeekRegistrations = allUsers.stream()
                .map(User::getCreatedAt)
                .filter(timestamp -> isWithinDateRange(timestamp, currentWeekStart, nextWeekStart))
                .count();

        long previousWeekRegistrations = allUsers.stream()
                .map(User::getCreatedAt)
                .filter(timestamp -> isWithinDateRange(timestamp, previousWeekStart, currentWeekStart))
                .count();

        double averageSavedPackagesPerParent = parents.isEmpty()
                ? 0
                : parents.stream()
                .mapToInt(parent -> parent.getCatalogPackages() == null ? 0 : parent.getCatalogPackages().size())
                .average()
                .orElse(0);

        long totalTasksCompleted = tasks.stream()
                .filter(task -> resolveTaskCompletionTimestamp(task) != null)
                .count();

        return AdminOverviewMetricsResponse.builder()
                .totalRegisteredUsers(allUsers.size())
                .totalTasksDistributed(tasks.size())
                .averageSavedPackagesPerParent(roundToSingleDecimal(averageSavedPackagesPerParent))
                .totalRewardsClaimed(rewards.stream().filter(ParentAssignedReward::isClaimed).count())
                .totalTasksCompleted(totalTasksCompleted)
                .weeklyTaskCompletionRate(calculatePercentage(completedTasksThisWeek, distributedTasksThisWeek))
                .weeklyUserGrowthPercentage(calculateGrowthPercentage(currentWeekRegistrations, previousWeekRegistrations))
                .build();
    }

    private List<AdminMonthlyActivityPointResponse> buildActiveFamiliesByMonth(
            List<ParentAssignedTask> tasks,
            List<ParentAssignedReward> rewards,
            List<ChildWishlistReward> wishlistRewards
    ) {
        YearMonth firstMonth = YearMonth.now().minusMonths(5);
        Map<YearMonth, Set<Long>> parentActivityByMonth = new HashMap<>();
        Map<YearMonth, Set<Long>> childActivityByMonth = new HashMap<>();

        tasks.forEach(task -> {
            addActivity(parentActivityByMonth, task.getParent().getId(), task.getCreatedAt(), firstMonth);
            addActivity(childActivityByMonth, task.getParent().getId(), resolveTaskCompletionTimestamp(task), firstMonth);
        });

        rewards.forEach(reward -> {
            addActivity(parentActivityByMonth, reward.getParent().getId(), reward.getCreatedAt(), firstMonth);
            addActivity(childActivityByMonth, reward.getParent().getId(), reward.getClaimedAt(), firstMonth);
        });

        wishlistRewards.forEach(reward -> {
            if (reward.getChild() != null && reward.getChild().getParent() != null) {
                addActivity(
                        childActivityByMonth,
                        reward.getChild().getParent().getId(),
                        reward.getCreatedAt(),
                        firstMonth
                );
            }
        });

        return IntStream.rangeClosed(0, 5)
                .mapToObj(offset -> firstMonth.plusMonths(offset))
                .map(month -> {
                    Set<Long> parentIds = new LinkedHashSet<>(parentActivityByMonth.getOrDefault(month, Set.of()));
                    parentIds.retainAll(childActivityByMonth.getOrDefault(month, Set.of()));

                    return AdminMonthlyActivityPointResponse.builder()
                            .label(formatMonthLabel(month))
                            .activeFamilies(parentIds.size())
                            .build();
                })
                .toList();
    }

    private List<AdminWeeklyEngagementPointResponse> buildWeeklyCompletedVsClaimed(
            List<ParentAssignedTask> tasks,
            List<ParentAssignedReward> rewards
    ) {
        LocalDate today = LocalDate.now();
        LocalDate firstDay = today.minusDays(6);

        return IntStream.rangeClosed(0, 6)
                .mapToObj(offset -> firstDay.plusDays(offset))
                .map(day -> AdminWeeklyEngagementPointResponse.builder()
                        .label(day.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                        .completedTasks(tasks.stream()
                                .map(this::resolveTaskCompletionTimestamp)
                                .filter(timestamp -> timestamp != null && timestamp.toLocalDate().isEqual(day))
                                .count())
                        .claimedRewards(rewards.stream()
                                .map(ParentAssignedReward::getClaimedAt)
                                .filter(timestamp -> timestamp != null && timestamp.toLocalDate().isEqual(day))
                                .count())
                        .build())
                .toList();
    }

    private void addActivity(
            Map<YearMonth, Set<Long>> activityMap,
            Long parentId,
            LocalDateTime timestamp,
            YearMonth firstMonth
    ) {
        if (parentId == null || timestamp == null) {
            return;
        }

        YearMonth month = YearMonth.from(timestamp);
        if (month.isBefore(firstMonth)) {
            return;
        }

        activityMap.computeIfAbsent(month, ignored -> new HashSet<>()).add(parentId);
    }

    private LocalDateTime resolveTaskCompletionTimestamp(ParentAssignedTask task) {
        if (task.getCompletionRequestedAt() != null) {
            return task.getCompletionRequestedAt();
        }

        if (task.isReviewed()) {
            return task.getReviewedAt();
        }

        return null;
    }

    private boolean isWithinDateRange(LocalDateTime timestamp, LocalDate startInclusive, LocalDate endExclusive) {
        if (timestamp == null) {
            return false;
        }

        LocalDate day = timestamp.toLocalDate();
        return !day.isBefore(startInclusive) && day.isBefore(endExclusive);
    }

    private double calculatePercentage(long numerator, long denominator) {
        if (denominator <= 0) {
            return 0;
        }

        return roundToSingleDecimal((numerator * 100.0) / denominator);
    }

    private double calculateGrowthPercentage(long currentValue, long previousValue) {
        if (previousValue <= 0) {
            return currentValue > 0 ? 100 : 0;
        }

        return roundToSingleDecimal(((currentValue - previousValue) * 100.0) / previousValue);
    }

    private double roundToSingleDecimal(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private String formatMonthLabel(YearMonth month) {
        return month.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
    }
}
