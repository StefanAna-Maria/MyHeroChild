package com.myherochild.backend.child.dto;

import com.myherochild.backend.common.model.RewardType;
import lombok.Data;

@Data
public class ChildWishlistRewardRequest {
    private String title;
    private RewardType type;
}
