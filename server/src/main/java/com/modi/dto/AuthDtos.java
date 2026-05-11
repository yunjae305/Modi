package com.modi.dto;

import com.modi.domain.AuthProvider;
import com.modi.domain.UserAccount;
import java.time.LocalDateTime;
import java.util.Map;

public class AuthDtos {

    public static class ProviderStatus {
        private Map<String, Boolean> providers;

        public ProviderStatus(Map<String, Boolean> providers) {
            this.providers = providers;
        }

        public Map<String, Boolean> getProviders() {
            return providers;
        }
    }

    public static class UserInfo {
        private Long id;
        private AuthProvider provider;
        private String nickname;
        private String email;
        private String profileImage;
        private Long seedMoney;
        private Long cash;
        private LocalDateTime createdAt;

        public UserInfo(UserAccount user) {
            this.id = user.getId();
            this.provider = user.getProvider();
            this.nickname = user.getNickname();
            this.email = user.getEmail();
            this.profileImage = user.getProfileImage();
            this.seedMoney = user.getSeedMoney();
            this.cash = user.getCash();
            this.createdAt = user.getCreatedAt();
        }

        public Long getId() {
            return id;
        }

        public AuthProvider getProvider() {
            return provider;
        }

        public String getNickname() {
            return nickname;
        }

        public String getEmail() {
            return email;
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
}
