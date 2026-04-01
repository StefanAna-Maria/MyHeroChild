package com.myherochild.backend.packages;

import com.myherochild.backend.packages.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PackageService {

    private final PackageRepository packageRepository;

    public PackageResponse createPackage(CreatePackageRequest request) {

        Package pkg = Package.builder()
                .title(request.getTitle())
                .ageGroup(request.getAgeGroup())
                .description(request.getDescription())
                .build();


        List<Task> tasks = request.getTasks() == null
                ? Collections.emptyList()
                : request.getTasks().stream()
                .map(taskRequest -> Task.builder()
                        .title(taskRequest.getTitle())
                        .xp(taskRequest.getXp())
                        .rewardPoints(taskRequest.getRewardPoints())
                        .type(taskRequest.getType())
                        .pkg(pkg)
                        .build())
                .toList();

        List<Reward> rewards = request.getRewards() == null
                ? Collections.emptyList()
                : request.getRewards().stream()
                .map(rewardRequest -> Reward.builder()
                        .title(rewardRequest.getTitle())
                        .price(rewardRequest.getPrice())
                        .type(rewardRequest.getType())
                        //.image(rewardRequest.getImage())
                        .pkg(pkg)
                        .build())
                .toList();

        pkg.setTasks(tasks);
        pkg.setRewards(rewards);

        Package savedPackage = packageRepository.save(pkg);

        return mapToResponse(savedPackage);
    }

    public List<PackageResponse> getAllPackages() {
        return packageRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public PackageResponse getPackageById(Long id) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found"));

        return mapToResponse(pkg);
    }

    private PackageResponse mapToResponse(Package pkg) {
        return PackageResponse.builder()
                .id(pkg.getId())
                .title(pkg.getTitle())
                .ageGroup(pkg.getAgeGroup())
                .description(pkg.getDescription())
                .tasks(
                        pkg.getTasks() == null ? Collections.emptyList() :
                                pkg.getTasks().stream()
                                        .map(task -> TaskResponse.builder()
                                                .id(task.getId())
                                                .title(task.getTitle())
                                                .xp(task.getXp())
                                                .rewardPoints(task.getRewardPoints())
                                                .type(task.getType())
                                                .build())
                                        .toList()
                )
                .rewards(
                        pkg.getRewards() == null ? Collections.emptyList() :
                                pkg.getRewards().stream()
                                        .map(reward -> RewardResponse.builder()
                                                .id(reward.getId())
                                                .title(reward.getTitle())
                                                .price(reward.getPrice())
                                                .type(reward.getType())
                                                //.image(reward.getImage())
                                                .build())
                                        .toList()
                )
                .build();
    }
}