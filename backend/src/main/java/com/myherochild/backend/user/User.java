package com.myherochild.backend.user;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(unique = true)
    private String parentCode;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private User parent;

    @Builder.Default
    @Column(nullable = false)
    private int level = 1;


    @Builder.Default
    @Column(nullable = false)
    private int xp = 0;

    @Builder.Default
    @Column(nullable = false)
    private int rewardPoints = 0;
}
