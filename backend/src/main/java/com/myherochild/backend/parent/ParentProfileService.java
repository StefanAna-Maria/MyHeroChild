package com.myherochild.backend.parent;

import com.myherochild.backend.child.ChildNotification;
import com.myherochild.backend.child.ChildNotificationRepository;
import com.myherochild.backend.child.ChildWishlistReward;
import com.myherochild.backend.child.ChildWishlistRewardRepository;
import com.myherochild.backend.child.dto.ChildWishlistRewardResponse;
import com.myherochild.backend.common.exception.BusinessException;
import com.myherochild.backend.common.model.RewardType;
import com.myherochild.backend.parent.dto.ParentChildWishlistResponse;
import com.myherochild.backend.level.LevelProgress;
import com.myherochild.backend.level.UserLevelService;
import com.myherochild.backend.parent.dto.ClaimedRewardSummaryResponse;
import com.myherochild.backend.parent.dto.ParentChildActivityPointResponse;
import com.myherochild.backend.parent.dto.ParentChildDetailResponse;
import com.myherochild.backend.parent.dto.ParentChildSummaryResponse;
import com.myherochild.backend.parent.dto.ParentProfileResponse;
import com.myherochild.backend.parent.dto.ParentWishlistRewardToCatalogueRequest;
import com.myherochild.backend.security.JwtService;
import com.myherochild.backend.user.UserAvatarService;
import com.myherochild.backend.user.User;
import com.myherochild.backend.user.UserRepository;
import com.myherochild.backend.user.UserRole;
import com.myherochild.backend.user.dto.UpdateUserProfileRequest;
import com.myherochild.backend.user.dto.UpdateUserProfileResponse;
import com.myherochild.backend.user.dto.UserMeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ParentProfileService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final UserLevelService userLevelService;
    private final ParentAssignedTaskRepository parentAssignedTaskRepository;
    private final ParentAssignedRewardRepository parentAssignedRewardRepository;
    private final ParentAssignedTaskStatusService parentAssignedTaskStatusService;
    private final ParentAssignedRewardStatusService parentAssignedRewardStatusService;
    private final ChildNotificationRepository childNotificationRepository;
    private final ChildWishlistRewardRepository childWishlistRewardRepository;
    private final ParentCustomRewardRepository parentCustomRewardRepository;
    private final UserAvatarService userAvatarService;

    public ParentProfileResponse getProfile(String username) {
        User parent = getParent(username);
        java.time.LocalDate today = java.time.LocalDate.now();
        parentAssignedTaskStatusService.syncExpiredTasks();
        parentAssignedRewardStatusService.syncExpiredRewards();

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
                                .countByChildIdAndReviewedFalseAndExpiredFalseAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                                        child.getId(),
                                        today,
                                        today
                                ))
                        .availableRewardsCount((int) parentAssignedRewardRepository
                                .countByChildIdAndClaimedFalseAndExpiredFalseAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                                        child.getId(),
                                        today,
                                        today
                                ))
                        .wishlistCount((int) childWishlistRewardRepository
                                .countByChildIdAndAddedToParentCatalogueFalse(child.getId()))
                        .build())
                .toList();

        List<ClaimedRewardSummaryResponse> claimedRewards = parentAssignedRewardRepository
                .findAllByParentIdAndClaimedTrueAndGrantedFalseOrderByClaimedAtDesc(parent.getId())
                .stream()
                .map(reward -> ClaimedRewardSummaryResponse.builder()
                        .id(reward.getId())
                        .title(reward.getTitle())
                        .type(reward.getType().getValue())
                        .price(reward.getPrice())
                        .childName(reward.getChild().getUsername())
                        .childAvatar(reward.getChild().getAvatar())
                        .claimedAt(reward.getClaimedAt() == null ? null : reward.getClaimedAt().toString())
                        .build())
                .toList();

        return ParentProfileResponse.builder()
                .username(parent.getUsername())
                .email(parent.getEmail())
                .avatar(parent.getAvatar())
                .parentCode(parent.getParentCode())
                .children(children)
                .claimedRewards(claimedRewards)
                .build();
    }

    public ParentChildWishlistResponse getChildWishlist(String username, Long childId) {
        User parent = getParent(username);
        User child = getChildOfParent(parent, childId);

        List<ChildWishlistRewardResponse> rewards = childWishlistRewardRepository
                .findAllByChildIdAndAddedToParentCatalogueFalseOrderByCreatedAtDesc(child.getId())
                .stream()
                .map(this::mapWishlistReward)
                .toList();

        return ParentChildWishlistResponse.builder()
                .childId(child.getId())
                .childName(child.getUsername())
                .childAvatar(child.getAvatar())
                .rewards(rewards)
                .build();
    }

    public ParentChildDetailResponse getChildDetail(String username, Long childId) {
        User parent = getParent(username);
        User child = getChildOfParent(parent, childId);
        java.time.LocalDate today = java.time.LocalDate.now();

        List<ParentAssignedTask> allTasks = parentAssignedTaskRepository.findAllByChildIdOrderByCreatedAtDesc(child.getId());
        List<ParentAssignedReward> allRewards = parentAssignedRewardRepository.findAllByChildIdOrderByCreatedAtDesc(child.getId());

        List<ParentChildActivityPointResponse> weeklyActivity = java.util.stream.IntStream.rangeClosed(0, 6)
                .mapToObj(offset -> today.minusDays(6L - offset))
                .map(day -> ParentChildActivityPointResponse.builder()
                        .label(day.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                        .approvedTasks((int) allTasks.stream()
                                .filter(task -> task.isReviewed() && Boolean.TRUE.equals(task.getApproved()))
                                .filter(task -> task.getReviewedAt() != null)
                                .filter(task -> task.getReviewedAt().toLocalDate().isEqual(day))
                                .count())
                        .grantedRewards((int) allRewards.stream()
                                .filter(ParentAssignedReward::isGranted)
                                .filter(reward -> reward.getGrantedAt() != null)
                                .filter(reward -> reward.getGrantedAt().toLocalDate().isEqual(day))
                                .count())
                        .build())
                .toList();

        return ParentChildDetailResponse.builder()
                .id(child.getId())
                .username(child.getUsername())
                .avatar(child.getAvatar())
                .level(child.getLevel())
                .activeTasksCount((int) parentAssignedTaskRepository
                        .countByChildIdAndReviewedFalseAndExpiredFalseAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                                child.getId(),
                                today,
                                today
                        ))
                .availableRewardsCount((int) parentAssignedRewardRepository
                        .countByChildIdAndClaimedFalseAndExpiredFalseAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                                child.getId(),
                                today,
                                today
                        ))
                .wishlistCount((int) childWishlistRewardRepository.countByChildIdAndAddedToParentCatalogueFalse(child.getId()))
                .completedTasksCount((int) allTasks.stream()
                        .filter(ParentAssignedTask::isReviewed)
                        .filter(task -> Boolean.TRUE.equals(task.getApproved()))
                        .count())
                .purchasedRewardsCount((int) allRewards.stream()
                        .filter(ParentAssignedReward::isClaimed)
                        .count())
                .grantedRewardsCount((int) allRewards.stream()
                        .filter(ParentAssignedReward::isGranted)
                        .count())
                .weeklyActivity(weeklyActivity)
                .build();
    }

    public void saveWishlistRewardToCatalogue(
            String username,
            Long childId,
            Long wishlistRewardId,
            ParentWishlistRewardToCatalogueRequest request
    ) {
        User parent = getParent(username);
        User child = getChildOfParent(parent, childId);

        int price = request.getPrice() == null ? -1 : request.getPrice();
        if (price < 0) {
            throw new BusinessException("Price must contain an integer number");
        }

        ChildWishlistReward wishlistReward = childWishlistRewardRepository
                .findByIdAndChildId(wishlistRewardId, child.getId())
                .orElseThrow(() -> new BusinessException("Wishlist reward not found"));

        if (wishlistReward.isAddedToParentCatalogue()) {
            throw new BusinessException("This wishlist reward was already added to the catalogue");
        }

        ParentCustomReward parentReward = ParentCustomReward.builder()
                .title(wishlistReward.getTitle())
                .type(request.getType() == null ? RewardType.DEFAULT : request.getType())
                .price(price)
                .parent(parent)
                .build();

        parentCustomRewardRepository.save(parentReward);

        wishlistReward.setAddedToParentCatalogue(true);
        wishlistReward.setAddedToParentCatalogueAt(LocalDateTime.now());
        childWishlistRewardRepository.save(wishlistReward);

        childNotificationRepository.save(
                ChildNotification.builder()
                        .child(child)
                        .type("WISHLIST_ACCEPTED")
                        .title("Wish added to catalogue")
                        .message("Your parent added \"" + wishlistReward.getTitle() + "\" to their catalogue.")
                        .createdAt(LocalDateTime.now())
                        .build()
        );
    }

    public void grantClaimedReward(String username, Long rewardId) {
        User parent = getParent(username);

        ParentAssignedReward reward = parentAssignedRewardRepository.findById(rewardId)
                .orElseThrow(() -> new BusinessException("Claimed reward not found"));

        if (!reward.getParent().getId().equals(parent.getId())) {
            throw new BusinessException("This reward does not belong to this parent");
        }

        if (!reward.isClaimed()) {
            throw new BusinessException("This reward has not been claimed yet");
        }

        if (reward.isGranted()) {
            throw new BusinessException("This reward was already marked as granted");
        }

        reward.setGranted(true);
        reward.setGrantedAt(LocalDateTime.now());
        parentAssignedRewardRepository.save(reward);

        childNotificationRepository.save(
                ChildNotification.builder()
                        .child(reward.getChild())
                        .type("REWARD_GRANTED")
                        .title("Reward granted")
                        .message("Your reward \"" + reward.getTitle() + "\" was offered by your parent.")
                        .createdAt(LocalDateTime.now())
                        .build()
        );
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

        userAvatarService.validateSelectableOrCurrent(user, nextAvatar);

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

    private User getChildOfParent(User parent, Long childId) {
        User child = userRepository.findById(childId)
                .orElseThrow(() -> new BusinessException("Child not found"));

        if (child.getRole() != UserRole.CHILD || child.getParent() == null || !child.getParent().getId().equals(parent.getId())) {
            throw new BusinessException("This child does not belong to the current parent");
        }

        return child;
    }

    private ChildWishlistRewardResponse mapWishlistReward(ChildWishlistReward reward) {
        return ChildWishlistRewardResponse.builder()
                .id(reward.getId())
                .title(reward.getTitle())
                .type(reward.getType().getValue())
                .build();
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
                .avatarOptions(userAvatarService.getAvatarOptions(syncedUser))
                .build();
    }
}
