package com.myherochild.backend.user;

import com.myherochild.backend.common.dto.ApiResponse;
import com.myherochild.backend.level.LevelProgress;
import com.myherochild.backend.level.UserLevelService;
import com.myherochild.backend.parent.ParentProfileService;
import com.myherochild.backend.user.dto.UpdateUserProfileRequest;
import com.myherochild.backend.user.dto.UpdateUserProfileResponse;
import com.myherochild.backend.user.dto.UserMeResponse;
import com.myherochild.backend.user.dto.UserPointsHistoryEntryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;
    private final ParentProfileService parentProfileService;
    private final UserLevelService userLevelService;
    private final UserAvatarService userAvatarService;
    private final UserPointsHistoryService userPointsHistoryService;

    // GET CURRENT USER (folosit de frontend pentru header)
    @GetMapping("/me")
    public ApiResponse<UserMeResponse> getCurrentUser(Authentication authentication) {

        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        User syncedUser = userLevelService.syncLevel(user);
        LevelProgress progress = userLevelService.resolveProgress(syncedUser.getXp());

        UserMeResponse response = buildUserMeResponse(syncedUser, progress);

        return ApiResponse.success("User fetched successfully", response);
    }

    @PutMapping("/me")
    public ApiResponse<UpdateUserProfileResponse> updateCurrentUser(
            Authentication authentication,
            @RequestBody UpdateUserProfileRequest request
    ) {
        UpdateUserProfileResponse response = parentProfileService.updateProfile(authentication.getName(), request);
        return ApiResponse.success("Profile updated successfully", response);
    }

    // UPDATE AVATAR (folosit de AvatarPicker)
    @PatchMapping("/me/avatar")
    public ApiResponse<String> updateAvatar(
            Authentication authentication,
            @RequestBody Map<String, String> body
    ) {

        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String avatar = body.get("avatar");

        userAvatarService.validateSelectableOrCurrent(user, avatar);

        user.setAvatar(avatar);
        userRepository.save(user);

        return ApiResponse.success("Avatar updated successfully", null);
    }

    @PostMapping("/me/avatars/{avatarKey}/claim")
    public ApiResponse<UserMeResponse> claimAvatar(
            Authentication authentication,
            @PathVariable String avatarKey
    ) {
        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        User syncedUser = userLevelService.syncLevel(user);
        userAvatarService.claimAvatar(syncedUser, avatarKey);

        User refreshedUser = userRepository.findById(syncedUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        LevelProgress progress = userLevelService.resolveProgress(refreshedUser.getXp());

        return ApiResponse.success(
                "Avatar claimed successfully",
                buildUserMeResponse(refreshedUser, progress)
        );
    }

    @GetMapping("/me/points-history")
    public ApiResponse<List<UserPointsHistoryEntryResponse>> getCurrentUserPointsHistory(
            Authentication authentication
    ) {
        return ApiResponse.success(
                "Points history fetched successfully",
                userPointsHistoryService.getCurrentUserHistory(authentication.getName())
        );
    }

    private UserMeResponse buildUserMeResponse(User user, LevelProgress progress) {
        return UserMeResponse.builder()
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .level(user.getLevel())
                .xp(user.getXp())
                .currentLevelMinTotalXp(progress.getCurrentLevelMinTotalXp())
                .nextLevelMinTotalXp(progress.getNextLevelMinTotalXp())
                .rewardPoints(user.getRewardPoints())
                .avatar(user.getAvatar())
                .avatarOptions(userAvatarService.getAvatarOptions(user))
                .build();
    }
}
