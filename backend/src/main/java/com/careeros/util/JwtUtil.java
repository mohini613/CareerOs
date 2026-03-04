package com.careeros.util;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;
@Component
public class JwtUtil {
    @Value("${jwt.secret:careerOsSecretKeyForJwtTokenGenerationThatIsLongEnoughForHS256Algorithm}")
    private String secret;

    private SecretKey getSigninKey(){
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
    // Token validity period in milliseconds (e.g., 1 hour)
    private static final long EXPIRATION_MILLIS = 60 * 60 * 1000;

    public String generateToken(String email, Long userId){
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + EXPIRATION_MILLIS);

        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigninKey())
                .compact();
    }
    public String getEmailFromToken(String token){
         Claims claims =Jwts.parser()
                .verifyWith(getSigninKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

                return claims.getSubject();
    }
    public Long getUserIdFromToken(String token){
        Claims claims=Jwts.parser().verifyWith(getSigninKey())
        .build()
        .parseSignedClaims(token)
        .getPayload();
        return claims.get("userId", Long.class);
    }
    public boolean validateToken(String token){
        try{
            Jwts.parser()
                   .verifyWith(getSigninKey())
                   .build()
                   .parseSignedClaims(token);
                   return true;
        }
        catch (JwtException | IllegalArgumentException e){
            return false;

        }
        }
    }


    
