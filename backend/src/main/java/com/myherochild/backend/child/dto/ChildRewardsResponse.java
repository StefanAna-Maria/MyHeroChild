package com.myherochild.backend.child.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class ChildRewardsResponse {

    private List<ChildAssignedRewardResponse> rewardShop;
    private List<ChildAssignedRewardResponse> myRewards;
    private List<ChildAssignedRewardResponse> rewardHistory;
    private List<ChildWishlistRewardResponse> wishlist;
    private List<ChildNotificationResponse> notifications;
}
