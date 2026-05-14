package com.myherochild.backend.parent;

import com.myherochild.backend.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "child_assigned_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParentAssignedTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "parent_id", nullable = false)
    private User parent;

    @ManyToOne
    @JoinColumn(name = "child_id", nullable = false)
    private User child;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private int xp;

    @Column(name = "reward_points", nullable = false)
    private int rewardPoints;

    private String type;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Builder.Default
    @Column(nullable = false)
    private boolean completed = false;

    @Builder.Default
    @Column(name = "completion_requested", nullable = false)
    private boolean completionRequested = false;

    @Column(name = "completion_requested_at")
    private LocalDateTime completionRequestedAt;

    @Column(name = "source_kind", nullable = false)
    private String sourceKind;

    @Column(name = "source_id")
    private Long sourceId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
