package org.viverasmus.api.listings;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class ListingController {
    private final ListingService listings;

    public ListingController(ListingService listings) {
        this.listings = listings;
    }

    @GetMapping("/properties")
    public List<ListingService.PropertyResponse> getProperties() {
        return listings.findAll();
    }

    @GetMapping("/properties/{id}")
    public ListingService.PropertyResponse getProperty(@PathVariable String id) {
        ListingService.PropertyResponse property = listings.findById(id);
        if (property == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found.");
        return property;
    }

    @PostMapping("/properties")
    public ListingService.PropertyResponse createProperty(@RequestBody ListingService.CreatePropertyRequest request) {
        try {
            return listings.create(request);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage());
        }
    }

    @DeleteMapping("/properties/{id}")
    public ResponseEntity<Void> deleteProperty(@PathVariable String id) {
        try {
            if (!listings.delete(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found.");
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, exception.getMessage());
        }
    }

    @PatchMapping("/properties/{id}/featured")
    public ResponseEntity<Void> setFeatured(@PathVariable String id, @RequestBody FeaturedRequest request) {
        if (!listings.setFeatured(id, request.featured())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found.");
        }
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/properties/{id}/household")
    public ResponseEntity<Void> setHousehold(@PathVariable String id, @RequestBody HouseholdRequest request) {
        try {
            if (!listings.setHousehold(id, request.household())) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found.");
            }
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage());
        }
    }

    @PatchMapping("/properties/{id}/cover")
    public ResponseEntity<Void> setPropertyCover(@PathVariable String id, @RequestBody CoverRequest request) {
        if (!listings.setPropertyCover(id, request.url())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Property photo not found.");
        }
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/rooms/{id}/cover")
    public ResponseEntity<Void> setRoomCover(@PathVariable String id, @RequestBody CoverRequest request) {
        if (!listings.setRoomCover(id, request.url())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Room photo not found.");
        }
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/rooms/{id}/status")
    public ResponseEntity<Void> updateRoomStatus(@PathVariable String id, @RequestBody RoomStatusRequest request) {
        try {
            if (!listings.updateRoomStatus(id, request.status(), request.tenant())) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found.");
            }
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage());
        }
    }

    @PatchMapping("/rooms/{id}/availability")
    public ResponseEntity<Void> updateRoomAvailability(@PathVariable String id, @RequestBody AvailabilityRequest request) {
        if (!listings.updateRoomAvailability(id, request.availableFrom())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found.");
        }
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/rooms/{id}/occupancy")
    public ResponseEntity<Void> updateRoomOccupancy(@PathVariable String id, @RequestBody OccupancyRequest request) {
        if (!listings.updateRoomOccupancy(id, request.occupiedFrom(), request.occupiedUntil())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a valid occupancy period for a booked room.");
        }
        return ResponseEntity.noContent().build();
    }

    public record FeaturedRequest(boolean featured) {}
    public record HouseholdRequest(String household) {}
    public record CoverRequest(String url) {}
    public record RoomStatusRequest(String status, ListingService.TenantResponse tenant) {}
    public record AvailabilityRequest(LocalDate availableFrom) {}
    public record OccupancyRequest(LocalDate occupiedFrom, LocalDate occupiedUntil) {}
}
