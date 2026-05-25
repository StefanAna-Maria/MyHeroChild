package com.myherochild.backend.parent.dto;

import com.myherochild.backend.child.dto.ChildWishlistRewardResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class ParentChildWishlistResponse {
    private Long childId;
    private String childName;
    private String childAvatar;
    private List<ChildWishlistRewardResponse> rewards;
}
