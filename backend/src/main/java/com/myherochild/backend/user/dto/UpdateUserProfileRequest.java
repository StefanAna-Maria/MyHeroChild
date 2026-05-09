package com.myherochild.backend.user.dto;

import lombok.Data;

@Data
public class UpdateUserProfileRequest {
    private String username;
    private String email;
    private String avatar;
}
