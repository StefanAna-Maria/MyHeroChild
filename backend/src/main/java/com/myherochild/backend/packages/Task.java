package com.myherochild.backend.packages;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tasks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private int xp;

    @Column(name = "reward_points")
    private int rewardPoints;

    private String type;

    @ManyToOne
    @JoinColumn(name = "package_id")
    private Package pkg;
}