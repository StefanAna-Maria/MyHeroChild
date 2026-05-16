package com.myherochild.backend.packages;

import com.myherochild.backend.common.model.TaskType;
import com.myherochild.backend.common.model.TaskTypeConverter;
import jakarta.persistence.*;
import org.hibernate.annotations.ColumnTransformer;
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

    @Convert(converter = TaskTypeConverter.class)
    @Column(nullable = false, columnDefinition = "task_type")
    @ColumnTransformer(write = "?::task_type")
    private TaskType type;

    @ManyToOne
    @JoinColumn(name = "package_id")
    private Package pkg;
}
