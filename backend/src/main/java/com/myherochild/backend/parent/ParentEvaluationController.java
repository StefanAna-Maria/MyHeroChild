package com.myherochild.backend.parent;

import com.myherochild.backend.common.dto.ApiResponse;
import com.myherochild.backend.parent.dto.ParentEvaluationChildResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/parent/evaluation")
@RequiredArgsConstructor
public class ParentEvaluationController {

    private final ParentEvaluationService parentEvaluationService;

    @GetMapping("/tasks")
    public ApiResponse<List<ParentEvaluationChildResponse>> getPendingTasks(Authentication authentication) {
        return ApiResponse.success(
                "Pending evaluation tasks fetched successfully",
                parentEvaluationService.getPendingTasks(authentication.getName())
        );
    }

    @PostMapping("/tasks/{taskId}/approve")
    public ApiResponse<Void> approveTask(Authentication authentication, @PathVariable Long taskId) {
        parentEvaluationService.approveTask(authentication.getName(), taskId);
        return ApiResponse.success("Task approved successfully", null);
    }

    @PostMapping("/tasks/{taskId}/reject")
    public ApiResponse<Void> rejectTask(Authentication authentication, @PathVariable Long taskId) {
        parentEvaluationService.rejectTask(authentication.getName(), taskId);
        return ApiResponse.success("Task rejected successfully", null);
    }
}
