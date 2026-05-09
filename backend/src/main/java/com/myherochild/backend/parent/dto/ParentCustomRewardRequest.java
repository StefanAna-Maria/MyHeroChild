package com.myherochild.backend.parent.dto;

import lombok.Data;

@Data
public class ParentCustomRewardRequest {
    private String title;
    private int price;
    private String type;
}
