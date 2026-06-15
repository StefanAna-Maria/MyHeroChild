package com.myherochild.backend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AdminWeeklyEngagementPointResponse {

    private String label;
    private long completedTasks;
    private long claimedRewards;
}
