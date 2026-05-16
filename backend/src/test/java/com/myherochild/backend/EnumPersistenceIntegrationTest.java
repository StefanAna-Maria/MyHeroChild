package com.myherochild.backend;

import com.myherochild.backend.common.model.RewardType;
import com.myherochild.backend.common.model.TaskType;
import com.myherochild.backend.packages.Package;
import com.myherochild.backend.packages.PackageRepository;
import com.myherochild.backend.packages.Reward;
import com.myherochild.backend.packages.RewardRepository;
import com.myherochild.backend.packages.Task;
import com.myherochild.backend.packages.TaskRepository;
import com.myherochild.backend.parent.ParentAssignedReward;
import com.myherochild.backend.parent.ParentAssignedRewardRepository;
import com.myherochild.backend.parent.ParentAssignedTask;
import com.myherochild.backend.parent.ParentAssignedTaskRepository;
import com.myherochild.backend.parent.ParentCustomReward;
import com.myherochild.backend.parent.ParentCustomRewardRepository;
import com.myherochild.backend.parent.ParentCustomTask;
import com.myherochild.backend.parent.ParentCustomTaskRepository;
import com.myherochild.backend.user.User;
import com.myherochild.backend.user.UserRepository;
import com.myherochild.backend.user.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class EnumPersistenceIntegrationTest {

    @Autowired
    private PackageRepository packageRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private RewardRepository rewardRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ParentCustomTaskRepository parentCustomTaskRepository;

    @Autowired
    private ParentCustomRewardRepository parentCustomRewardRepository;

    @Autowired
    private ParentAssignedTaskRepository parentAssignedTaskRepository;

    @Autowired
    private ParentAssignedRewardRepository parentAssignedRewardRepository;

    @Test
    void shouldPersistEnumTypesAcrossAllAffectedTables() {
        User parent = userRepository.saveAndFlush(User.builder()
                .username("enum-parent-" + System.nanoTime())
                .email("enum-parent-" + System.nanoTime() + "@test.com")
                .passwordHash("hash")
                .role(UserRole.PARENT)
                .createdAt(LocalDateTime.now())
                .parentCode("PC" + System.nanoTime())
                .build());

        User child = userRepository.saveAndFlush(User.builder()
                .username("enum-child-" + System.nanoTime())
                .passwordHash("hash")
                .role(UserRole.CHILD)
                .createdAt(LocalDateTime.now())
                .parent(parent)
                .build());

        Package pkg = packageRepository.saveAndFlush(Package.builder()
                .title("Enum Package")
                .ageGroup("7-9")
                .description("Enum persistence check")
                .build());

        Task task = taskRepository.saveAndFlush(Task.builder()
                .title("Read a chapter")
                .xp(20)
                .rewardPoints(10)
                .type(TaskType.READING)
                .pkg(pkg)
                .build());

        Reward reward = rewardRepository.saveAndFlush(Reward.builder()
                .title("More screen time")
                .price(30)
                .type(RewardType.SCREEN_TIME)
                .pkg(pkg)
                .build());

        ParentCustomTask customTask = parentCustomTaskRepository.saveAndFlush(ParentCustomTask.builder()
                .title("Custom tidy up")
                .xp(15)
                .rewardPoints(8)
                .type(TaskType.NEAT_TIDY)
                .parent(parent)
                .build());

        ParentCustomReward customReward = parentCustomRewardRepository.saveAndFlush(ParentCustomReward.builder()
                .title("Toy reward")
                .price(50)
                .type(RewardType.TOY)
                .parent(parent)
                .build());

        ParentAssignedTask assignedTask = parentAssignedTaskRepository.saveAndFlush(ParentAssignedTask.builder()
                .parent(parent)
                .child(child)
                .title("Assigned hygiene task")
                .xp(25)
                .rewardPoints(12)
                .type(TaskType.HYGIENE)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(1))
                .sourceKind("CUSTOM_TASK")
                .sourceId(customTask.getId())
                .createdAt(LocalDateTime.now())
                .build());

        ParentAssignedReward assignedReward = parentAssignedRewardRepository.saveAndFlush(ParentAssignedReward.builder()
                .parent(parent)
                .child(child)
                .title("Assigned family reward")
                .price(60)
                .type(RewardType.FAMILY)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(1))
                .sourceKind("CUSTOM_REWARD")
                .sourceId(customReward.getId())
                .createdAt(LocalDateTime.now())
                .build());

        assertThat(task.getType()).isEqualTo(TaskType.READING);
        assertThat(reward.getType()).isEqualTo(RewardType.SCREEN_TIME);
        assertThat(customTask.getType()).isEqualTo(TaskType.NEAT_TIDY);
        assertThat(customReward.getType()).isEqualTo(RewardType.TOY);
        assertThat(assignedTask.getType()).isEqualTo(TaskType.HYGIENE);
        assertThat(assignedReward.getType()).isEqualTo(RewardType.FAMILY);
    }
}
