package com.myherochild.backend.user;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "avatars")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvatarDefinition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "min_lvl", nullable = false)
    private int minLevel;

    @Column(name = "img_avatar", nullable = false, unique = true)
    private String imageAvatar;
}
