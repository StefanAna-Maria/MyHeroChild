package com.myherochild.backend.parent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.myherochild.backend.common.exception.BusinessException;
import com.myherochild.backend.parent.dto.ParentAiChatResponse;
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
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ParentAiService {

    private final UserRepository userRepository;
    private final ParentAssignedTaskRepository parentAssignedTaskRepository;
    private final ParentAssignedRewardRepository parentAssignedRewardRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.ai.ollama.base-url:http://127.0.0.1:11434}")
    private String ollamaBaseUrl;

    @Value("${app.ai.ollama.model:llama3:8b-instruct-q4_K_M}")
    private String ollamaModel;

    public ParentAiChatResponse chat(String username, String message) {
        User parent = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("User not found"));

        if (parent.getRole() != UserRole.PARENT) {
            throw new BusinessException("Only parents can access AI SuperNanny");
        }

        String trimmedMessage = message == null ? "" : message.trim();
        if (trimmedMessage.isEmpty()) {
            throw new BusinessException("Message is required");
        }

        List<User> children = userRepository.findAllByParentIdAndRoleOrderByUsernameAsc(parent.getId(), UserRole.CHILD);
        LocalDate today = LocalDate.now();

        StringBuilder childSummary = new StringBuilder();
        if (children.isEmpty()) {
            childSummary.append("The parent has no children linked in the app yet.");
        } else {
            for (User child : children) {
                long activeTasks = parentAssignedTaskRepository
                        .countByChildIdAndReviewedFalseAndExpiredFalseAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                                child.getId(),
                                today,
                                today
                        );
                long availableRewards = parentAssignedRewardRepository
                        .countByChildIdAndClaimedFalseAndExpiredFalseAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                                child.getId(),
                                today,
                                today
                        );

                childSummary
                        .append("- Child: ").append(child.getUsername())
                        .append(", level ").append(child.getLevel())
                        .append(", xp ").append(child.getXp())
                        .append(", reward points ").append(child.getRewardPoints())
                        .append(", active tasks today ").append(activeTasks)
                        .append(", available rewards today ").append(availableRewards)
                        .append(". ");
            }
        }

        String systemPrompt = """
                You are AI SuperNanny, a warm and practical parenting assistant inside the MyHeroChild app.
                Your job is to help parents choose suitable tasks and rewards for their children.
                Base your suggestions on the app context below and on the parent's message.
                Keep responses concise, supportive, and actionable.
                Do not invent private data that is not present.
                If the parent asks for recommendations, suggest concrete task ideas or reward ideas and explain briefly why they fit.
                App context:
                Parent username: %s
                Children summary:
                %s
                """.formatted(parent.getUsername(), childSummary);

        Map<String, Object> requestBody = Map.of(
                "model", ollamaModel,
                "stream", false,
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
                        "Local AI model returned an error"
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
}
