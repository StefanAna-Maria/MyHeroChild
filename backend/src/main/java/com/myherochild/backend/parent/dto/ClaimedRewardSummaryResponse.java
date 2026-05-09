package com.myherochild.backend.parent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class ClaimedRewardSummaryResponse {
    private Long id;
    private String title;
    private String type;
    private Integer price;
    private String childName;
    private String childAvatar;
}
