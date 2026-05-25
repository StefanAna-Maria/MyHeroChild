package com.myherochild.backend.user;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "user_claimed_avatars",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_user_claimed_avatar", columnNames = {"user_id", "avatar_id"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserClaimedAvatar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "avatar_id", nullable = false)
    private AvatarDefinition avatar;

    @Column(name = "claimed_at", nullable = false)
    private LocalDateTime claimedAt;
}
