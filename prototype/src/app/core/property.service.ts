import { Injectable } from '@angular/core';
import { PROPERTIES } from './mock-properties';
import { Property, PropertyFilters } from './property.model';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  getProperties(): Property[] { return PROPERTIES; }
  getProperty(id: string): Property | undefined { return PROPERTIES.find(property => property.id === id); }
  searchProperties(filters: PropertyFilters): Property[] {
    return PROPERTIES.filter(property => {
      if (filters.neighborhood && property.neighborhood !== filters.neighborhood) return false;
      if (filters.maxRent && property.monthlyRent > filters.maxRent) return false;
      if (filters.propertyType && property.propertyType !== filters.propertyType) return false;
      if (filters.bedrooms && property.bedrooms < filters.bedrooms) return false;
      if (filters.furnished === true && !property.furnished) return false;
      if (filters.furnished === false && property.furnished) return false;
      if (filters.amenities?.some(amenity => !property.amenities.includes(amenity))) return false;
      if (filters.availableFrom && property.availableFrom > filters.availableFrom) return false;
      return true;
    });
  }
}
