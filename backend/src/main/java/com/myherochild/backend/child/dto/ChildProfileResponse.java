package com.myherochild.backend.child.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class ChildProfileResponse {
    private Long id;
    private String username;
    private String avatar;
    private int level;
    private int activeTasksCount;
    private int availableRewardsCount;
    private int completedTasksCount;
    private int purchasedRewardsCount;
    private int grantedRewardsCount;
    private List<ChildActivityPointResponse> weeklyActivity;
}
