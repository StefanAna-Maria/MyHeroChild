package com.myherochild.backend.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class UpdateUserProfileResponse {
    private UserMeResponse user;
    private String token;
}
