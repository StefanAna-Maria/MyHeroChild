package com.myherochild.backend.parent;

import com.myherochild.backend.packages.Package;
import com.myherochild.backend.packages.PackageRepository;
import com.myherochild.backend.packages.PackageService;
import com.myherochild.backend.packages.dto.PackageResponse;
import com.myherochild.backend.packages.dto.RewardResponse;
import com.myherochild.backend.packages.dto.TaskResponse;
import com.myherochild.backend.parent.dto.ParentCustomRewardRequest;
import com.myherochild.backend.parent.dto.ParentCustomTaskRequest;
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
    private final ParentCustomTaskRepository parentCustomTaskRepository;
    private final ParentCustomRewardRepository parentCustomRewardRepository;

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

    public List<TaskResponse> getCustomTasks(String username) {
        User parent = getParent(username);

        return parentCustomTaskRepository.findAllByParentIdOrderByTitleAsc(parent.getId()).stream()
                .map(task -> TaskResponse.builder()
                        .id(task.getId())
                        .title(task.getTitle())
                        .xp(task.getXp())
                        .rewardPoints(task.getRewardPoints())
                        .type(task.getType())
                        .build())
                .toList();
    }

    public TaskResponse createCustomTask(String username, ParentCustomTaskRequest request) {
        User parent = getParent(username);

        ParentCustomTask task = ParentCustomTask.builder()
                .title(request.getTitle())
                .xp(request.getXp())
                .rewardPoints(request.getRewardPoints())
                .type(request.getType())
                .parent(parent)
                .build();

        return mapTaskResponse(parentCustomTaskRepository.save(task));
    }

    public TaskResponse updateCustomTask(String username, Long taskId, ParentCustomTaskRequest request) {
        User parent = getParent(username);
        ParentCustomTask task = parentCustomTaskRepository.findByIdAndParentId(taskId, parent.getId())
                .orElseThrow(() -> new RuntimeException("Custom task not found"));

        task.setTitle(request.getTitle());
        task.setXp(request.getXp());
        task.setRewardPoints(request.getRewardPoints());
        task.setType(request.getType());

        return mapTaskResponse(parentCustomTaskRepository.save(task));
    }

    public void deleteCustomTask(String username, Long taskId) {
        User parent = getParent(username);
        ParentCustomTask task = parentCustomTaskRepository.findByIdAndParentId(taskId, parent.getId())
                .orElseThrow(() -> new RuntimeException("Custom task not found"));

        parentCustomTaskRepository.delete(task);
    }

    public List<RewardResponse> getCustomRewards(String username) {
        User parent = getParent(username);

        return parentCustomRewardRepository.findAllByParentIdOrderByTitleAsc(parent.getId()).stream()
                .map(reward -> RewardResponse.builder()
                        .id(reward.getId())
                        .title(reward.getTitle())
                        .price(reward.getPrice())
                        .type(reward.getType())
                        .build())
                .toList();
    }

    public RewardResponse createCustomReward(String username, ParentCustomRewardRequest request) {
        User parent = getParent(username);

        ParentCustomReward reward = ParentCustomReward.builder()
                .title(request.getTitle())
                .price(request.getPrice())
                .type(request.getType())
                .parent(parent)
                .build();

        return mapRewardResponse(parentCustomRewardRepository.save(reward));
    }

    public RewardResponse updateCustomReward(
            String username,
            Long rewardId,
            ParentCustomRewardRequest request
    ) {
        User parent = getParent(username);
        ParentCustomReward reward = parentCustomRewardRepository.findByIdAndParentId(rewardId, parent.getId())
                .orElseThrow(() -> new RuntimeException("Custom reward not found"));

        reward.setTitle(request.getTitle());
        reward.setPrice(request.getPrice());
        reward.setType(request.getType());

        return mapRewardResponse(parentCustomRewardRepository.save(reward));
    }

    public void deleteCustomReward(String username, Long rewardId) {
        User parent = getParent(username);
        ParentCustomReward reward = parentCustomRewardRepository.findByIdAndParentId(rewardId, parent.getId())
                .orElseThrow(() -> new RuntimeException("Custom reward not found"));

        parentCustomRewardRepository.delete(reward);
    }

    private User getParentWithCatalogue(String username) {
        User user = userRepository.findWithCatalogPackagesByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != UserRole.PARENT) {
            throw new RuntimeException("Only parents can manage catalogues");
        }

        return user;
    }

    private User getParent(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != UserRole.PARENT) {
            throw new RuntimeException("Only parents can manage catalogues");
        }

        return user;
    }

    private TaskResponse mapTaskResponse(ParentCustomTask task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .xp(task.getXp())
                .rewardPoints(task.getRewardPoints())
                .type(task.getType())
                .build();
    }

    private RewardResponse mapRewardResponse(ParentCustomReward reward) {
        return RewardResponse.builder()
                .id(reward.getId())
                .title(reward.getTitle())
                .price(reward.getPrice())
                .type(reward.getType())
                .build();
    }
}
