package com.modi.service;

import com.modi.domain.AuthProvider;
import com.modi.domain.UserAccount;
import com.modi.repository.UserAccountRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.util.Base64;
import java.util.UUID;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Long INITIAL_CASH = 1000000000L;
    private static final String PASSWORD_ALGORITHM = "PBKDF2WithHmacSHA256";
    private static final String PASSWORD_PREFIX = "pbkdf2";
    private static final Integer PASSWORD_ITERATIONS = 120000;
    private static final Integer PASSWORD_KEY_LENGTH = 256;

    private final UserAccountRepository userAccountRepository;
    private final TokenService tokenService;
    private final SecureRandom secureRandom = new SecureRandom();

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

    @Transactional
    public UserAccount registerEmail(String email, String password, String nickname) {
        String normalizedEmail = normalizeAndValidateEmail(email);
        validatePassword(password);
        String normalizedNickname = normalizeNickname(nickname);
        userAccountRepository.findByProviderAndProviderId(AuthProvider.EMAIL, normalizedEmail)
            .ifPresent(user -> {
                throw new IllegalStateException("이미 가입된 이메일입니다.");
            });
        return userAccountRepository.save(new UserAccount(
            AuthProvider.EMAIL,
            normalizedEmail,
            normalizedEmail,
            normalizedNickname,
            null,
            createPasswordHash(password),
            INITIAL_CASH
        ));
    }

    @Transactional(readOnly = true)
    public UserAccount loginEmail(String email, String password) {
        String normalizedEmail = normalizeAndValidateEmail(email);
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
        UserAccount user = userAccountRepository.findByProviderAndProviderId(AuthProvider.EMAIL, normalizedEmail)
            .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다."));
        if (user.getPasswordHash() == null || !verifyPasswordHash(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
        return user;
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

    private String normalizeAndValidateEmail(String email) {
        String normalizedEmail = (email == null ? "" : email).trim().toLowerCase();
        if (!normalizedEmail.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new IllegalArgumentException("이메일 형식이 올바르지 않습니다.");
        }
        return normalizedEmail;
    }

    private void validatePassword(String password) {
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("비밀번호는 8자 이상이어야 합니다.");
        }
    }

    private String normalizeNickname(String nickname) {
        String normalizedNickname = (nickname == null ? "" : nickname).trim();
        if (normalizedNickname.length() < 2) {
            throw new IllegalArgumentException("닉네임은 2자 이상이어야 합니다.");
        }
        return normalizedNickname;
    }

    private String createPasswordHash(String password) {
        byte[] salt = new byte[16];
        secureRandom.nextBytes(salt);
        byte[] hash = passwordHash(password, salt, PASSWORD_ITERATIONS);
        return PASSWORD_PREFIX
            + "$" + PASSWORD_ITERATIONS
            + "$" + Base64.getUrlEncoder().withoutPadding().encodeToString(salt)
            + "$" + Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
    }

    private boolean verifyPasswordHash(String password, String savedHash) {
        String[] parts = savedHash.split("\\$");
        if (parts.length != 4 || !PASSWORD_PREFIX.equals(parts[0])) {
            return false;
        }
        try {
            int iterations = Integer.parseInt(parts[1]);
            byte[] salt = Base64.getUrlDecoder().decode(parts[2]);
            byte[] expectedHash = Base64.getUrlDecoder().decode(parts[3]);
            byte[] actualHash = passwordHash(password, salt, iterations);
            return MessageDigest.isEqual(actualHash, expectedHash);
        } catch (RuntimeException exception) {
            return false;
        }
    }

    private byte[] passwordHash(String password, byte[] salt, int iterations) {
        PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, iterations, PASSWORD_KEY_LENGTH);
        try {
            return SecretKeyFactory.getInstance(PASSWORD_ALGORITHM).generateSecret(spec).getEncoded();
        } catch (InvalidKeySpecException | java.security.NoSuchAlgorithmException exception) {
            throw new IllegalStateException("비밀번호를 처리하지 못했습니다.");
        } finally {
            spec.clearPassword();
        }
    }
}
