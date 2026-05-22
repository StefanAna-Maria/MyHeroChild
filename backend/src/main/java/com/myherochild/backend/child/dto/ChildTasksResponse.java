package com.myherochild.backend.child.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class ChildTasksResponse {

    private List<ChildAssignedTaskResponse> tasks;
    private ChildDailyBonusResponse dailyBonus;
    private List<ChildNotificationResponse> notifications;
}
