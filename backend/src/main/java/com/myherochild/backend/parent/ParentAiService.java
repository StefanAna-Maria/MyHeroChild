package com.myherochild.backend.parent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.myherochild.backend.common.model.RewardType;
import com.myherochild.backend.common.model.TaskType;
import com.myherochild.backend.common.exception.BusinessException;
import com.myherochild.backend.parent.dto.ParentAiChatResponse;
import com.myherochild.backend.user.UserPointsHistory;
import com.myherochild.backend.user.UserPointsHistoryRepository;
import com.myherochild.backend.user.User;
import com.myherochild.backend.user.UserRepository;
import com.myherochild.backend.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ParentAiService {

    private final UserRepository userRepository;
    private final ParentAssignedTaskRepository parentAssignedTaskRepository;
    private final ParentAssignedRewardRepository parentAssignedRewardRepository;
    private final ParentCustomTaskRepository parentCustomTaskRepository;
    private final ParentCustomRewardRepository parentCustomRewardRepository;
    private final UserPointsHistoryRepository userPointsHistoryRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.ai.ollama.base-url:http://127.0.0.1:11434}")
    private String ollamaBaseUrl;

    @Value("${app.ai.ollama.model:llama3:8b-instruct-q4_K_M}")
    private String ollamaModel;

    public ParentAiChatResponse chat(String username, String message) {
        User parent = userRepository.findWithCatalogPackagesByUsername(username)
                .orElseThrow(() -> new BusinessException("User not found"));

        if (parent.getRole() != UserRole.PARENT) {
            throw new BusinessException("Only parents can access AI SuperNanny");
        }

        String trimmedMessage = message == null ? "" : message.trim();
        if (trimmedMessage.isEmpty()) {
            throw new BusinessException("Message is required");
        }

        List<User> children = userRepository.findAllByParentIdAndRoleOrderByUsernameAsc(parent.getId(), UserRole.CHILD);
        String childSummary = buildChildrenSummary(children);
        String catalogueSummary = buildCatalogueSummary(parent);

        String systemPrompt = """
                You are AI SuperNanny, a warm and practical parenting assistant inside the MyHeroChild app.
                Your job is to help parents choose suitable tasks and rewards for their children based on structured app analytics.
                Base your suggestions only on the app context below and on the parent's message.
                Prefer recommendations that match the parent's real catalogue when possible.
                If the parent's catalogue looks weak for the request, say that clearly and suggest what kind of task or reward should be added next.
                Keep responses concise, supportive, and actionable.
                Do not invent private data that is not present.
                If the parent asks for recommendations, suggest concrete task ideas or reward ideas and explain briefly why they fit.
                When you mention a child, use the exact child name from the context.
                When several children exist, ask a brief follow-up only if the parent did not make it clear which child they mean.
                Use this response shape when relevant:
                1. Short insight
                2. Recommended tasks
                3. Recommended rewards
                4. Why this fits
                App context:
                Parent username: %s
                Parent catalogue summary:
                %s
                Children summary:
                %s
                """.formatted(parent.getUsername(), catalogueSummary, childSummary);

        Map<String, Object> requestBody = Map.of(
                "model", ollamaModel,
                "stream", false,
                "options", Map.of(
                        "temperature", 0.4,
                        "num_predict", 500
                ),
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", trimmedMessage)
                )
        );

        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(5))
                    .build();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(ollamaBaseUrl + "/api/chat"))
                    .timeout(Duration.ofSeconds(90))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody)))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 400) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Local AI model returned an error: " + response.body()
                );
            }

            JsonNode root = objectMapper.readTree(response.body());
            String reply = root.path("message").path("content").asText("").trim();

            if (reply.isEmpty()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Local AI model returned an empty response"
                );
            }

            return ParentAiChatResponse.builder()
                    .reply(reply)
                    .model(ollamaModel)
                    .build();
        } catch (IOException | InterruptedException error) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Could not reach the local AI model. Make sure Ollama is running."
            );
        }
    }

    private String buildChildrenSummary(List<User> children) {
        if (children.isEmpty()) {
            return "The parent has no children linked in the app yet.";
        }

        LocalDate today = LocalDate.now();
        LocalDateTime last30Days = LocalDateTime.now().minusDays(30);

        StringBuilder summary = new StringBuilder();

        for (User child : children) {
            List<ParentAssignedTask> allTasks = parentAssignedTaskRepository.findAllByChildIdOrderByCreatedAtDesc(child.getId());
            List<ParentAssignedReward> allRewards = parentAssignedRewardRepository.findAllByChildIdOrderByCreatedAtDesc(child.getId());
            List<UserPointsHistory> pointsHistory = userPointsHistoryRepository
                    .findAllByUserIdOrderByCreatedAtDescIdDesc(child.getId());

            List<ParentAssignedTask> recentTasks = allTasks.stream()
                    .filter(task -> task.getCreatedAt() != null && !task.getCreatedAt().isBefore(last30Days))
                    .toList();
            List<ParentAssignedTask> reviewedTasks = recentTasks.stream()
                    .filter(ParentAssignedTask::isReviewed)
                    .toList();
            List<ParentAssignedTask> approvedTasks = reviewedTasks.stream()
                    .filter(task -> Boolean.TRUE.equals(task.getApproved()))
                    .toList();
            List<ParentAssignedTask> rejectedTasks = reviewedTasks.stream()
                    .filter(task -> Boolean.FALSE.equals(task.getApproved()))
                    .toList();

            List<ParentAssignedReward> recentRewards = allRewards.stream()
                    .filter(reward -> reward.getCreatedAt() != null && !reward.getCreatedAt().isBefore(last30Days))
                    .toList();
            List<ParentAssignedReward> claimedRewards = recentRewards.stream()
                    .filter(ParentAssignedReward::isClaimed)
                    .toList();
            List<ParentAssignedReward> grantedRewards = recentRewards.stream()
                    .filter(ParentAssignedReward::isGranted)
                    .toList();

            long activeTasksToday = allTasks.stream()
                    .filter(task -> !task.isReviewed() && !task.isExpired())
                    .filter(task -> !today.isBefore(task.getStartDate()) && !today.isAfter(task.getEndDate()))
                    .count();
            long availableRewardsToday = allRewards.stream()
                    .filter(reward -> !reward.isClaimed() && !reward.isExpired())
                    .filter(reward -> !today.isBefore(reward.getStartDate()) && !today.isAfter(reward.getEndDate()))
                    .count();

            String strongTaskTypes = formatTopTypes(
                    approvedTasks.stream().collect(Collectors.groupingBy(task -> task.getType(), Collectors.counting()))
            );
            String difficultTaskTypes = formatTopTypes(
                    rejectedTasks.stream().collect(Collectors.groupingBy(task -> task.getType(), Collectors.counting()))
            );
            String favoriteRewardTypes = formatTopRewardTypes(
                    claimedRewards.stream().collect(Collectors.groupingBy(reward -> reward.getType(), Collectors.counting()))
            );

            Optional<UserPointsHistory> latestXpGain = pointsHistory.stream()
                    .filter(entry -> entry.getDeltaXp() > 0 || entry.getDeltaRewardPoints() > 0)
                    .findFirst();

            summary.append("""
                    - Child: %s
                      Level: %d, total XP: %d, reward points: %d
                      Today: %d active tasks, %d available rewards
                      Last 30 days: %d tasks assigned, %d reviewed, %d approved, %d rejected
                      Approval rate: %s
                      Reward activity last 30 days: %d claimed, %d granted
                      Strong task types: %s
                      Difficult task types: %s
                      Favorite reward types: %s
                      Recent points signal: %s
                    """.formatted(
                    child.getUsername(),
                    child.getLevel(),
                    child.getXp(),
                    child.getRewardPoints(),
                    activeTasksToday,
                    availableRewardsToday,
                    recentTasks.size(),
                    reviewedTasks.size(),
                    approvedTasks.size(),
                    rejectedTasks.size(),
                    formatRate(approvedTasks.size(), reviewedTasks.size()),
                    claimedRewards.size(),
                    grantedRewards.size(),
                    strongTaskTypes,
                    difficultTaskTypes,
                    favoriteRewardTypes,
                    latestXpGain
                            .map(entry -> entry.getDescription())
                            .orElse("No recent points history yet.")
            ));
        }

        return summary.toString().trim();
    }

    private String buildCatalogueSummary(User parent) {
        List<ParentCustomTask> customTasks = parentCustomTaskRepository.findAllByParentIdOrderByTitleAsc(parent.getId());
        List<ParentCustomReward> customRewards = parentCustomRewardRepository.findAllByParentIdOrderByTitleAsc(parent.getId());

        Map<String, Long> packageAgeGroups = parent.getCatalogPackages().stream()
                .collect(Collectors.groupingBy(pkg -> pkg.getAgeGroup() == null ? "unknown" : pkg.getAgeGroup(), LinkedHashMap::new, Collectors.counting()));

        Map<TaskType, Long> packageTaskTypes = parent.getCatalogPackages().stream()
                .flatMap(pkg -> pkg.getTasks() == null ? java.util.stream.Stream.empty() : pkg.getTasks().stream())
                .collect(Collectors.groupingBy(task -> task.getType(), Collectors.counting()));

        Map<RewardType, Long> packageRewardTypes = parent.getCatalogPackages().stream()
                .flatMap(pkg -> pkg.getRewards() == null ? java.util.stream.Stream.empty() : pkg.getRewards().stream())
                .collect(Collectors.groupingBy(reward -> reward.getType(), Collectors.counting()));

        Map<TaskType, Long> customTaskTypes = customTasks.stream()
                .collect(Collectors.groupingBy(ParentCustomTask::getType, Collectors.counting()));

        Map<RewardType, Long> customRewardTypes = customRewards.stream()
                .collect(Collectors.groupingBy(ParentCustomReward::getType, Collectors.counting()));

        return """
                Packages in catalogue: %d
                Package age groups: %s
                Package task type coverage: %s
                Package reward type coverage: %s
                Custom tasks: %d (%s)
                Custom rewards: %d (%s)
                """.formatted(
                parent.getCatalogPackages().size(),
                formatStringCounts(packageAgeGroups),
                formatTopTypes(packageTaskTypes),
                formatTopRewardTypes(packageRewardTypes),
                customTasks.size(),
                formatTopTypes(customTaskTypes),
                customRewards.size(),
                formatTopRewardTypes(customRewardTypes)
        ).trim();
    }

    private String formatRate(int numerator, int denominator) {
        if (denominator <= 0) {
            return "No reviewed tasks yet";
        }

        double percentage = (numerator * 100.0) / denominator;
        return String.format(java.util.Locale.ENGLISH, "%.0f%%", percentage);
    }

    private String formatTopTypes(Map<TaskType, Long> counts) {
        if (counts.isEmpty()) {
            return "No clear pattern yet";
        }

        return counts.entrySet().stream()
                .sorted(Map.Entry.<TaskType, Long>comparingByValue(Comparator.reverseOrder()))
                .limit(3)
                .map(entry -> humanize(entry.getKey().getValue()) + " (" + entry.getValue() + ")")
                .collect(Collectors.joining(", "));
    }

    private String formatTopRewardTypes(Map<RewardType, Long> counts) {
        if (counts.isEmpty()) {
            return "No clear pattern yet";
        }

        return counts.entrySet().stream()
                .sorted(Map.Entry.<RewardType, Long>comparingByValue(Comparator.reverseOrder()))
                .limit(3)
                .map(entry -> humanize(entry.getKey().getValue()) + " (" + entry.getValue() + ")")
                .collect(Collectors.joining(", "));
    }

    private String formatStringCounts(Map<String, Long> counts) {
        if (counts.isEmpty()) {
            return "No data";
        }

        return counts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder()))
                .limit(5)
                .map(entry -> entry.getKey() + " (" + entry.getValue() + ")")
                .collect(Collectors.joining(", "));
    }

    private String humanize(String value) {
        return value.replace('_', ' ');
    }
}
