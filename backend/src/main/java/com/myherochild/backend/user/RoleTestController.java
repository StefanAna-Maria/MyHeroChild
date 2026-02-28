package com.myherochild.backend.user;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RoleTestController {

    @GetMapping("/parent/test")
    public String parentTest(Authentication authentication) {
        System.out.println("Authorities: " + authentication.getAuthorities());
        return "Parent access granted";
    }

    @GetMapping("/child/test")
    public String childTest() {
        return "Child access granted";
    }

    @GetMapping("/admin/test")
    public String adminTest() {
        return "Admin access granted";
    }
}