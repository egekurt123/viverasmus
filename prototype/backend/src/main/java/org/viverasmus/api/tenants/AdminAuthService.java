package org.viverasmus.api.tenants;

import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AdminAuthService {
    private final String email;
    private final String password;
    private final Set<String> sessions = ConcurrentHashMap.newKeySet();

    public AdminAuthService(@Value("${viverasmus.admin.email}") String email,
            @Value("${viverasmus.admin.password}") String password) {
        this.email = email.trim().toLowerCase();
        this.password = password;
    }

    public String login(String submittedEmail, String submittedPassword) {
        String candidateEmail = submittedEmail == null ? "" : submittedEmail.trim().toLowerCase();
        String candidatePassword = submittedPassword == null ? "" : submittedPassword;
        boolean emailMatches = MessageDigest.isEqual(email.getBytes(StandardCharsets.UTF_8), candidateEmail.getBytes(StandardCharsets.UTF_8));
        boolean passwordMatches = MessageDigest.isEqual(password.getBytes(StandardCharsets.UTF_8), candidatePassword.getBytes(StandardCharsets.UTF_8));
        if (!emailMatches || !passwordMatches) return null;
        String token = UUID.randomUUID().toString() + UUID.randomUUID();
        sessions.add(token);
        return token;
    }

    public boolean isValid(String authorization) {
        String token = token(authorization);
        return token != null && sessions.contains(token);
    }

    public void logout(String authorization) {
        String token = token(authorization);
        if (token != null) sessions.remove(token);
    }

    private String token(String authorization) {
        return authorization != null && authorization.startsWith("Bearer ") ? authorization.substring(7) : null;
    }
}
