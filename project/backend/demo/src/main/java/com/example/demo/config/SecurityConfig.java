package com.example.demo.config;

import com.example.demo.security.OAuth2LoginSuccessHandler;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;

// Spring setting class
@Configuration
public class SecurityConfig {
    // Inject our custom OAuth2LoginSuccessHandler
    private final OAuth2LoginSuccessHandler successHandler;

    public SecurityConfig(OAuth2LoginSuccessHandler successHandler) {
        this.successHandler = successHandler;
    }

    // Construct a chain that passes all the HTTP request
    // Set "CORS/CSRF/ Authorization/OAUTH2/Logout"
    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
          .csrf(csrf -> csrf.disable())
          .cors(cors -> cors.configurationSource(req -> {
              var c = new CorsConfiguration();
              c.setAllowedOrigins(List.of("http://localhost:5173")); // 배포 도메인도 추후 추가
              c.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
              c.setAllowedHeaders(List.of("*"));
              c.setAllowCredentials(true);
              return c;
          }))
          .authorizeHttpRequests(auth -> auth
              .requestMatchers(HttpMethod.GET, "/", "/api/hello", "/api/public").permitAll()
              .requestMatchers("/oauth2/**", "/login/**").permitAll()
              .anyRequest().authenticated()
          )
          .oauth2Login(oauth -> oauth
              .successHandler(successHandler) // if success then execute
          )
          .logout(logout -> logout
              .logoutUrl("/api/logout")
              .deleteCookies("APP_AUTH")
          );

        return http.build();
    }
}