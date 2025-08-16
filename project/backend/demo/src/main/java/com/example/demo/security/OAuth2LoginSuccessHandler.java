package com.example.demo.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

// Make it as Spring Bean so it can be injected into SecurityConfig
// Create interface called right after Oauth2 login succeeds
@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    // Dependency injection (Constructor)
    private final JwtUtil jwtUtil; // util class for creating and validating JWTs
    private final String redirectSuccess; // Forntend redirect URL

    
    public OAuth2LoginSuccessHandler(
            JwtUtil jwtUtil,
            @Value("${frontend.redirect-success}") String redirectSuccess
    ) {
        this.jwtUtil = jwtUtil;
        this.redirectSuccess = redirectSuccess;
    }

    // Main function for success Method
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        // 1) The user information from Google
        OidcUser user = (OidcUser) authentication.getPrincipal();
        String email = user.getEmail();
        String name  = user.getFullName(); 

        // 2) Create JWT (I can put whatever I want)
        String jwt = jwtUtil.generate(
                Map.of(
                    "email", email,
                    "name",  name,
                    "sub",   user.getSubject()
                ),
                email
        );

        // 3) Storing the JWT in an HttpOnly Cookie
        Cookie cookie = new Cookie("APP_AUTH", jwt);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(60 * 60 * 2); // 2 hour

        // local development: Not an HTTP so false
        // In production,suggest " true + SameSite=None ""
        cookie.setSecure(false);
        // If deploy in production:
        // response.setHeader("Set-Cookie",
        //   "APP_AUTH=" + jwt + "; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=7200");

        response.addCookie(cookie);

        // 4) Redirect to frontend 
        String q = "name=" + URLEncoder.encode(name == null ? "" : name, StandardCharsets.UTF_8);
        response.sendRedirect("http://localhost:5173/auth/callback");
    }
}