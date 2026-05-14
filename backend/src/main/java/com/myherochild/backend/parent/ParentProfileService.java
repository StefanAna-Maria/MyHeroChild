package com.myherochild.backend.parent;

import com.myherochild.backend.common.exception.BusinessException;
import com.myherochild.backend.level.LevelProgress;
import com.myherochild.backend.level.UserLevelService;
import com.myherochild.backend.parent.dto.ClaimedRewardSummaryResponse;
import com.myherochild.backend.parent.dto.ParentChildSummaryResponse;
import com.myherochild.backend.parent.dto.ParentProfileResponse;
import com.myherochild.backend.security.JwtService;
import com.myherochild.backend.user.User;
import com.myherochild.backend.user.UserRepository;
import com.myherochild.backend.user.UserRole;
import com.myherochild.backend.user.dto.UpdateUserProfileRequest;
import com.myherochild.backend.user.dto.UpdateUserProfileResponse;
import com.myherochild.backend.user.dto.UserMeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ParentProfileService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final UserLevelService userLevelService;
    private final ParentAssignedTaskRepository parentAssignedTaskRepository;
    private final ParentAssignedRewardRepository parentAssignedRewardRepository;

    public ParentProfileResponse getProfile(String username) {
        User parent = getParent(username);
        java.time.LocalDate today = java.time.LocalDate.now();

        List<ParentChildSummaryResponse> children = userRepository
                .findAllByParentIdAndRoleOrderByUsernameAsc(parent.getId(), UserRole.CHILD)
                .stream()
                .map(userLevelService::syncLevel)
                .map(child -> ParentChildSummaryResponse.builder()
                        .id(child.getId())
                        .username(child.getUsername())
                        .avatar(child.getAvatar())
                        .level(child.getLevel())
                        .activeTasksCount((int) parentAssignedTaskRepository
                                .countByChildIdAndCompletedFalseAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                                        child.getId(),
                                        today,
                                        today
                                ))
                        .availableRewardsCount((int) parentAssignedRewardRepository
                                .countByChildIdAndClaimedFalseAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                                        child.getId(),
                                        today,
                                        today
                                ))
                        .build())
                .toList();

        List<ClaimedRewardSummaryResponse> claimedRewards = parentAssignedRewardRepository
                .findAllByParentIdAndClaimedTrueOrderByClaimedAtDesc(parent.getId())
                .stream()
                .map(reward -> ClaimedRewardSummaryResponse.builder()
                        .id(reward.getId())
                        .title(reward.getTitle())
                        .type(reward.getType())
                        .price(reward.getPrice())
                        .childName(reward.getChild().getUsername())
                        .childAvatar(reward.getChild().getAvatar())
                        .build())
                .toList();

        return ParentProfileResponse.builder()
                .username(parent.getUsername())
                .email(parent.getEmail())
                .avatar(parent.getAvatar())
                .children(children)
                .claimedRewards(claimedRewards)
                .build();
    }

    public UpdateUserProfileResponse updateProfile(String username, UpdateUserProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("User not found"));

        String nextUsername = request.getUsername() == null ? "" : request.getUsername().trim();
        String nextEmail = request.getEmail() == null ? "" : request.getEmail().trim();
        String nextAvatar = request.getAvatar() == null ? "" : request.getAvatar().trim();

        if (nextUsername.isEmpty()) {
            throw new BusinessException("Username is required");
        }

        if (nextEmail.isEmpty()) {
            throw new BusinessException("Email is required");
        }

        if (nextAvatar.isEmpty()) {
            throw new BusinessException("Avatar is required");
        }

        userRepository.findByUsername(nextUsername)
                .filter(existingUser -> !existingUser.getId().equals(user.getId()))
                .ifPresent(existingUser -> {
                    throw new BusinessException("Username already exists");
                });

        userRepository.findByEmail(nextEmail)
                .filter(existingUser -> !existingUser.getId().equals(user.getId()))
                .ifPresent(existingUser -> {
                    throw new BusinessException("Email address already in use");
                });

        user.setUsername(nextUsername);
        user.setEmail(nextEmail);
        user.setAvatar(nextAvatar);

        User savedUser = userRepository.save(user);
        String refreshedToken = jwtService.generateToken(savedUser.getUsername(), savedUser.getRole().name());

        return UpdateUserProfileResponse.builder()
                .user(mapUserMeResponse(savedUser))
                .token(refreshedToken)
                .build();
    }

    private User getParent(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("User not found"));

        if (user.getRole() != UserRole.PARENT) {
            throw new BusinessException("Only parents can access this profile");
        }

        return user;
    }

    private UserMeResponse mapUserMeResponse(User user) {
        User syncedUser = userLevelService.syncLevel(user);
        LevelProgress progress = userLevelService.resolveProgress(syncedUser.getXp());

        return UserMeResponse.builder()
                .username(syncedUser.getUsername())
                .email(syncedUser.getEmail())
                .role(syncedUser.getRole())
                .level(syncedUser.getLevel())
                .xp(syncedUser.getXp())
                .currentLevelMinTotalXp(progress.getCurrentLevelMinTotalXp())
                .nextLevelMinTotalXp(progress.getNextLevelMinTotalXp())
                .rewardPoints(syncedUser.getRewardPoints())
                .avatar(syncedUser.getAvatar())
                .build();
    }
}
