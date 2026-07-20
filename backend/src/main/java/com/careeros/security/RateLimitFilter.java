package com.careeros.security;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitFilter.class);
    private final Map<String, Bucket> apiBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> aiBuckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        logger.debug("RateLimitFilter: path={}, auth={}", path, auth);

        // Only rate limit authenticated users (exclude anonymous users for login/register)
        if (auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken)) {
            String userId = auth.getName();
            logger.debug("Rate limiting for user: {}", userId);

            // General API Rate Limit: 100 requests per hour
            Bucket apiBucket = apiBuckets.computeIfAbsent(userId, key -> createApiBucket());
            if (!apiBucket.tryConsume(1)) {
                logger.warn("Rate limit exceeded for user: {} (General API)", userId);
                response.setStatus(429);
                response.setHeader("Retry-After", "3600");
                response.getWriter().write("Too many API requests. Limit is 100 per hour.");
                return;
            }

            // AI Specific Rate Limit: 5 requests per day
            if (path.contains("/api/resumes/analyze") || (path.contains("/api/resumes") && request.getMethod().equals("POST"))) {
                Bucket aiBucket = aiBuckets.computeIfAbsent(userId, key -> createAiBucket());
                if (!aiBucket.tryConsume(1)) {
                    logger.warn("Rate limit exceeded for user: {} (AI Services)", userId);
                    response.setStatus(429);
                    response.setHeader("Retry-After", "86400");
                    response.getWriter().write("Too many AI requests. Limit is 5 per day.");
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private Bucket createApiBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.classic(100, Refill.intervally(100, Duration.ofHours(1))))
                .build();
    }

    private Bucket createAiBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.classic(5, Refill.intervally(5, Duration.ofDays(1))))
                .build();
    }
}
