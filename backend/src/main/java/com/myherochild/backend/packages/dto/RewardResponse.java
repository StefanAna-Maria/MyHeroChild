package com.myherochild.backend.packages.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class RewardResponse {
    private Long id;
    private String title;
    private int price;
    private String type;
    //private String image;
}