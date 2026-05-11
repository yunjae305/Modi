package com.modi.service;

import com.modi.domain.AuthProvider;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class OAuthService {

    private final WebClient webClient = WebClient.builder().build();

    @Value("${modi.backend-url}")
    private String backendUrl;

    @Value("${modi.google.client-id}")
    private String googleClientId;

    @Value("${modi.google.client-secret}")
    private String googleClientSecret;

    @Value("${modi.kakao.client-id}")
    private String kakaoClientId;

    @Value("${modi.kakao.client-secret}")
    private String kakaoClientSecret;

    public boolean isConfigured(AuthProvider provider) {
        if (provider == AuthProvider.GOOGLE) {
            return hasText(googleClientId) && hasText(googleClientSecret);
        }
        if (provider == AuthProvider.KAKAO) {
            return hasText(kakaoClientId);
        }
        return true;
    }

    public String buildAuthorizeUrl(AuthProvider provider, String state) {
        if (!isConfigured(provider)) {
            throw new IllegalStateException(provider.name().toLowerCase() + " 로그인이 아직 설정되지 않았습니다.");
        }
        String redirectUri = redirectUri(provider);
        if (provider == AuthProvider.GOOGLE) {
            return "https://accounts.google.com/o/oauth2/v2/auth"
                + "?response_type=code"
                + "&client_id=" + encode(googleClientId)
                + "&redirect_uri=" + encode(redirectUri)
                + "&scope=" + encode("openid email profile")
                + "&state=" + encode(state);
        }
        return "https://kauth.kakao.com/oauth/authorize"
            + "?response_type=code"
            + "&client_id=" + encode(kakaoClientId)
            + "&redirect_uri=" + encode(redirectUri)
            + "&scope=" + encode("profile_nickname profile_image account_email")
            + "&state=" + encode(state);
    }

    public OAuthProfile fetchProfile(AuthProvider provider, String code) {
        if (provider == AuthProvider.GOOGLE) {
            Map<String, Object> token = requestToken(
                "https://oauth2.googleapis.com/token",
                form("authorization_code", googleClientId, googleClientSecret, redirectUri(provider), code)
            );
            String accessToken = String.valueOf(token.get("access_token"));
            Map<String, Object> profile = requestUserInfo("https://openidconnect.googleapis.com/v1/userinfo", accessToken);
            return new OAuthProfile(
                String.valueOf(profile.get("sub")),
                stringValue(profile.get("email")),
                stringValue(profile.get("name")),
                stringValue(profile.get("picture"))
            );
        }
        Map<String, Object> token = requestToken(
            "https://kauth.kakao.com/oauth/token",
            form("authorization_code", kakaoClientId, kakaoClientSecret, redirectUri(provider), code)
        );
        String accessToken = String.valueOf(token.get("access_token"));
        Map<String, Object> profile = requestUserInfo("https://kapi.kakao.com/v2/user/me", accessToken);
        Map<String, Object> kakaoAccount = mapValue(profile.get("kakao_account"));
        Map<String, Object> kakaoProfile = mapValue(kakaoAccount.get("profile"));
        return new OAuthProfile(
            String.valueOf(profile.get("id")),
            stringValue(kakaoAccount.get("email")),
            stringValue(kakaoProfile.get("nickname")),
            stringValue(kakaoProfile.get("profile_image_url"))
        );
    }

    private MultiValueMap<String, String> form(String grantType, String clientId, String clientSecret, String redirectUri, String code) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", grantType);
        form.add("client_id", clientId);
        if (hasText(clientSecret)) {
            form.add("client_secret", clientSecret);
        }
        form.add("redirect_uri", redirectUri);
        form.add("code", code);
        return form;
    }

    private Map<String, Object> requestToken(String uri, MultiValueMap<String, String> form) {
        return webClient.post()
            .uri(uri)
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(BodyInserters.fromFormData(form))
            .retrieve()
            .bodyToMono(Map.class)
            .block();
    }

    private Map<String, Object> requestUserInfo(String uri, String accessToken) {
        return webClient.get()
            .uri(uri)
            .headers(headers -> headers.setBearerAuth(accessToken))
            .retrieve()
            .bodyToMono(Map.class)
            .block();
    }

    private String redirectUri(AuthProvider provider) {
        return backendUrl + "/api/auth/oauth/" + provider.name().toLowerCase() + "/callback";
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String stringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private Map<String, Object> mapValue(Object value) {
        if (value instanceof Map<?, ?> map) {
            return (Map<String, Object>) map;
        }
        return Map.of();
    }
}
