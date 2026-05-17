package com.myherochild.backend.parent.dto;

import com.myherochild.backend.common.model.TaskType;
import lombok.Data;

@Data
public class ParentCustomTaskRequest {
    private String title;
    private int xp;
    private int rewardPoints;
    private TaskType type;
}
