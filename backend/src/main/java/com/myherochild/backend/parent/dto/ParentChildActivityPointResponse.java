package com.myherochild.backend.parent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class ParentChildActivityPointResponse {
    private String label;
    private int approvedTasks;
    private int grantedRewards;
}
