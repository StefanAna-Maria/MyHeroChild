package com.myherochild.backend.packages;

import com.myherochild.backend.common.dto.ApiResponse;
import com.myherochild.backend.packages.dto.CreatePackageRequest;
import com.myherochild.backend.packages.dto.PackageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/packages")
@RequiredArgsConstructor
public class PackageController {

    private final PackageService packageService;

    @PostMapping
    public ApiResponse<PackageResponse> createPackage(@RequestBody CreatePackageRequest request) {
        PackageResponse response = packageService.createPackage(request);
        return ApiResponse.success("Package created successfully", response);
    }

    @GetMapping
    public ApiResponse<List<PackageResponse>> getAllPackages() {
        List<PackageResponse> response = packageService.getAllPackages();
        return ApiResponse.success("Packages fetched successfully", response);
    }

    @GetMapping("/{id}")
    public ApiResponse<PackageResponse> getPackageById(@PathVariable Long id) {
        PackageResponse response = packageService.getPackageById(id);
        return ApiResponse.success("Package fetched successfully", response);
    }
}