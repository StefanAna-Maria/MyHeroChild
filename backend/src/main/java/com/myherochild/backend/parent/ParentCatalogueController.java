package com.myherochild.backend.parent;

import com.myherochild.backend.common.dto.ApiResponse;
import com.myherochild.backend.packages.dto.PackageResponse;
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
}
