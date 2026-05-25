package com.myherochild.backend.child.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class ChildDailyBonusResponse {

    private int rewardPoints;
    private int totalTasks;
    private int approvedTasks;
    private double progress;
    private boolean claimable;
    private boolean claimed;
    private boolean restricted;
    private String restrictedUntil;
}
