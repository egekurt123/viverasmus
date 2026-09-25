export type PropertyType = 'Private room' | 'Shared room' | 'Studio' | 'Apartment' | 'House';

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
  agent: { name: string; company: string; avatar: string; response: string };
}

export interface PropertyFilters {
  neighborhood?: string;
  maxRent?: number | null;
  propertyType?: string;
  bedrooms?: number | null;
  furnished?: boolean | null;
  amenities?: string[];
  availableFrom?: string;
}
