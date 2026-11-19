export type PropertyType = 'Private room' | 'Shared room' | 'Studio' | 'Apartment' | 'House';

export type RoomStatus = 'available' | 'booked';
export type TenantGender = 'female' | 'male';
/** Who a flat share is for: women only, men only, or anyone. */
export type Household = 'women' | 'men' | 'mixed';

/** Who has booked a room — only gender and home country are shown publicly. */
export interface Tenant { gender: TenantGender; country: string; }

/** A single room inside a flat share that can be rented separately. */
export interface Room {
  id: string;
  name: string;
  monthlyRent: number;
  area: number;
  availableFrom: string;
  status: RoomStatus;
  /** The period reserved by the current tenant, when the room is booked. */
  occupiedFrom?: string;
  occupiedUntil?: string;
  tenant?: Tenant;
  features: string[];
  /** Room-specific photos, shown first when the room is selected. */
  images?: string[];
}

export interface Property {
  id: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  monthlyRent: number;
  neighborhood: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  furnished: boolean;
  availableFrom: string;
  minimumStayMonths: number;
  deposit: number;
  utilitiesIncluded: boolean;
  occupants: number;
  amenities: string[];
  images: string[];
  latitude: number;
  longitude: number;
  agent?: { name: string; company: string; avatar: string; response: string };
  /** Present for flat shares: the rooms that can be rented individually. */
  rooms?: Room[];
  household?: Household;
  /** Added by the office in the admin area. */
  custom?: boolean;
  /** Comes from the database and is checked before a listing can be removed. */
  deletable?: boolean;
  /** Whether the office has featured this property. */
  featured?: boolean;
}

export interface PropertyFilters {
  /** Free text matched against the flat's name, neighborhood and street. */
  query?: string;
  household?: '' | 'women' | 'men';
  neighborhood?: string;
  maxRent?: number | null;
  propertyType?: string;
  /** A FLATMATE_OPTIONS value. */
  flatmates?: string;
  privateBathroom?: boolean;
  availableFrom?: string;
}
