package com.myherochild.backend.parent;

import com.myherochild.backend.common.model.RewardType;
import com.myherochild.backend.common.model.RewardTypeConverter;
import com.myherochild.backend.user.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "parent_custom_rewards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParentCustomReward {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private int price;

    @Convert(converter = RewardTypeConverter.class)
    @Column(nullable = false, columnDefinition = "reward_type")
    private RewardType type;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parent_id", nullable = false)
    private User parent;
}
