package com.myherochild.backend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AdminMonthlyActivityPointResponse {

    private String label;
    private long activeFamilies;
}
