package com.myherochild.backend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AdminOverviewMetricsResponse {

    private long totalRegisteredUsers;
    private long totalTasksDistributed;
    private double averageSavedPackagesPerParent;
    private long totalRewardsClaimed;
    private long totalTasksCompleted;
    private double weeklyTaskCompletionRate;
    private double weeklyUserGrowthPercentage;
}
