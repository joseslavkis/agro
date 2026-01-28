package com.agro.config.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

    @Autowired
    JwtAuthFilter(JwtService jwtService,
            org.springframework.security.core.userdetails.UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        this.authenticateToken(request);
        filterChain.doFilter(request, response);
    }

    private void authenticateToken(HttpServletRequest request) {
        // Is the user already authenticated?
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            return;
        }

        // Try to get the token
        String authHeader = request.getHeader("Authorization");
        String headerPrefix = "Bearer ";
        if (authHeader == null || !authHeader.startsWith(headerPrefix)) {
            return;
        }
        String token = authHeader.substring(headerPrefix.length());

        jwtService.extractVerifiedUserDetails(token).ifPresent(jwtInfo -> {
            // Load the full User entity from DB
            org.springframework.security.core.userdetails.UserDetails userDetails = userDetailsService
                    .loadUserByUsername(jwtInfo.username());

            var authToken = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities());
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        });
    }
}
