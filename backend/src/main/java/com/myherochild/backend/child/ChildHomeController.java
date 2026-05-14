package com.myherochild.backend.child;

import com.myherochild.backend.child.dto.ChildAssignedTaskResponse;
import com.myherochild.backend.child.dto.ChildHomeResponse;
import com.myherochild.backend.child.dto.ChildTaskValidationRequest;
import com.myherochild.backend.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/child")
@RequiredArgsConstructor
public class ChildHomeController {

    private final ChildHomeService childHomeService;

    @GetMapping("/home")
    public ApiResponse<ChildHomeResponse> getHome(Authentication authentication) {
        ChildHomeResponse response = childHomeService.getHome(authentication.getName());
        return ApiResponse.success("Child home fetched successfully", response);
    }

    @PatchMapping("/tasks/{taskId}/validation-request")
    public ApiResponse<ChildAssignedTaskResponse> updateTaskValidationRequest(
            Authentication authentication,
            @PathVariable Long taskId,
            @RequestBody ChildTaskValidationRequest request
    ) {
        ChildAssignedTaskResponse response =
                childHomeService.updateTaskValidationRequest(authentication.getName(), taskId, request);

        return ApiResponse.success("Task validation request updated successfully", response);
    }
}
