package com.myherochild.backend.parent.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ParentTaskSelectionRequest {
    private String sourceType;
    private Long sourceId;
    private LocalDate startDate;
    private LocalDate endDate;
}
