package com.myherochild.backend.packages.dto;

import com.myherochild.backend.common.model.RewardType;
import lombok.Data;

@Data
public class CreateRewardRequest {
    private Long id;
    private String title;
    private int price;
    private RewardType type;
    //private String image;
}
