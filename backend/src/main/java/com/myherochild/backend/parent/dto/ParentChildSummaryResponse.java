package com.myherochild.backend.parent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class ParentChildSummaryResponse {
    private Long id;
    private String username;
    private String avatar;
    private int activeTasksCount;
}
