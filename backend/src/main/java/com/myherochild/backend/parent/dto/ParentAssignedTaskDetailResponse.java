package com.myherochild.backend.parent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
public class ParentAssignedTaskDetailResponse {
    private Long id;
    private String title;
    private int xp;
    private int rewardPoints;
    private String type;
    private LocalDate startDate;
    private LocalDate endDate;
}
