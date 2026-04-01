package com.myherochild.backend.packages.dto;

import lombok.Data;

import java.util.List;

@Data
public class CreatePackageRequest {
    private String title;
    private String ageGroup;
    private String description;
    private List<CreateTaskRequest> tasks;
    private List<CreateRewardRequest> rewards;
}