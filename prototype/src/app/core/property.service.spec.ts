import { PropertyService } from './property.service';

describe('PropertyService', () => {
  const service = new PropertyService();

  it('provides twenty local Sevilla listings', () => {
    expect(service.getProperties().length).toBe(20);
  });

  it('filters by neighborhood, maximum rent and property type together', () => {
    const results = service.searchProperties({ neighborhood:'Triana', maxRent:600, propertyType:'Private room' });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(property => property.neighborhood === 'Triana' && property.monthlyRent <= 600 && property.propertyType === 'Private room')).toBeTrue();
  });

  it('filters by selected amenities and unfurnished status', () => {
    const results = service.searchProperties({ amenities:['Balcony'], furnished:false });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(property => !property.furnished && property.amenities.includes('Balcony'))).toBeTrue();
  });

  it('returns a listing by id', () => {
    expect(service.getProperty('triana-sunlit-room')?.monthlyRent).toBe(480);
    expect(service.getProperty('missing')).toBeUndefined();
  });
});
