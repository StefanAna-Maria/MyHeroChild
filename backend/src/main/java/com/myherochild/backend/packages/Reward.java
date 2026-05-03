package com.myherochild.backend.packages;

import jakarta.persistence.*;
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

    private String type;

    //private String image;

    @ManyToOne
    @JoinColumn(name = "package_id")
    private Package pkg;
}