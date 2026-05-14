package com.myherochild.backend.parent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class ParentEvaluationTaskResponse {

    private Long id;
    private String title;
}
