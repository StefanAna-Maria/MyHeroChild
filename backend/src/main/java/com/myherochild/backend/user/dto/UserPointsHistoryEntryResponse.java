package com.myherochild.backend.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class UserPointsHistoryEntryResponse {
    private Long id;
    private String actionType;
    private String sourceType;
    private Long sourceId;
    private int deltaXp;
    private int deltaRewardPoints;
    private int totalXpAfter;
    private int totalRewardPointsAfter;
    private String description;
    private String createdAt;
}
