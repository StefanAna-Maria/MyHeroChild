package com.myherochild.backend.parent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class ParentChildDetailResponse {
    private Long id;
    private String username;
    private String avatar;
    private int level;
    private int activeTasksCount;
    private int availableRewardsCount;
    private int wishlistCount;
    private int completedTasksCount;
    private int purchasedRewardsCount;
    private int grantedRewardsCount;
    private List<ParentChildActivityPointResponse> weeklyActivity;
}
