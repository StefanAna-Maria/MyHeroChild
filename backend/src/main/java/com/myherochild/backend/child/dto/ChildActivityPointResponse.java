package com.myherochild.backend.child.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class ChildActivityPointResponse {
    private String label;
    private int approvedTasks;
    private int grantedRewards;
}
