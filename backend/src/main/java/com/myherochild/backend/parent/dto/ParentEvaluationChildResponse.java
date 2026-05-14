package com.myherochild.backend.parent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class ParentEvaluationChildResponse {

    private Long id;
    private String username;
    private String avatar;
    private List<ParentEvaluationTaskResponse> tasks;
}
