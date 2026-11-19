package org.viverasmus.api.listings;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowCallbackHandler;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ListingService {
    private static final Map<String, double[]> NEIGHBORHOOD_CENTERS = Map.of(
            "Alameda", new double[]{37.3998, -5.9925},
            "Centro", new double[]{37.3886, -5.9953},
            "Los Remedios", new double[]{37.3765, -6.0040},
            "Macarena", new double[]{37.4040, -5.9890},
            "Nervión", new double[]{37.3815, -5.9700},
            "San Bernardo", new double[]{37.3800, -5.9790},
            "Triana", new double[]{37.3845, -6.0045});

    private final JdbcTemplate jdbc;

    public ListingService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<PropertyResponse> findAll() {
        List<PropertyRow> properties = jdbc.query("""
                SELECT id, title, description, property_type, monthly_rent, neighborhood, address,
                       bedrooms, bathrooms, area, furnished, available_from, minimum_stay_months,
                       deposit, utilities_included, occupants, latitude, longitude, household,
                       is_popular, is_custom, deletable
                FROM properties
                ORDER BY title
                """, (rs, row) -> propertyRow(rs));

        Map<String, List<String>> amenities = orderedValues("property_amenities", "property_id", "amenity");
        Map<String, List<String>> propertyPhotos = orderedValues("property_photos", "property_id", "photo_url");
        Map<String, List<String>> features = orderedValues("room_features", "room_id", "feature");
        Map<String, List<String>> roomPhotos = orderedValues("room_photos", "room_id", "photo_url");
        Map<String, List<RoomResponse>> roomsByProperty = new HashMap<>();

        List<RoomRow> roomRows = jdbc.query("""
                SELECT id, property_id, name, monthly_rent, area, available_from, status,
                       occupied_from, occupied_until, tenant_gender, tenant_country, deletable
                FROM rooms
                ORDER BY property_id, id
                """, (rs, row) -> roomRow(rs));

        for (RoomRow room : roomRows) {
            TenantResponse tenant = room.tenantGender() == null ? null
                    : new TenantResponse(room.tenantGender(), room.tenantCountry());
            RoomResponse response = new RoomResponse(
                    room.id(), room.name(), room.monthlyRent(), room.area(), room.availableFrom(),
                    room.status(), room.occupiedFrom(), room.occupiedUntil(), tenant,
                    features.getOrDefault(room.id(), List.of()), roomPhotos.getOrDefault(room.id(), List.of()),
                    room.deletable());
            roomsByProperty.computeIfAbsent(room.propertyId(), ignored -> new ArrayList<>()).add(response);
        }

        return properties.stream().map(property -> new PropertyResponse(
                property.id(), property.title(), property.description(), property.propertyType(),
                property.monthlyRent(), property.neighborhood(), property.address(), property.bedrooms(),
                property.bathrooms(), property.area(), property.furnished(), property.availableFrom(),
                property.minimumStayMonths(), property.deposit(), property.utilitiesIncluded(),
                property.occupants(), amenities.getOrDefault(property.id(), List.of()),
                propertyPhotos.getOrDefault(property.id(), List.of()), property.latitude(), property.longitude(),
                property.household(), roomsByProperty.get(property.id()), property.custom(), property.featured(),
                property.deletable())).toList();
    }

    public PropertyResponse findById(String id) {
        return findAll().stream().filter(property -> property.id().equals(id)).findFirst().orElse(null);
    }

    @Transactional
    public PropertyResponse create(CreatePropertyRequest request) {
        if (request.title() == null || request.title().isBlank() || request.address() == null || request.address().isBlank()) {
            throw new IllegalArgumentException("A flat name and address are required.");
        }
        List<CreateRoomRequest> newRooms = request.rooms() == null ? List.of() : request.rooms();
        if (newRooms.isEmpty() || newRooms.size() > 20) {
            throw new IllegalArgumentException("A flat must have between 1 and 20 rooms.");
        }
        if (newRooms.stream().anyMatch(room -> room.monthlyRent() == null || room.monthlyRent().signum() <= 0
                || room.area() == null || room.area().signum() <= 0 || room.availableFrom() == null)) {
            throw new IllegalArgumentException("Each room needs a positive rent, area, and availability date.");
        }

        String slug = Normalizer.normalize(request.title().trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        String id = (slug.isBlank() ? "flat" : slug) + "-" + UUID.randomUUID().toString().substring(0, 8);
        double[] center = NEIGHBORHOOD_CENTERS.getOrDefault(request.neighborhood(), NEIGHBORHOOD_CENTERS.get("Centro"));
        BigDecimal cheapest = newRooms.stream().map(CreateRoomRequest::monthlyRent)
                .min(Comparator.naturalOrder()).orElseThrow();
        LocalDate firstAvailable = newRooms.stream().map(CreateRoomRequest::availableFrom).min(Comparator.naturalOrder()).orElseThrow();
        BigDecimal propertyArea = request.area() == null
                ? newRooms.stream().map(CreateRoomRequest::area).reduce(BigDecimal.ZERO, BigDecimal::add)
                : request.area();

        jdbc.update("""
                INSERT INTO properties (id, title, description, property_type, monthly_rent, neighborhood, address,
                    bedrooms, bathrooms, area, furnished, available_from, minimum_stay_months, deposit,
                    utilities_included, occupants, latitude, longitude, household, is_popular, is_custom, deletable)
                VALUES (?, ?, ?, 'Private room', ?, ?, ?, ?, ?, ?, ?, ?, 5, ?, ?, ?, ?, ?, ?, FALSE, TRUE, TRUE)
                """, id, request.title().trim(), request.description() == null ? "" : request.description(),
                cheapest, request.neighborhood(), request.address().trim(), newRooms.size(), request.bathrooms(),
                propertyArea, request.furnished(), firstAvailable, cheapest,
                request.utilitiesIncluded(), newRooms.size(), center[0], center[1], request.household());

        insertValues("property_amenities", "property_id", "amenity", id, request.amenities());
        insertValues("property_photos", "property_id", "photo_url", id, request.images());

        for (int i = 0; i < newRooms.size(); i++) {
            CreateRoomRequest room = newRooms.get(i);
            String roomId = id + "-room-" + (i + 1);
            jdbc.update("""
                    INSERT INTO rooms (id, property_id, name, monthly_rent, area, available_from, status, deletable)
                    VALUES (?, ?, ?, ?, ?, ?, 'available', TRUE)
                    """, roomId, id, "Room " + (i + 1), room.monthlyRent(),
                    room.area(), room.availableFrom());
            insertValues("room_features", "room_id", "feature", roomId, room.features());
            insertValues("room_photos", "room_id", "photo_url", roomId, room.images());
        }
        return findById(id);
    }

    @Transactional
    public boolean delete(String id) {
        Boolean deletable = jdbc.query("SELECT deletable FROM properties WHERE id = ?", rs ->
                rs.next() ? rs.getBoolean(1) : null, id);
        if (deletable == null) return false;
        if (!deletable) throw new IllegalStateException("This current Viverasmus listing cannot be deleted.");
        jdbc.update("DELETE FROM properties WHERE id = ?", id);
        return true;
    }

    public boolean setFeatured(String id, boolean featured) {
        return jdbc.update("UPDATE properties SET is_popular = ? WHERE id = ?", featured, id) > 0;
    }

    public boolean setHousehold(String id, String household) {
        return jdbc.update("UPDATE properties SET household = ? WHERE id = ?", household, id) > 0;
    }

    @Transactional
    public boolean setPropertyCover(String id, String url) {
        List<String> urls = jdbc.query("SELECT photo_url FROM property_photos WHERE property_id = ? ORDER BY position",
                (rs, row) -> rs.getString(1), id);
        return reorderPhotos("property_photos", "property_id", id, url, urls);
    }

    @Transactional
    public boolean setRoomCover(String id, String url) {
        List<String> urls = jdbc.query("SELECT photo_url FROM room_photos WHERE room_id = ? ORDER BY position",
                (rs, row) -> rs.getString(1), id);
        return reorderPhotos("room_photos", "room_id", id, url, urls);
    }

    public boolean updateRoomStatus(String id, String status, TenantResponse tenant) {
        if (!List.of("available", "booked").contains(status)) throw new IllegalArgumentException("Invalid room status.");
        if ("available".equals(status)) {
            return jdbc.update("""
                    UPDATE rooms SET status = 'available', tenant_gender = NULL, tenant_country = NULL,
                        occupied_from = NULL, occupied_until = NULL WHERE id = ?
                    """, id) > 0;
        }
        TenantResponse current = jdbc.query("SELECT tenant_gender, tenant_country FROM rooms WHERE id = ?", rs ->
                rs.next() ? new TenantResponse(rs.getString(1), rs.getString(2)) : null, id);
        if (current == null) return false;
        TenantResponse bookedBy = tenant != null ? tenant
                : current.gender() != null ? current : new TenantResponse("female", "Germany");
        return jdbc.update("""
                UPDATE rooms SET status = 'booked', tenant_gender = ?, tenant_country = ? WHERE id = ?
                """, bookedBy.gender(), bookedBy.country(), id) > 0;
    }

    public boolean updateRoomAvailability(String id, LocalDate availableFrom) {
        if (availableFrom == null) throw new IllegalArgumentException("An availability date is required.");
        return jdbc.update("UPDATE rooms SET available_from = ? WHERE id = ?", availableFrom, id) > 0;
    }

    public boolean updateRoomOccupancy(String id, LocalDate occupiedFrom, LocalDate occupiedUntil) {
        if (occupiedFrom == null || occupiedUntil == null || occupiedFrom.isAfter(occupiedUntil)) return false;
        return jdbc.update("""
                UPDATE rooms SET occupied_from = ?, occupied_until = ? WHERE id = ? AND status = 'booked'
                """, occupiedFrom, occupiedUntil, id) > 0;
    }

    private boolean reorderPhotos(String table, String idColumn, String id, String cover, List<String> urls) {
        if (!urls.remove(cover)) return false;
        urls.add(0, cover);
        jdbc.update("DELETE FROM " + table + " WHERE " + idColumn + " = ?", id);
        insertValues(table, idColumn, "property_photos".equals(table) ? "photo_url" : "photo_url", id, urls);
        return true;
    }

    private void insertValues(String table, String idColumn, String valueColumn, String id, List<String> values) {
        if (values == null || values.isEmpty()) return;
        String sql = "INSERT INTO " + table + " (" + idColumn + ", position, " + valueColumn + ") VALUES (?, ?, ?)";
        for (int index = 0; index < values.size(); index++) {
            jdbc.update(sql, id, index, values.get(index));
        }
    }

    private Map<String, List<String>> orderedValues(String table, String keyColumn, String valueColumn) {
        Map<String, List<String>> values = new HashMap<>();
        jdbc.query("SELECT " + keyColumn + ", " + valueColumn + " FROM " + table + " ORDER BY " + keyColumn + ", position",
                (RowCallbackHandler) rs -> values.computeIfAbsent(rs.getString(1), ignored -> new ArrayList<>()).add(rs.getString(2)));
        return values;
    }

    private PropertyRow propertyRow(ResultSet rs) throws SQLException {
        return new PropertyRow(rs.getString("id"), rs.getString("title"), rs.getString("description"),
                rs.getString("property_type"), rs.getBigDecimal("monthly_rent"), rs.getString("neighborhood"),
                rs.getString("address"), rs.getInt("bedrooms"), rs.getInt("bathrooms"), rs.getBigDecimal("area"),
                rs.getBoolean("furnished"), rs.getObject("available_from", LocalDate.class),
                rs.getInt("minimum_stay_months"), rs.getBigDecimal("deposit"), rs.getBoolean("utilities_included"),
                rs.getInt("occupants"), rs.getDouble("latitude"), rs.getDouble("longitude"), rs.getString("household"),
                rs.getBoolean("is_popular"), rs.getBoolean("is_custom"), rs.getBoolean("deletable"));
    }

    private RoomRow roomRow(ResultSet rs) throws SQLException {
        return new RoomRow(rs.getString("id"), rs.getString("property_id"), rs.getString("name"),
                rs.getBigDecimal("monthly_rent"), rs.getBigDecimal("area"),
                rs.getObject("available_from", LocalDate.class), rs.getString("status"),
                localDate(rs, "occupied_from"), localDate(rs, "occupied_until"), rs.getString("tenant_gender"),
                rs.getString("tenant_country"), rs.getBoolean("deletable"));
    }

    private LocalDate localDate(ResultSet rs, String column) throws SQLException {
        java.sql.Date date = rs.getDate(column);
        return date == null ? null : date.toLocalDate();
    }

    private record PropertyRow(String id, String title, String description, String propertyType,
                               BigDecimal monthlyRent, String neighborhood, String address, int bedrooms,
                               int bathrooms, BigDecimal area, boolean furnished, LocalDate availableFrom,
                               int minimumStayMonths, BigDecimal deposit, boolean utilitiesIncluded,
                               int occupants, double latitude, double longitude, String household,
                               boolean featured, boolean custom, boolean deletable) {}

    private record RoomRow(String id, String propertyId, String name, BigDecimal monthlyRent, BigDecimal area,
                           LocalDate availableFrom, String status, LocalDate occupiedFrom, LocalDate occupiedUntil,
                           String tenantGender, String tenantCountry, boolean deletable) {}

    public record PropertyResponse(String id, String title, String description, String propertyType,
                                   BigDecimal monthlyRent, String neighborhood, String address, int bedrooms,
                                   int bathrooms, BigDecimal area, boolean furnished, LocalDate availableFrom,
                                   int minimumStayMonths, BigDecimal deposit, boolean utilitiesIncluded,
                                   int occupants, List<String> amenities, List<String> images,
                                   double latitude, double longitude, String household, List<RoomResponse> rooms,
                                   boolean custom, boolean featured, boolean deletable) {}

    public record RoomResponse(String id, String name, BigDecimal monthlyRent, BigDecimal area,
                               LocalDate availableFrom, String status, LocalDate occupiedFrom,
                               LocalDate occupiedUntil, TenantResponse tenant, List<String> features,
                               List<String> images, boolean deletable) {}

    public record TenantResponse(String gender, String country) {}

    public record CreatePropertyRequest(String title, String neighborhood, String address, String description,
                                        BigDecimal area, int bathrooms, boolean furnished,
                                        boolean utilitiesIncluded, String household, List<String> amenities,
                                        List<String> images, List<CreateRoomRequest> rooms) {}

    public record CreateRoomRequest(BigDecimal monthlyRent, BigDecimal area, LocalDate availableFrom,
                                    List<String> features, List<String> images) {}
}
