package com.modi.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "user_account",
    uniqueConstraints = @UniqueConstraint(name = "uk_user_provider", columnNames = {"provider", "provider_id"})
)
public class UserAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false)
    private AuthProvider provider;

    @Column(name = "provider_id", nullable = false)
    private String providerId;

    @Column(name = "email")
    private String email;

    @Column(name = "nickname", nullable = false)
    private String nickname;

    @Column(name = "profile_image")
    private String profileImage;

    @Column(name = "seed_money", nullable = false)
    private Long seedMoney;

    @Column(name = "cash", nullable = false)
    private Long cash;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    protected UserAccount() {
    }

    public UserAccount(AuthProvider provider, String providerId, String email, String nickname, String profileImage, Long seedMoney) {
        this.provider = provider;
        this.providerId = providerId;
        this.email = email;
        this.nickname = nickname;
        this.profileImage = profileImage;
        this.seedMoney = seedMoney;
        this.cash = seedMoney;
        this.createdAt = LocalDateTime.now();
    }

    public void updateProfile(String email, String nickname, String profileImage) {
        this.email = email;
        this.nickname = nickname;
        this.profileImage = profileImage;
    }

    public void updateCash(Long cash) {
        this.cash = cash;
    }

    public Long getId() {
        return id;
    }

    public AuthProvider getProvider() {
        return provider;
    }

    public String getProviderId() {
        return providerId;
    }

    public String getEmail() {
        return email;
    }

    public String getNickname() {
        return nickname;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public Long getSeedMoney() {
        return seedMoney;
    }

    public Long getCash() {
        return cash;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
