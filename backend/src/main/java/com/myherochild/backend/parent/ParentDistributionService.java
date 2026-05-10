package com.myherochild.backend.parent;

import com.myherochild.backend.common.exception.BusinessException;
import com.myherochild.backend.packages.Package;
import com.myherochild.backend.packages.Reward;
import com.myherochild.backend.packages.RewardRepository;
import com.myherochild.backend.packages.Task;
import com.myherochild.backend.packages.TaskRepository;
import com.myherochild.backend.parent.dto.*;
import com.myherochild.backend.user.User;
import com.myherochild.backend.user.UserRepository;
import com.myherochild.backend.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ParentDistributionService {

    private final UserRepository userRepository;
    private final ParentCustomTaskRepository parentCustomTaskRepository;
    private final ParentCustomRewardRepository parentCustomRewardRepository;
    private final ParentAssignedTaskRepository parentAssignedTaskRepository;
    private final ParentAssignedRewardRepository parentAssignedRewardRepository;
    private final TaskRepository taskRepository;
    private final RewardRepository rewardRepository;

    public List<ParentDistributionChildResponse> getChildren(String username, boolean onlyToday) {
        User parent = getParent(username);
        LocalDate today = LocalDate.now();

        return userRepository.findAllByParentIdAndRoleOrderByUsernameAsc(parent.getId(), UserRole.CHILD)
                .stream()
                .map(child -> ParentDistributionChildResponse.builder()
                        .id(child.getId())
                        .username(child.getUsername())
                        .avatar(child.getAvatar())
                        .level(child.getLevel())
                        .assignedTasksCount(getAssignedTasksCount(child.getId(), today, onlyToday))
                        .availableRewardsCount(getAssignedRewardsCount(child.getId(), today, onlyToday))
                        .build())
                .toList();
    }

    public List<ParentAssignedTaskDetailResponse> getAssignedTasks(String username, Long childId) {
        User parent = getParent(username);
        User child = getChild(parent, childId);

        return parentAssignedTaskRepository.findAllByChildIdAndCompletedFalseOrderByStartDateAscEndDateAscTitleAsc(
                        child.getId())
                .stream()
                .map(task -> ParentAssignedTaskDetailResponse.builder()
                        .id(task.getId())
                        .title(task.getTitle())
                        .xp(task.getXp())
                        .rewardPoints(task.getRewardPoints())
                        .type(task.getType())
                        .startDate(task.getStartDate())
                        .endDate(task.getEndDate())
                        .build())
                .toList();
    }

    public List<ParentAssignedRewardDetailResponse> getAssignedRewards(String username, Long childId) {
        User parent = getParent(username);
        User child = getChild(parent, childId);

        return parentAssignedRewardRepository
                .findAllByChildIdAndClaimedFalseOrderByStartDateAscEndDateAscTitleAsc(child.getId())
                .stream()
                .map(reward -> ParentAssignedRewardDetailResponse.builder()
                        .id(reward.getId())
                        .title(reward.getTitle())
                        .price(reward.getPrice())
                        .type(reward.getType())
                        .startDate(reward.getStartDate())
                        .endDate(reward.getEndDate())
                        .build())
                .toList();
    }

    public ParentDistributionChildResponse assignTasks(
            String username,
            Long childId,
            ParentTaskAssignmentRequest request
    ) {
        User parent = getParentWithCatalogue(username);
        User child = getChild(parent, childId);
        List<ParentTaskSelectionRequest> selections = request == null ? null : request.getSelections();

        if (selections == null || selections.isEmpty()) {
            throw new BusinessException("Select at least one task");
        }

        Set<Long> accessiblePackageIds = parent.getCatalogPackages().stream()
                .map(Package::getId)
                .collect(Collectors.toSet());

        List<ParentAssignedTask> assignedTasks = selections.stream()
                .map(selection -> mapAssignedTask(parent, child, selection, accessiblePackageIds))
                .toList();

        parentAssignedTaskRepository.saveAll(assignedTasks);
        return getChildSummary(child, true);
    }

    public ParentDistributionChildResponse assignRewards(
            String username,
            Long childId,
            ParentRewardAssignmentRequest request
    ) {
        User parent = getParentWithCatalogue(username);
        User child = getChild(parent, childId);
        List<ParentRewardSelectionRequest> selections = request == null ? null : request.getSelections();

        if (selections == null || selections.isEmpty()) {
            throw new BusinessException("Select at least one reward");
        }

        Set<Long> accessiblePackageIds = parent.getCatalogPackages().stream()
                .map(Package::getId)
                .collect(Collectors.toSet());

        List<ParentAssignedReward> assignedRewards = selections.stream()
                .map(selection -> mapAssignedReward(parent, child, selection, accessiblePackageIds))
                .toList();

        parentAssignedRewardRepository.saveAll(assignedRewards);
        return getChildSummary(child, true);
    }

    private ParentAssignedTask mapAssignedTask(
            User parent,
            User child,
            ParentTaskSelectionRequest selection,
            Set<Long> accessiblePackageIds
    ) {
        validateSelection(selection == null ? null : selection.getStartDate(), selection == null ? null : selection.getEndDate());

        if (selection == null || selection.getSourceId() == null) {
            throw new BusinessException("Each task selection must have a source");
        }

        String sourceType = normalizeSourceType(selection.getSourceType());
        LocalDateTime now = LocalDateTime.now();

        if ("CUSTOM_TASK".equals(sourceType)) {
            ParentCustomTask task = parentCustomTaskRepository
                    .findByIdAndParentId(selection.getSourceId(), parent.getId())
                    .orElseThrow(() -> new BusinessException("Custom task not found"));

            return ParentAssignedTask.builder()
                    .parent(parent)
                    .child(child)
                    .title(task.getTitle())
                    .xp(task.getXp())
                    .rewardPoints(task.getRewardPoints())
                    .type(task.getType())
                    .startDate(selection.getStartDate())
                    .endDate(selection.getEndDate())
                    .sourceKind(sourceType)
                    .sourceId(task.getId())
                    .createdAt(now)
                    .build();
        }

        if ("PACKAGE_TASK".equals(sourceType)) {
            Task task = taskRepository.findById(selection.getSourceId())
                    .orElseThrow(() -> new BusinessException("Package task not found"));

            if (task.getPkg() == null || !accessiblePackageIds.contains(task.getPkg().getId())) {
                throw new BusinessException("This package task is not available in the parent's catalogue");
            }

            return ParentAssignedTask.builder()
                    .parent(parent)
                    .child(child)
                    .title(task.getTitle())
                    .xp(task.getXp())
                    .rewardPoints(task.getRewardPoints())
                    .type(task.getType())
                    .startDate(selection.getStartDate())
                    .endDate(selection.getEndDate())
                    .sourceKind(sourceType)
                    .sourceId(task.getId())
                    .createdAt(now)
                    .build();
        }

        throw new BusinessException("Unsupported task source type");
    }

    private ParentAssignedReward mapAssignedReward(
            User parent,
            User child,
            ParentRewardSelectionRequest selection,
            Set<Long> accessiblePackageIds
    ) {
        validateSelection(selection == null ? null : selection.getStartDate(), selection == null ? null : selection.getEndDate());

        if (selection == null || selection.getSourceId() == null) {
            throw new BusinessException("Each reward selection must have a source");
        }

        String sourceType = normalizeSourceType(selection.getSourceType());
        LocalDateTime now = LocalDateTime.now();

        if ("CUSTOM_REWARD".equals(sourceType)) {
            ParentCustomReward reward = parentCustomRewardRepository
                    .findByIdAndParentId(selection.getSourceId(), parent.getId())
                    .orElseThrow(() -> new BusinessException("Custom reward not found"));

            return ParentAssignedReward.builder()
                    .parent(parent)
                    .child(child)
                    .title(reward.getTitle())
                    .price(reward.getPrice())
                    .type(reward.getType())
                    .startDate(selection.getStartDate())
                    .endDate(selection.getEndDate())
                    .sourceKind(sourceType)
                    .sourceId(reward.getId())
                    .createdAt(now)
                    .build();
        }

        if ("PACKAGE_REWARD".equals(sourceType)) {
            Reward reward = rewardRepository.findById(selection.getSourceId())
                    .orElseThrow(() -> new BusinessException("Package reward not found"));

            if (reward.getPkg() == null || !accessiblePackageIds.contains(reward.getPkg().getId())) {
                throw new BusinessException("This package reward is not available in the parent's catalogue");
            }

            return ParentAssignedReward.builder()
                    .parent(parent)
                    .child(child)
                    .title(reward.getTitle())
                    .price(reward.getPrice())
                    .type(reward.getType())
                    .startDate(selection.getStartDate())
                    .endDate(selection.getEndDate())
                    .sourceKind(sourceType)
                    .sourceId(reward.getId())
                    .createdAt(now)
                    .build();
        }

        throw new BusinessException("Unsupported reward source type");
    }

    private ParentDistributionChildResponse getChildSummary(User child, boolean onlyToday) {
        LocalDate today = LocalDate.now();

        return ParentDistributionChildResponse.builder()
                .id(child.getId())
                .username(child.getUsername())
                .avatar(child.getAvatar())
                .level(child.getLevel())
                .assignedTasksCount(getAssignedTasksCount(child.getId(), today, onlyToday))
                .availableRewardsCount(getAssignedRewardsCount(child.getId(), today, onlyToday))
                .build();
    }

    private long getAssignedTasksCount(Long childId, LocalDate today, boolean onlyToday) {
        if (onlyToday) {
            return parentAssignedTaskRepository
                    .countByChildIdAndCompletedFalseAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                            childId,
                            today,
                            today
                    );
        }

        return parentAssignedTaskRepository.countByChildIdAndCompletedFalse(childId);
    }

    private long getAssignedRewardsCount(Long childId, LocalDate today, boolean onlyToday) {
        if (onlyToday) {
            return parentAssignedRewardRepository
                    .countByChildIdAndClaimedFalseAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                            childId,
                            today,
                            today
                    );
        }

        return parentAssignedRewardRepository.countByChildIdAndClaimedFalse(childId);
    }

    private void validateSelection(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new BusinessException("Each selected item must have a start and end date");
        }

        if (endDate.isBefore(startDate)) {
            throw new BusinessException("End date must be after or equal to the start date");
        }
    }

    private String normalizeSourceType(String sourceType) {
        if (sourceType == null || sourceType.trim().isEmpty()) {
            throw new BusinessException("Source type is required");
        }

        return sourceType.trim().toUpperCase();
    }

    private User getParent(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("User not found"));

        if (user.getRole() != UserRole.PARENT) {
            throw new BusinessException("Only parents can manage distributions");
        }

        return user;
    }

    private User getParentWithCatalogue(String username) {
        User user = userRepository.findWithCatalogPackagesByUsername(username)
                .orElseThrow(() -> new BusinessException("User not found"));

        if (user.getRole() != UserRole.PARENT) {
            throw new BusinessException("Only parents can manage distributions");
        }

        return user;
    }

    private User getChild(User parent, Long childId) {
        User child = userRepository.findById(childId)
                .orElseThrow(() -> new BusinessException("Child not found"));

        if (child.getRole() != UserRole.CHILD || child.getParent() == null ||
                !child.getParent().getId().equals(parent.getId())) {
            throw new BusinessException("The selected child does not belong to this parent");
        }

        return child;
    }
}
