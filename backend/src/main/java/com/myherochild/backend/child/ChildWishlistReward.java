package com.myherochild.backend.child;

import com.myherochild.backend.common.model.RewardType;
import com.myherochild.backend.common.model.RewardTypeConverter;
import com.myherochild.backend.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnTransformer;

import java.time.LocalDateTime;

@Entity
@Table(name = "child_wishlist_rewards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChildWishlistReward {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    private User child;

    @Column(nullable = false)
    private String title;

    @Convert(converter = RewardTypeConverter.class)
    @Column(nullable = false, columnDefinition = "reward_type")
    @ColumnTransformer(write = "?::reward_type")
    private RewardType type;

    @Builder.Default
    @Column(name = "added_to_parent_catalogue", nullable = false)
    private boolean addedToParentCatalogue = false;

    @Column(name = "added_to_parent_catalogue_at")
    private LocalDateTime addedToParentCatalogueAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
