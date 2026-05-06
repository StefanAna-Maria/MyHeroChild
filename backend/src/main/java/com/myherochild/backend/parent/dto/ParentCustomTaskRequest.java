package com.myherochild.backend.parent.dto;

import lombok.Data;

@Data
public class ParentCustomTaskRequest {
    private String title;
    private int xp;
    private int rewardPoints;
    private String type;
}
