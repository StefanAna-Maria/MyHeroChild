package com.myherochild.backend.parent;

import com.myherochild.backend.common.model.TaskType;
import com.myherochild.backend.common.model.TaskTypeConverter;
import com.myherochild.backend.user.User;
import jakarta.persistence.*;
import org.hibernate.annotations.ColumnTransformer;
import lombok.*;

@Entity
@Table(name = "parent_custom_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParentCustomTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private int xp;

    @Column(name = "reward_points", nullable = false)
    private int rewardPoints;

    @Convert(converter = TaskTypeConverter.class)
    @Column(nullable = false, columnDefinition = "task_type")
    @ColumnTransformer(write = "?::task_type")
    private TaskType type;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parent_id", nullable = false)
    private User parent;
}
