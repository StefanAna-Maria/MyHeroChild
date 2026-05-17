package com.myherochild.backend.parent.dto;

import com.myherochild.backend.common.model.RewardType;
import lombok.Data;

@Data
public class ParentCustomRewardRequest {
    private String title;
    private int price;
    private RewardType type;
}
