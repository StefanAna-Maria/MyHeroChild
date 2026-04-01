package com.myherochild.backend.packages.dto;

import lombok.Data;

@Data
public class CreateRewardRequest {
    private String title;
    private int price;
    private String type;
    //private String image;
}