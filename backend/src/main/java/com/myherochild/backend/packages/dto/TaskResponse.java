package com.myherochild.backend.packages.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class TaskResponse {
    private Long id;
    private String title;
    private int xp;
    private int rewardPoints;
    private String type;
}