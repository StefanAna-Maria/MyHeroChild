package com.myherochild.backend.parent;

import com.myherochild.backend.common.dto.ApiResponse;
import com.myherochild.backend.parent.dto.ParentAiChatRequest;
import com.myherochild.backend.parent.dto.ParentAiChatResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/parent/ai")
public class ParentAiController {

    private final ParentAiService parentAiService;

    @PostMapping("/chat")
    public ApiResponse<ParentAiChatResponse> chat(
            Authentication authentication,
            @RequestBody ParentAiChatRequest request
    ) {
        return ApiResponse.success(
                "AI response generated successfully",
                parentAiService.chat(authentication.getName(), request.getMessage())
        );
    }
}
