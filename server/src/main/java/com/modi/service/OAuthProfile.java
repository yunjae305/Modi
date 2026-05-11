package com.modi.service;

public class OAuthProfile {

    private String providerId;
    private String email;
    private String nickname;
    private String profileImage;

    public OAuthProfile(String providerId, String email, String nickname, String profileImage) {
        this.providerId = providerId;
        this.email = email;
        this.nickname = nickname;
        this.profileImage = profileImage;
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
}
