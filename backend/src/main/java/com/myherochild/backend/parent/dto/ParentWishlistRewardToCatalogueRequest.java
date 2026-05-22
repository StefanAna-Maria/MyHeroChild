package com.myherochild.backend.parent.dto;

import com.myherochild.backend.common.model.RewardType;
import lombok.Data;

@Data
public class ParentWishlistRewardToCatalogueRequest {
    private Integer price;
    private RewardType type;
}
