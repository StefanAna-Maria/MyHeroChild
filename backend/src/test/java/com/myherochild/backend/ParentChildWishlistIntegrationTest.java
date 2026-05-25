package com.myherochild.backend;

import com.myherochild.backend.child.ChildWishlistReward;
import com.myherochild.backend.child.ChildWishlistRewardRepository;
import com.myherochild.backend.common.model.RewardType;
import com.myherochild.backend.parent.ParentProfileService;
import com.myherochild.backend.parent.dto.ParentChildWishlistResponse;
import com.myherochild.backend.user.User;
import com.myherochild.backend.user.UserRepository;
import com.myherochild.backend.user.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class ParentChildWishlistIntegrationTest {

    @Autowired
    private ParentProfileService parentProfileService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChildWishlistRewardRepository childWishlistRewardRepository;

    @Test
    void parentCanLoadNonEmptyChildWishlist() {
        String unique = String.valueOf(System.nanoTime());

        User parent = userRepository.save(User.builder()
                .username("wishlist_parent_" + unique)
                .email("wishlist_parent_" + unique + "@test.com")
                .passwordHash("secret")
                .role(UserRole.PARENT)
                .createdAt(LocalDateTime.now())
                .avatar("robot")
                .build());

        User child = userRepository.save(User.builder()
                .username("wishlist_child_" + unique)
                .email("wishlist_child_" + unique + "@test.com")
                .passwordHash("secret")
                .role(UserRole.CHILD)
                .createdAt(LocalDateTime.now())
                .avatar("dragon")
                .parent(parent)
                .build());

        childWishlistRewardRepository.save(ChildWishlistReward.builder()
                .child(child)
                .title("New Toy Car")
                .type(RewardType.TOY)
                .createdAt(LocalDateTime.now())
                .build());

        ParentChildWishlistResponse response =
                parentProfileService.getChildWishlist(parent.getUsername(), child.getId());

        assertThat(response.getChildId()).isEqualTo(child.getId());
        assertThat(response.getChildName()).isEqualTo(child.getUsername());
        assertThat(response.getRewards()).hasSize(1);
        assertThat(response.getRewards().getFirst().getTitle()).isEqualTo("New Toy Car");
        assertThat(response.getRewards().getFirst().getType()).isEqualTo("toy");
    }
}
