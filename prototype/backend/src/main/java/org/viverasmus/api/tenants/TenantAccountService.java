package org.viverasmus.api.tenants;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TenantAccountService {
    private final JdbcTemplate jdbc;
    private final SecureRandom random = new SecureRandom();
    private final Map<String, Long> sessions = new ConcurrentHashMap<>();

    public TenantAccountService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public List<AdminTenant> findAll() {
        return jdbc.query("""
                SELECT room_id, email, reservation_paid, deposit_paid, monthly_paid_months
                FROM tenant_accounts ORDER BY room_id
                """, (rs, row) -> new AdminTenant(rs.getString("room_id"), rs.getString("email"),
                rs.getBoolean("reservation_paid"), rs.getBoolean("deposit_paid"), parseMonths(rs.getString("monthly_paid_months"))));
    }

    @Transactional
    public void save(String roomId, AccountUpdate update) {
        if (update.email() == null || !update.email().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"))
            throw new IllegalArgumentException("Enter a valid tenant email.");
        if (update.password() != null && !update.password().isBlank() && update.password().length() < 8)
            throw new IllegalArgumentException("Tenant password must have at least 8 characters.");
        List<String> paidMonths = update.paidMonths() == null ? List.of() : update.paidMonths().stream().distinct().toList();
        if (paidMonths.stream().anyMatch(month -> !month.matches("\\d{4}-(0[1-9]|1[0-2])")))
            throw new IllegalArgumentException("Monthly payment dates must use YYYY-MM format.");
        Boolean booked = jdbc.query("SELECT status = 'booked' FROM rooms WHERE id = ?", rs -> rs.next() ? rs.getBoolean(1) : null, roomId);
        if (booked == null) throw new IllegalArgumentException("Room not found.");
        if (!booked) throw new IllegalArgumentException("A tenant account requires a booked room.");
        Long existingId = jdbc.query("SELECT id FROM tenant_accounts WHERE room_id = ?", rs -> rs.next() ? rs.getLong(1) : null, roomId);
        String passwordHash = update.password() == null || update.password().isBlank()
                ? null : hash(update.password());
        if (existingId == null && passwordHash == null)
            throw new IllegalArgumentException("Set a password when creating a tenant account.");
        if (existingId == null) {
            jdbc.update("""
                    INSERT INTO tenant_accounts (room_id, email, password_hash, reservation_paid, deposit_paid, monthly_paid_months)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """, roomId, update.email().trim().toLowerCase(), passwordHash,
                    update.reservationPaid(), update.depositPaid(), String.join(",", paidMonths));
        } else {
            jdbc.update("""
                    UPDATE tenant_accounts SET email = ?, password_hash = COALESCE(?, password_hash),
                        reservation_paid = ?, deposit_paid = ?, monthly_paid_months = ?
                    WHERE room_id = ?
                    """, update.email().trim().toLowerCase(), passwordHash,
                    update.reservationPaid(), update.depositPaid(), String.join(",", paidMonths), roomId);
        }
    }

    public LoginResult login(String email, String password) {
        List<Credential> found = jdbc.query("SELECT id, password_hash FROM tenant_accounts WHERE email = ?",
                (rs, row) -> new Credential(rs.getLong(1), rs.getString(2)), email == null ? "" : email.trim().toLowerCase());
        if (found.isEmpty() || !matches(password == null ? "" : password, found.get(0).passwordHash())) return null;
        String token = UUID.randomUUID().toString() + UUID.randomUUID();
        sessions.put(token, found.get(0).id());
        return new LoginResult(token);
    }

    public long requireSession(String token) {
        Long id = sessions.get(token);
        if (id == null) throw new IllegalArgumentException("Tenant login required.");
        return id;
    }

    public void logout(String token) { if (token != null) sessions.remove(token); }

    public TenantRecord getTenant(long id) {
        List<TenantRecord> rows = jdbc.query("""
                SELECT a.room_id, a.email, a.reservation_paid, a.deposit_paid, a.monthly_paid_months, r.property_id
                FROM tenant_accounts a JOIN rooms r ON r.id = a.room_id
                WHERE a.id = ? AND r.status = 'booked'
                """, (rs, row) -> new TenantRecord(rs.getString("room_id"), rs.getString("email"),
                rs.getString("property_id"), rs.getBoolean("reservation_paid"), rs.getBoolean("deposit_paid"),
                parseMonths(rs.getString("monthly_paid_months"))), id);
        return rows.isEmpty() ? null : rows.get(0);
    }

    private List<String> parseMonths(String stored) {
        if (stored == null || stored.isBlank()) return List.of();
        return List.of(stored.split(","));
    }

    private String hash(String password) {
        byte[] salt = new byte[16]; random.nextBytes(salt);
        byte[] derived = derive(password, salt);
        return "pbkdf2$" + Base64.getEncoder().encodeToString(salt) + "$" + Base64.getEncoder().encodeToString(derived);
    }

    private boolean matches(String password, String stored) {
        try {
            String[] parts = stored.split("\\$");
            byte[] salt = Base64.getDecoder().decode(parts[1]);
            byte[] expected = Base64.getDecoder().decode(parts[2]);
            return MessageDigest.isEqual(expected, derive(password, salt));
        } catch (RuntimeException exception) { return false; }
    }

    private byte[] derive(String password, byte[] salt) {
        try {
            PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, 120_000, 256);
            try { return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded(); }
            finally { spec.clearPassword(); }
        } catch (Exception exception) { throw new IllegalStateException("Could not secure tenant password.", exception); }
    }

    private record Credential(long id, String passwordHash) {}
    public record AccountUpdate(String email, String password, boolean reservationPaid, boolean depositPaid,
                                List<String> paidMonths) {}
    public record AdminTenant(String roomId, String email, boolean reservationPaid, boolean depositPaid,
                              List<String> paidMonths) {}
    public record LoginResult(String token) {}
    public record TenantRecord(String roomId, String email, String propertyId, boolean reservationPaid,
                               boolean depositPaid, List<String> paidMonths) {}
}
