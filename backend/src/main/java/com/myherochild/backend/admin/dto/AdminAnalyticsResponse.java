package com.myherochild.backend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class AdminAnalyticsResponse {

    private AdminOverviewMetricsResponse overview;
    private List<AdminMonthlyActivityPointResponse> activeFamiliesByMonth;
    private List<AdminWeeklyEngagementPointResponse> completedTasksVsClaimedRewards;
}
