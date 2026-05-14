package com.myherochild.backend.user.dto;

import com.myherochild.backend.user.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class UserMeResponse {

    private String username;
    private String email;
    private UserRole role;
    private int level;
    private int xp;
    private int currentLevelMinTotalXp;
    private Integer nextLevelMinTotalXp;
    private int rewardPoints;
    private String avatar;
}
