package com.modi.controller;

import com.modi.common.ApiResponse;
import com.modi.domain.AuthProvider;
import com.modi.domain.UserAccount;
import com.modi.dto.AuthDtos;
import com.modi.service.AuthService;
import com.modi.service.OAuthProfile;
import com.modi.service.OAuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final OAuthService oAuthService;

    @Value("${modi.frontend-url}")
    private String frontendUrl;

    @Value("${modi.session-cookie-name}")
    private String sessionCookieName;

    @Value("${modi.oauth-state-cookie-name}")
    private String oauthStateCookieName;

    public AuthController(AuthService authService, OAuthService oAuthService) {
        this.authService = authService;
        this.oAuthService = oAuthService;
    }

    @GetMapping("/providers")
    public ApiResponse<AuthDtos.ProviderStatus> providers() {
        return ApiResponse.success(new AuthDtos.ProviderStatus(Map.of(
            "google", oAuthService.isConfigured(AuthProvider.GOOGLE),
            "kakao", oAuthService.isConfigured(AuthProvider.KAKAO),
            "guest", true
        )));
    }

    @GetMapping("/oauth/{provider}/authorize")
    public ResponseEntity<Void> authorize(@PathVariable String provider) {
        AuthProvider authProvider = provider(provider);
        String state = UUID.randomUUID().toString();
        String authUrl = oAuthService.buildAuthorizeUrl(authProvider, state);
        return ResponseEntity.status(302)
            .header(HttpHeaders.LOCATION, authUrl)
            .header(HttpHeaders.SET_COOKIE, stateCookie(state).toString())
            .build();
    }

    @GetMapping("/oauth/{provider}/callback")
    public void callback(
        @PathVariable String provider,
        @RequestParam String code,
        @RequestParam String state,
        HttpServletRequest request,
        HttpServletResponse response
    ) throws IOException {
        validateState(request, state);
        AuthProvider authProvider = provider(provider);
        OAuthProfile profile = oAuthService.fetchProfile(authProvider, code);
        UserAccount user = authService.loginOAuth(authProvider, profile);
        response.addHeader(HttpHeaders.SET_COOKIE, sessionCookie(authService.createSessionToken(user)).toString());
        response.addHeader(HttpHeaders.SET_COOKIE, expiredCookie(oauthStateCookieName).toString());
        response.sendRedirect(frontendUrl + "/login/callback");
    }

    @PostMapping("/guest")
    public ResponseEntity<ApiResponse<AuthDtos.UserInfo>> guest() {
        UserAccount user = authService.loginGuest();
        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, sessionCookie(authService.createSessionToken(user)).toString())
            .body(ApiResponse.success(new AuthDtos.UserInfo(user)));
    }

    @GetMapping("/me")
    public ApiResponse<AuthDtos.UserInfo> me(HttpServletRequest request) {
        UserAccount user = authService.requireUser(request, sessionCookieName);
        return ApiResponse.success(new AuthDtos.UserInfo(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, expiredCookie(sessionCookieName).toString())
            .body(ApiResponse.success("success"));
    }

    private AuthProvider provider(String provider) {
        return AuthProvider.valueOf(provider.toUpperCase());
    }

    private void validateState(HttpServletRequest request, String state) {
        String savedState = cookieValue(request, oauthStateCookieName);
        if (savedState == null || !savedState.equals(state)) {
            throw new IllegalArgumentException("OAuth state가 올바르지 않습니다.");
        }
    }

    private String cookieValue(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (name.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private ResponseCookie stateCookie(String value) {
        return ResponseCookie.from(oauthStateCookieName, value)
            .path("/")
            .httpOnly(true)
            .sameSite("Lax")
            .maxAge(Duration.ofMinutes(10))
            .build();
    }

    private ResponseCookie sessionCookie(String value) {
        return ResponseCookie.from(sessionCookieName, value)
            .path("/")
            .httpOnly(true)
            .sameSite("Lax")
            .maxAge(Duration.ofDays(14))
            .build();
    }

    private ResponseCookie expiredCookie(String name) {
        return ResponseCookie.from(name, "")
            .path("/")
            .httpOnly(true)
            .sameSite("Lax")
            .maxAge(0)
            .build();
    }
}
