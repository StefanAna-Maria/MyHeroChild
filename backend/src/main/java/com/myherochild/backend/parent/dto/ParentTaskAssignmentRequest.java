package com.myherochild.backend.parent.dto;

import lombok.Data;

import java.util.List;

@Data
public class ParentTaskAssignmentRequest {
    private List<ParentTaskSelectionRequest> selections;
}
