package com.myherochild.backend.packages.dto;

import lombok.Data;

@Data
public class CreateTaskRequest {
    private String title;
    private int xp;
    private int rewardPoints;
    private String type;
}