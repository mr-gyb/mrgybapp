// JWT Issuance: Create a signed token with user information
// JWT Verification: Checked the signatures counterfeit/expiration of incoming tokens
// Then Login success handler drops the token that you created to the Http Only Cookie
// Verify the token of a cookie when processing a request.

package com.example.demo.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

    private final SecretKey key; // HMAC signature
    private final long expiryMillis; // Token expired time

    // Constructor - produce the key 
    public JwtUtil(
        // @Value: Add the data from application.yml
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiry-minutes}") long expiryMinutes
    ) {
        // key at least 32 bytes
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        // Convert ms 
        this.expiryMillis = expiryMinutes * 60_000;
    }

    /* Create JWT */
    public String generate(Map<String, Object> claims, String subject) {
        Instant now = Instant.now();
        return Jwts.builder()
                .setClaims(claims)          // custom data
                .setSubject(subject)        // user's email and ID 
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusMillis(expiryMillis)))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /* signature/expiration verification + Get Claim */
    public Jws<Claims> parseAndValidate(String jwt) throws JwtException {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(jwt);
    }

    /* Check if it is expired */
    public boolean isExpired(String jwt) {
        try {
            Date exp = parseAndValidate(jwt).getBody().getExpiration();
            return exp.before(new Date());
        } catch (JwtException e) {
            return true; // error handling
        }
    }
}