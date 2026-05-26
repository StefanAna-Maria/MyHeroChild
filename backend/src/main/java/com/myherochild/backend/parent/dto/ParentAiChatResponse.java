package com.myherochild.backend.parent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class ParentAiChatResponse {
    private String reply;
    private String model;
}
