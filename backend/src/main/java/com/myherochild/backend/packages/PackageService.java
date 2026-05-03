package com.myherochild.backend.packages;

import com.myherochild.backend.packages.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    public PackageResponse updatePackage(Long id, CreatePackageRequest request) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found"));

        pkg.setTitle(request.getTitle());
        pkg.setAgeGroup(request.getAgeGroup());
        pkg.setDescription(request.getDescription());

        syncTasks(pkg, request.getTasks());
        syncRewards(pkg, request.getRewards());

        Package updatedPackage = packageRepository.save(pkg);

        return mapToResponse(updatedPackage);
    }

    public void deletePackage(Long id) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found"));

        packageRepository.delete(pkg);
    }

    private void syncTasks(Package pkg, List<CreateTaskRequest> taskRequests) {
        List<Task> existingTasks = pkg.getTasks() == null ? new ArrayList<>() : pkg.getTasks();
        Map<Long, Task> existingById = new HashMap<>();

        for (Task task : existingTasks) {
            if (task.getId() != null) {
                existingById.put(task.getId(), task);
            }
        }

        List<Task> updatedTasks = taskRequests == null
                ? new ArrayList<>()
                : taskRequests.stream()
                        .map(taskRequest -> {
                            Task task = taskRequest.getId() != null
                                    ? existingById.getOrDefault(taskRequest.getId(), new Task())
                                    : new Task();

                            task.setTitle(taskRequest.getTitle());
                            task.setXp(taskRequest.getXp());
                            task.setRewardPoints(taskRequest.getRewardPoints());
                            task.setType(taskRequest.getType());
                            task.setPkg(pkg);

                            return task;
                        })
                        .toList();

        existingTasks.clear();
        existingTasks.addAll(updatedTasks);
        pkg.setTasks(existingTasks);
    }

    private void syncRewards(Package pkg, List<CreateRewardRequest> rewardRequests) {
        List<Reward> existingRewards = pkg.getRewards() == null ? new ArrayList<>() : pkg.getRewards();
        Map<Long, Reward> existingById = new HashMap<>();

        for (Reward reward : existingRewards) {
            if (reward.getId() != null) {
                existingById.put(reward.getId(), reward);
            }
        }

        List<Reward> updatedRewards = rewardRequests == null
                ? new ArrayList<>()
                : rewardRequests.stream()
                        .map(rewardRequest -> {
                            Reward reward = rewardRequest.getId() != null
                                    ? existingById.getOrDefault(rewardRequest.getId(), new Reward())
                                    : new Reward();

                            reward.setTitle(rewardRequest.getTitle());
                            reward.setPrice(rewardRequest.getPrice());
                            reward.setType(rewardRequest.getType());
                            reward.setPkg(pkg);

                            return reward;
                        })
                        .toList();

        existingRewards.clear();
        existingRewards.addAll(updatedRewards);
        pkg.setRewards(existingRewards);
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
