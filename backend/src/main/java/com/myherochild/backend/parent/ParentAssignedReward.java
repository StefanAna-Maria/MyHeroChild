package com.myherochild.backend.parent;

import com.myherochild.backend.common.model.RewardType;
import com.myherochild.backend.common.model.RewardTypeConverter;
import com.myherochild.backend.user.User;
import jakarta.persistence.*;
import org.hibernate.annotations.ColumnTransformer;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "child_assigned_rewards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParentAssignedReward {

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
    private int price;

    @Convert(converter = RewardTypeConverter.class)
    @Column(nullable = false, columnDefinition = "reward_type")
    @ColumnTransformer(write = "?::reward_type")
    private RewardType type;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Builder.Default
    @Column(nullable = false)
    private boolean claimed = false;

    @Column(name = "claimed_at")
    private LocalDateTime claimedAt;

    @Column(name = "source_kind", nullable = false)
    private String sourceKind;

    @Column(name = "source_id")
    private Long sourceId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
