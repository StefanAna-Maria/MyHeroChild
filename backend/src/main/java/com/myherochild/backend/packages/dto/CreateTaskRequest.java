package com.myherochild.backend.packages.dto;

import com.myherochild.backend.common.model.TaskType;
import lombok.Data;

@Data
public class CreateTaskRequest {
    private Long id;
    private String title;
    private int xp;
    private int rewardPoints;
    private TaskType type;
}
