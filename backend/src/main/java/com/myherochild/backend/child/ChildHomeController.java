package com.myherochild.backend.child;

import com.myherochild.backend.child.dto.ChildAssignedRewardResponse;
import com.myherochild.backend.child.dto.ChildAssignedTaskResponse;
import com.myherochild.backend.child.dto.ChildDailyBonusResponse;
import com.myherochild.backend.child.dto.ChildHomeResponse;
import com.myherochild.backend.child.dto.ChildProfileResponse;
import com.myherochild.backend.child.dto.ChildRewardsResponse;
import com.myherochild.backend.child.dto.ChildTaskValidationRequest;
import com.myherochild.backend.child.dto.ChildTasksResponse;
import com.myherochild.backend.child.dto.ChildWishlistRewardRequest;
import com.myherochild.backend.child.dto.ChildWishlistRewardResponse;
import com.myherochild.backend.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/child")
@RequiredArgsConstructor
public class ChildHomeController {

    private final ChildHomeService childHomeService;

    @GetMapping("/home")
    public ApiResponse<ChildHomeResponse> getHome(Authentication authentication) {
        ChildHomeResponse response = childHomeService.getHome(authentication.getName());
        return ApiResponse.success("Child home fetched successfully", response);
    }

    @GetMapping("/tasks")
    public ApiResponse<ChildTasksResponse> getTasks(Authentication authentication) {
        ChildTasksResponse response = childHomeService.getTasks(authentication.getName());
        return ApiResponse.success("Child tasks fetched successfully", response);
    }

    @GetMapping("/rewards")
    public ApiResponse<ChildRewardsResponse> getRewards(Authentication authentication) {
        ChildRewardsResponse response = childHomeService.getRewards(authentication.getName());
        return ApiResponse.success("Child rewards fetched successfully", response);
    }

    @GetMapping("/profile")
    public ApiResponse<ChildProfileResponse> getProfile(Authentication authentication) {
        ChildProfileResponse response = childHomeService.getProfile(authentication.getName());
        return ApiResponse.success("Child profile fetched successfully", response);
    }

    @PostMapping("/rewards/wishlist")
    public ApiResponse<ChildWishlistRewardResponse> createWishlistReward(
            Authentication authentication,
            @RequestBody ChildWishlistRewardRequest request
    ) {
        ChildWishlistRewardResponse response =
                childHomeService.createWishlistReward(authentication.getName(), request);
        return ApiResponse.success("Wishlist reward created successfully", response);
    }

    @PostMapping("/bonus/claim")
    public ApiResponse<ChildDailyBonusResponse> claimDailyBonus(Authentication authentication) {
        ChildDailyBonusResponse response = childHomeService.claimDailyBonus(authentication.getName());
        return ApiResponse.success("Daily bonus claimed successfully", response);
    }

    @PatchMapping("/tasks/{taskId}/validation-request")
    public ApiResponse<ChildAssignedTaskResponse> updateTaskValidationRequest(
            Authentication authentication,
            @PathVariable Long taskId,
            @RequestBody ChildTaskValidationRequest request
    ) {
        ChildAssignedTaskResponse response =
                childHomeService.updateTaskValidationRequest(authentication.getName(), taskId, request);

        return ApiResponse.success("Task validation request updated successfully", response);
    }

    @PostMapping("/rewards/{rewardId}/buy")
    public ApiResponse<ChildAssignedRewardResponse> buyReward(
            Authentication authentication,
            @PathVariable Long rewardId
    ) {
        ChildAssignedRewardResponse response = childHomeService.buyReward(authentication.getName(), rewardId);
        return ApiResponse.success("Reward purchased successfully", response);
    }
}
