package com.myherochild.backend.packages.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
@Builder
public class PackageResponse {
    private Long id;
    private String title;
    private String ageGroup;
    private String description;
    private List<TaskResponse> tasks;
    private List<RewardResponse> rewards;
}