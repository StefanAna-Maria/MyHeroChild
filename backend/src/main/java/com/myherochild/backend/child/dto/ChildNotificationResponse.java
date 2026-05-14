package com.myherochild.backend.child.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class ChildNotificationResponse {

    private Long id;
    private String type;
    private String title;
    private String message;
}
