package com.modi.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.time.Duration;
import java.util.Date;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TokenService {

    @Value("${modi.jwt-secret}")
    private String secretKey;

    public String createSessionToken(Long userId) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + Duration.ofDays(14).toMillis());
        Claims claims = Jwts.claims().setSubject(userId.toString());
        return Jwts.builder()
            .setClaims(claims)
            .setIssuedAt(now)
            .setExpiration(validity)
            .signWith(SignatureAlgorithm.HS256, secretKey)
            .compact();
    }

    public Long parseUserId(String token) {
        return Long.parseLong(
            Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject()
        );
    }
}
