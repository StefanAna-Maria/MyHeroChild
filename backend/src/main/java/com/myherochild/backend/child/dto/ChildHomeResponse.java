package com.myherochild.backend.child.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class ChildHomeResponse {

    private List<ChildAssignedTaskResponse> todaysTasks;
    private List<ChildAssignedRewardResponse> rewardShop;
    private List<ChildAssignedRewardResponse> myRewards;
    private List<String> wishlist;
    private List<ChildNotificationResponse> notifications;
}
