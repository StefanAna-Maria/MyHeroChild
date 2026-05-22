package com.myherochild.backend.parent;

import com.myherochild.backend.common.dto.ApiResponse;
import com.myherochild.backend.parent.dto.ParentChildDetailResponse;
import com.myherochild.backend.parent.dto.ParentChildWishlistResponse;
import com.myherochild.backend.parent.dto.ParentProfileResponse;
import com.myherochild.backend.parent.dto.ParentWishlistRewardToCatalogueRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/parent/profile")
public class ParentProfileController {

    private final ParentProfileService parentProfileService;

    @GetMapping
    public ApiResponse<ParentProfileResponse> getProfile(Authentication authentication) {
        ParentProfileResponse response = parentProfileService.getProfile(authentication.getName());
        return ApiResponse.success("Parent profile fetched successfully", response);
    }

    @GetMapping("/children/{childId}")
    public ApiResponse<ParentChildDetailResponse> getChildDetail(
            Authentication authentication,
            @PathVariable Long childId
    ) {
        ParentChildDetailResponse response =
                parentProfileService.getChildDetail(authentication.getName(), childId);
        return ApiResponse.success("Child detail fetched successfully", response);
    }

    @GetMapping("/children/{childId}/wishlist")
    public ApiResponse<ParentChildWishlistResponse> getChildWishlist(
            Authentication authentication,
            @PathVariable Long childId
    ) {
        ParentChildWishlistResponse response =
                parentProfileService.getChildWishlist(authentication.getName(), childId);
        return ApiResponse.success("Child wishlist fetched successfully", response);
    }

    @PostMapping("/children/{childId}/wishlist/{wishlistRewardId}/catalog-reward")
    public ApiResponse<Void> saveWishlistRewardToCatalogue(
            Authentication authentication,
            @PathVariable Long childId,
            @PathVariable Long wishlistRewardId,
            @RequestBody ParentWishlistRewardToCatalogueRequest request
    ) {
        parentProfileService.saveWishlistRewardToCatalogue(
                authentication.getName(),
                childId,
                wishlistRewardId,
                request
        );
        return ApiResponse.success("Wishlist reward saved to catalogue successfully", null);
    }

    @PostMapping("/claimed-rewards/{rewardId}/grant")
    public ApiResponse<Void> grantClaimedReward(
            Authentication authentication,
            @PathVariable Long rewardId
    ) {
        parentProfileService.grantClaimedReward(authentication.getName(), rewardId);
        return ApiResponse.success("Reward marked as granted successfully", null);
    }
}
