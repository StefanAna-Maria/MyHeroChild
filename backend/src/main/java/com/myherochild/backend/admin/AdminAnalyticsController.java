package com.myherochild.backend.admin;

import com.myherochild.backend.admin.dto.AdminAnalyticsResponse;
import com.myherochild.backend.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/analytics")
public class AdminAnalyticsController {

    private final AdminAnalyticsService adminAnalyticsService;

    @GetMapping
    public ApiResponse<AdminAnalyticsResponse> getAnalytics(Authentication authentication) {
        return ApiResponse.success(
                "Admin analytics fetched successfully",
                adminAnalyticsService.getAnalytics(authentication.getName())
        );
    }
}
