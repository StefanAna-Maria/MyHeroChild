package com.myherochild.backend.child.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class ChildAssignedRewardResponse {

    private Long id;
    private String title;
    private int price;
    private String type;
    private String startDate;
    private String endDate;
    private boolean claimed;
}
