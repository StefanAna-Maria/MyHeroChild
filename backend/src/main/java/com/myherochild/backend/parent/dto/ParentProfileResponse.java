package com.myherochild.backend.parent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class ParentProfileResponse {
    private String username;
    private String email;
    private String avatar;
    private List<ParentChildSummaryResponse> children;
    private List<ClaimedRewardSummaryResponse> claimedRewards;
}
