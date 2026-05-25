package com.myherochild.backend.child;

import com.myherochild.backend.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "child_daily_bonus_state")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChildDailyBonusState {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "child_id", nullable = false, unique = true)
    private User child;

    @Column(name = "bonus_date", nullable = false)
    private LocalDate bonusDate;

    @Builder.Default
    @Column(nullable = false)
    private boolean claimed = false;

    @Column(name = "claimed_at")
    private LocalDateTime claimedAt;

    @Column(name = "restricted_until")
    private LocalDateTime restrictedUntil;

    @Column(name = "restriction_notified_for_date")
    private LocalDate restrictionNotifiedForDate;
}
