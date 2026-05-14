package com.myherochild.backend.child.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class ChildAssignedTaskResponse {

    private Long id;
    private String title;
    private int xp;
    private int rewardPoints;
    private String type;
    private String startDate;
    private String endDate;
    private boolean completionRequested;
}
