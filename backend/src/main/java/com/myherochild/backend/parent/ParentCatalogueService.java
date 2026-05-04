package com.myherochild.backend.parent;

import com.myherochild.backend.packages.Package;
import com.myherochild.backend.packages.PackageRepository;
import com.myherochild.backend.packages.PackageService;
import com.myherochild.backend.packages.dto.PackageResponse;
import com.myherochild.backend.user.User;
import com.myherochild.backend.user.UserRepository;
import com.myherochild.backend.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ParentCatalogueService {

    private final UserRepository userRepository;
    private final PackageRepository packageRepository;
    private final PackageService packageService;

    public List<PackageResponse> getCataloguePackages(String username) {
        User parent = getParentWithCatalogue(username);

        return parent.getCatalogPackages().stream()
                .sorted(Comparator.comparing(Package::getTitle, String.CASE_INSENSITIVE_ORDER))
                .map(packageService::mapToResponse)
                .toList();
    }

    public List<PackageResponse> addPackageToCatalogue(String username, Long packageId) {
        User parent = getParentWithCatalogue(username);
        Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Package not found"));

        parent.getCatalogPackages().add(pkg);
        userRepository.save(parent);

        return getCataloguePackages(username);
    }

    private User getParentWithCatalogue(String username) {
        User user = userRepository.findWithCatalogPackagesByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != UserRole.PARENT) {
            throw new RuntimeException("Only parents can manage catalogues");
        }

        return user;
    }
}
