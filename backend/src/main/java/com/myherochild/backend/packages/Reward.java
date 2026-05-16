package com.myherochild.backend.packages;

import com.myherochild.backend.common.model.RewardType;
import com.myherochild.backend.common.model.RewardTypeConverter;
import jakarta.persistence.*;
import org.hibernate.annotations.ColumnTransformer;
import lombok.*;

@Entity
@Table(name = "rewards")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Reward {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private int price;

    @Convert(converter = RewardTypeConverter.class)
    @Column(nullable = false, columnDefinition = "reward_type")
    @ColumnTransformer(write = "?::reward_type")
    private RewardType type;

    //private String image;

    @ManyToOne
    @JoinColumn(name = "package_id")
    private Package pkg;
}
