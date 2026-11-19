CREATE TABLE properties (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    property_type VARCHAR(40) NOT NULL,
    monthly_rent NUMERIC(10, 2) NOT NULL CHECK (monthly_rent >= 0),
    neighborhood VARCHAR(120) NOT NULL,
    address VARCHAR(255) NOT NULL,
    bedrooms INTEGER NOT NULL CHECK (bedrooms >= 0),
    bathrooms INTEGER NOT NULL CHECK (bathrooms >= 0),
    area NUMERIC(10, 2) NOT NULL CHECK (area >= 0),
    furnished BOOLEAN NOT NULL,
    available_from DATE NOT NULL,
    minimum_stay_months INTEGER NOT NULL CHECK (minimum_stay_months >= 0),
    deposit NUMERIC(10, 2) NOT NULL CHECK (deposit >= 0),
    utilities_included BOOLEAN NOT NULL,
    occupants INTEGER NOT NULL CHECK (occupants >= 0),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    household VARCHAR(10) CHECK (household IS NULL OR household IN ('women', 'men', 'mixed')),
    is_popular BOOLEAN NOT NULL DEFAULT FALSE,
    is_custom BOOLEAN NOT NULL DEFAULT FALSE,
    deletable BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE property_amenities (
    property_id VARCHAR(100) NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position >= 0),
    amenity VARCHAR(100) NOT NULL,
    PRIMARY KEY (property_id, position)
);

CREATE TABLE property_photos (
    property_id VARCHAR(100) NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position >= 0),
    photo_url TEXT NOT NULL,
    PRIMARY KEY (property_id, position)
);

CREATE TABLE rooms (
    id VARCHAR(120) PRIMARY KEY,
    property_id VARCHAR(100) NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    monthly_rent NUMERIC(10, 2) NOT NULL CHECK (monthly_rent >= 0),
    area NUMERIC(10, 2) NOT NULL CHECK (area >= 0),
    available_from DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('available', 'booked')),
    deletable BOOLEAN NOT NULL DEFAULT TRUE,
    occupied_from DATE,
    occupied_until DATE,
    tenant_gender VARCHAR(10) CHECK (tenant_gender IS NULL OR tenant_gender IN ('female', 'male')),
    tenant_country VARCHAR(100),
    CHECK (occupied_from IS NULL OR occupied_until IS NULL OR occupied_from <= occupied_until)
);

CREATE INDEX idx_properties_neighborhood ON properties(neighborhood);
CREATE INDEX idx_properties_rent ON properties(monthly_rent);
CREATE INDEX idx_rooms_property ON rooms(property_id);
CREATE INDEX idx_rooms_status ON rooms(status);

CREATE TABLE room_features (
    room_id VARCHAR(120) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position >= 0),
    feature VARCHAR(100) NOT NULL,
    PRIMARY KEY (room_id, position)
);

CREATE TABLE room_photos (
    room_id VARCHAR(120) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position >= 0),
    photo_url TEXT NOT NULL,
    PRIMARY KEY (room_id, position)
);
