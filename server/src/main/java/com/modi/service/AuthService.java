package com.modi.service;

import com.modi.domain.AuthProvider;
import com.modi.domain.UserAccount;
import com.modi.repository.UserAccountRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Long INITIAL_CASH = 1000000000L;

    private final UserAccountRepository userAccountRepository;
    private final TokenService tokenService;

    public AuthService(UserAccountRepository userAccountRepository, TokenService tokenService) {
        this.userAccountRepository = userAccountRepository;
        this.tokenService = tokenService;
    }

    @Transactional
    public UserAccount loginOAuth(AuthProvider provider, OAuthProfile profile) {
        return userAccountRepository.findByProviderAndProviderId(provider, profile.getProviderId())
            .map(user -> {
                user.updateProfile(profile.getEmail(), profile.getNickname(), profile.getProfileImage());
                return user;
            })
            .orElseGet(() -> userAccountRepository.save(
                new UserAccount(
                    provider,
                    profile.getProviderId(),
                    profile.getEmail(),
                    profile.getNickname() == null || profile.getNickname().isBlank() ? provider.name() + " 사용자" : profile.getNickname(),
                    profile.getProfileImage(),
                    INITIAL_CASH
                )
            ));
    }

    @Transactional
    public UserAccount loginGuest() {
        String providerId = "guest-" + UUID.randomUUID();
        return userAccountRepository.save(new UserAccount(AuthProvider.GUEST, providerId, null, "게스트 투자자", null, INITIAL_CASH));
    }

    public String createSessionToken(UserAccount user) {
        return tokenService.createSessionToken(user.getId());
    }

    public UserAccount requireUser(HttpServletRequest request, String cookieName) {
        String token = sessionToken(request, cookieName);
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }
        Long userId = tokenService.parseUserId(token);
        return userAccountRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    private String sessionToken(HttpServletRequest request, String cookieName) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (cookieName.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
