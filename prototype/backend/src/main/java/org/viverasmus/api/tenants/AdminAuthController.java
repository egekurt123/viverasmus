package org.viverasmus.api.tenants;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/admin")
public class AdminAuthController {
    private final AdminAuthService admins;

    public AdminAuthController(AdminAuthService admins) { this.admins = admins; }

    @PostMapping("/login")
    public LoginResult login(@RequestBody LoginRequest request) {
        String token = admins.login(request.email(), request.password());
        if (token == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email or password is incorrect.");
        return new LoginResult(token);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader(value = "Authorization", required = false) String authorization) {
        admins.logout(authorization);
        return ResponseEntity.noContent().build();
    }

    public record LoginRequest(String email, String password) {}
    public record LoginResult(String token) {}
}
