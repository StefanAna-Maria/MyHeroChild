package com.myherochild.backend.parent;

import com.myherochild.backend.common.dto.ApiResponse;
import com.myherochild.backend.parent.dto.ParentProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/parent/profile")
public class ParentProfileController {

    private final ParentProfileService parentProfileService;

    @GetMapping
    public ApiResponse<ParentProfileResponse> getProfile(Authentication authentication) {
        ParentProfileResponse response = parentProfileService.getProfile(authentication.getName());
        return ApiResponse.success("Parent profile fetched successfully", response);
    }
}
