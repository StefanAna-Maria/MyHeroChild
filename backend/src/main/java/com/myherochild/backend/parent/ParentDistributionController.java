package com.myherochild.backend.parent;

import com.myherochild.backend.common.dto.ApiResponse;
import com.myherochild.backend.parent.dto.ParentAssignedRewardDetailResponse;
import com.myherochild.backend.parent.dto.ParentAssignedTaskDetailResponse;
import com.myherochild.backend.parent.dto.ParentDistributionChildResponse;
import com.myherochild.backend.parent.dto.ParentRewardAssignmentRequest;
import com.myherochild.backend.parent.dto.ParentTaskAssignmentRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/parent/distribution")
@RequiredArgsConstructor
public class ParentDistributionController {

    private final ParentDistributionService parentDistributionService;

    @GetMapping("/children")
    public ApiResponse<List<ParentDistributionChildResponse>> getChildren(
            Authentication authentication,
            @RequestParam(defaultValue = "true") boolean onlyToday
    ) {
        List<ParentDistributionChildResponse> response =
                parentDistributionService.getChildren(authentication.getName(), onlyToday);
        return ApiResponse.success("Distribution children fetched successfully", response);
    }

    @GetMapping("/children/{childId}/tasks")
    public ApiResponse<List<ParentAssignedTaskDetailResponse>> getAssignedTasks(
            Authentication authentication,
            @PathVariable Long childId
    ) {
        List<ParentAssignedTaskDetailResponse> response =
                parentDistributionService.getAssignedTasks(authentication.getName(), childId);
        return ApiResponse.success("Assigned tasks fetched successfully", response);
    }

    @GetMapping("/children/{childId}/rewards")
    public ApiResponse<List<ParentAssignedRewardDetailResponse>> getAssignedRewards(
            Authentication authentication,
            @PathVariable Long childId
    ) {
        List<ParentAssignedRewardDetailResponse> response =
                parentDistributionService.getAssignedRewards(authentication.getName(), childId);
        return ApiResponse.success("Assigned rewards fetched successfully", response);
    }

    @PostMapping("/children/{childId}/tasks")
    public ApiResponse<ParentDistributionChildResponse> assignTasks(
            Authentication authentication,
            @PathVariable Long childId,
            @RequestBody ParentTaskAssignmentRequest request
    ) {
        ParentDistributionChildResponse response =
                parentDistributionService.assignTasks(authentication.getName(), childId, request);

        return ApiResponse.success("Tasks assigned successfully", response);
    }

    @PostMapping("/children/{childId}/rewards")
    public ApiResponse<ParentDistributionChildResponse> assignRewards(
            Authentication authentication,
            @PathVariable Long childId,
            @RequestBody ParentRewardAssignmentRequest request
    ) {
        ParentDistributionChildResponse response =
                parentDistributionService.assignRewards(authentication.getName(), childId, request);

        return ApiResponse.success("Rewards activated successfully", response);
    }
}
