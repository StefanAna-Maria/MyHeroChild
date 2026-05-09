package com.myherochild.backend.parent;

import com.myherochild.backend.common.dto.ApiResponse;
import com.myherochild.backend.packages.dto.PackageResponse;
import com.myherochild.backend.packages.dto.RewardResponse;
import com.myherochild.backend.packages.dto.TaskResponse;
import com.myherochild.backend.parent.dto.ParentCustomRewardRequest;
import com.myherochild.backend.parent.dto.ParentCustomTaskRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/parent/catalog")
@RequiredArgsConstructor
public class ParentCatalogueController {

    private final ParentCatalogueService parentCatalogueService;

    @GetMapping("/packages")
    public ApiResponse<List<PackageResponse>> getCataloguePackages(Authentication authentication) {
        List<PackageResponse> response = parentCatalogueService.getCataloguePackages(authentication.getName());
        return ApiResponse.success("Catalogue packages fetched successfully", response);
    }

    @PostMapping("/packages/{packageId}")
    public ApiResponse<List<PackageResponse>> addPackageToCatalogue(
            Authentication authentication,
            @PathVariable Long packageId
    ) {
        List<PackageResponse> response =
                parentCatalogueService.addPackageToCatalogue(authentication.getName(), packageId);

        return ApiResponse.success("Package added to catalogue successfully", response);
    }

    @GetMapping("/tasks")
    public ApiResponse<List<TaskResponse>> getCustomTasks(Authentication authentication) {
        List<TaskResponse> response = parentCatalogueService.getCustomTasks(authentication.getName());
        return ApiResponse.success("Custom tasks fetched successfully", response);
    }

    @PostMapping("/tasks")
    public ApiResponse<TaskResponse> createCustomTask(
            Authentication authentication,
            @RequestBody ParentCustomTaskRequest request
    ) {
        TaskResponse response = parentCatalogueService.createCustomTask(authentication.getName(), request);
        return ApiResponse.success("Custom task created successfully", response);
    }

    @PutMapping("/tasks/{taskId}")
    public ApiResponse<TaskResponse> updateCustomTask(
            Authentication authentication,
            @PathVariable Long taskId,
            @RequestBody ParentCustomTaskRequest request
    ) {
        TaskResponse response =
                parentCatalogueService.updateCustomTask(authentication.getName(), taskId, request);
        return ApiResponse.success("Custom task updated successfully", response);
    }

    @DeleteMapping("/tasks/{taskId}")
    public ApiResponse<Void> deleteCustomTask(
            Authentication authentication,
            @PathVariable Long taskId
    ) {
        parentCatalogueService.deleteCustomTask(authentication.getName(), taskId);
        return ApiResponse.success("Custom task deleted successfully", null);
    }

    @GetMapping("/rewards")
    public ApiResponse<List<RewardResponse>> getCustomRewards(Authentication authentication) {
        List<RewardResponse> response = parentCatalogueService.getCustomRewards(authentication.getName());
        return ApiResponse.success("Custom rewards fetched successfully", response);
    }

    @PostMapping("/rewards")
    public ApiResponse<RewardResponse> createCustomReward(
            Authentication authentication,
            @RequestBody ParentCustomRewardRequest request
    ) {
        RewardResponse response = parentCatalogueService.createCustomReward(authentication.getName(), request);
        return ApiResponse.success("Custom reward created successfully", response);
    }

    @PutMapping("/rewards/{rewardId}")
    public ApiResponse<RewardResponse> updateCustomReward(
            Authentication authentication,
            @PathVariable Long rewardId,
            @RequestBody ParentCustomRewardRequest request
    ) {
        RewardResponse response =
                parentCatalogueService.updateCustomReward(authentication.getName(), rewardId, request);
        return ApiResponse.success("Custom reward updated successfully", response);
    }

    @DeleteMapping("/rewards/{rewardId}")
    public ApiResponse<Void> deleteCustomReward(
            Authentication authentication,
            @PathVariable Long rewardId
    ) {
        parentCatalogueService.deleteCustomReward(authentication.getName(), rewardId);
        return ApiResponse.success("Custom reward deleted successfully", null);
    }
}
