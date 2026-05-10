package com.myherochild.backend.parent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class ParentDistributionChildResponse {
    private Long id;
    private String username;
    private String avatar;
    private int level;
    private long assignedTasksCount;
    private long availableRewardsCount;
}
