package com.myherochild.backend.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class UserAvatarOptionResponse {
    private String avatar;
    private int minLevel;
    private boolean unlocked;
    private boolean claimed;
    private boolean selectable;
}
