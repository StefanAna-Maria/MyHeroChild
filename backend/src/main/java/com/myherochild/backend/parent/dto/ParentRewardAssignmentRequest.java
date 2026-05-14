package com.myherochild.backend.parent.dto;

import lombok.Data;

import java.util.List;

@Data
public class ParentRewardAssignmentRequest {
    private List<ParentRewardSelectionRequest> selections;
}
