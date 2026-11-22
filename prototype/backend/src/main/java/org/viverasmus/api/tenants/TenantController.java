package org.viverasmus.api.tenants;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.viverasmus.api.listings.ListingService;

@RestController
@RequestMapping("/api")
public class TenantController {
    private final TenantAccountService accounts;
    private final ListingService listings;

    public TenantController(TenantAccountService accounts, ListingService listings) {
        this.accounts = accounts;
        this.listings = listings;
    }

    @GetMapping("/admin/tenant-accounts")
    public List<TenantAccountService.AdminTenant> getAccounts() { return accounts.findAll(); }

    @PutMapping("/rooms/{roomId}/tenant-account")
    public ResponseEntity<Void> saveAccount(@PathVariable String roomId,
            @RequestBody TenantAccountService.AccountUpdate update) {
        try { accounts.save(roomId, update); return ResponseEntity.noContent().build(); }
        catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage());
        } catch (org.springframework.dao.DuplicateKeyException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "That email is already assigned to another tenant.");
        }
    }

    @PostMapping("/tenant/login")
    public TenantAccountService.LoginResult login(@RequestBody LoginRequest request) {
        TenantAccountService.LoginResult result = accounts.login(request.email(), request.password());
        if (result == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email or password is incorrect.");
        return result;
    }

    @PostMapping("/tenant/logout")
    public ResponseEntity<Void> logout(@RequestHeader(value = "Authorization", required = false) String authorization) {
        accounts.logout(token(authorization));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tenant/me")
    public TenantHome getMyApartment(@RequestHeader(value = "Authorization", required = false) String authorization) {
        try {
            TenantAccountService.TenantRecord account = accounts.getTenant(accounts.requireSession(token(authorization)));
            if (account == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No booked room is assigned to this account.");
            ListingService.PropertyResponse property = listings.findById(account.propertyId());
            ListingService.RoomResponse room = property == null ? null : property.rooms().stream()
                    .filter(item -> item.id().equals(account.roomId())).findFirst().orElse(null);
            if (property == null || room == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Apartment not found.");
            ListingService.PropertyResponse ownRoomOnly = new ListingService.PropertyResponse(
                    property.id(), property.title(), property.description(), property.propertyType(),
                    property.monthlyRent(), property.neighborhood(), property.address(), property.bedrooms(),
                    property.bathrooms(), property.area(), property.furnished(), property.availableFrom(),
                    property.minimumStayMonths(), property.deposit(), property.utilitiesIncluded(), property.occupants(),
                    property.amenities(), property.images(), property.latitude(), property.longitude(), property.household(),
                    List.of(room), property.custom(), property.featured(), property.deletable());
            return new TenantHome(account.email(), ownRoomOnly, room,
                    new Payments(account.reservationPaid(), account.depositPaid(), room.monthlyRent(), account.paidMonths()));
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, exception.getMessage());
        }
    }

    private String token(String authorization) {
        return authorization != null && authorization.startsWith("Bearer ") ? authorization.substring(7) : null;
    }

    public record LoginRequest(String email, String password) {}
    public record Payments(boolean reservationPaid, boolean depositPaid, java.math.BigDecimal depositAmount,
                           List<String> paidMonths) {}
    public record TenantHome(String email, ListingService.PropertyResponse property,
                             ListingService.RoomResponse room, Payments payments) {}
}
