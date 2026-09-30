import { PropertyService } from './property.service';

describe('PropertyService', () => {
  const service = new PropertyService();

  it('provides the ten viverasmus homes', () => {
    expect(service.getProperties().map(property => property.title)).toEqual(['Paris','Tores Studio','Helsinki','Zagreb','Tallin','Oslo','Amsterdam','Ottawa','Berlin','Torre del Oro']);
    expect(service.getProperties().map(property => property.rooms?.length ?? 0)).toEqual([5,0,4,4,4,5,7,9,11,20]);
  });

  it('filters by neighborhood, maximum rent and property type together', () => {
    const filters = { neighborhood:'Triana', maxRent:400, propertyType:'Private room' };
    const results = service.searchProperties(filters);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(property => property.neighborhood === 'Triana' && property.propertyType === 'Private room')).toBeTrue();
    expect(results.every(property => service.matchingRooms(property, filters).every(room => room.monthlyRent <= 400))).toBeTrue();
  });

  it('lists only the free rooms of a flat that fit the budget', () => {
    const paris = service.getProperty('paris')!;
    expect(paris.rooms?.length).toBe(5);
    expect(service.matchingRooms(paris, { maxRent:400 }).map(room => room.monthlyRent)).toEqual([300, 400]);
  });

  it('lets the team mark a room as booked and free again', () => {
    const room = service.getProperty('paris')!.rooms![0];
    service.updateRoom(room.id, 'booked', { gender:'male', country:'Sweden' });
    expect(room.status).toBe('booked');
    expect(room.tenant).toEqual({ gender:'male', country:'Sweden' });
    service.updateRoom(room.id, 'available');
    expect(room.status).toBe('available');
    expect(room.tenant).toBeUndefined();
  });

  it('filters by furnished status', () => {
    const results = service.searchProperties({ furnished:true });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(property => property.furnished)).toBeTrue();
    expect(service.searchProperties({ furnished:false }).length).toBe(0);
  });

  it('finds a flat by its name, ignoring case and accents', () => {
    expect(service.searchProperties({ query:'paris' }).map(property => property.title)).toEqual(['Paris']);
    expect(service.searchProperties({ query:'nervion' }).length).toBeGreaterThan(1);
  });

  it('filters women-only and men-only flat shares', () => {
    const women = service.searchProperties({ household:'women' });
    const men = service.searchProperties({ household:'men' });
    expect(women.length).toBeGreaterThan(0);
    expect(men.length).toBeGreaterThan(0);
    expect(women.every(property => property.household === 'women')).toBeTrue();
    expect(men.every(property => property.household === 'men')).toBeTrue();
  });

  it('lets the office add a flat with its own number of rooms and remove it again', async () => {
    const id = await service.addFlat({ title:'Madrid', neighborhood:'Triana', address:'Calle Pureza', description:'', area:90, bathrooms:2, furnished:true, utilitiesIncluded:false, household:'women', amenities:['Wi-Fi'], images:[],
      rooms:[300, 350, 420, 500].map(monthlyRent => ({ monthlyRent, area:12, availableFrom:'2027-09-01', features:['Desk'], images:[] })) });
    const flat = service.getProperty(id)!;
    expect(flat.rooms?.length).toBe(4);
    expect(flat.monthlyRent).toBe(300);
    expect(flat.images.length).toBe(3);
    expect(service.searchProperties({ query:'madrid', household:'women', maxRent:350 }).map(property => property.id)).toEqual([id]);
    await service.removeFlat(id);
    expect(service.getProperty(id)).toBeUndefined();
  });

  it('filters by number of flatmates', () => {
    expect(service.searchProperties({ flatmates:'none' }).map(property => property.title)).toEqual(['Tores Studio']);
    expect(service.searchProperties({ flatmates:'few' }).map(property => property.title)).toEqual(['Paris','Helsinki','Zagreb','Tallin','Oslo']);
    expect(service.searchProperties({ flatmates:'some' }).map(property => property.title)).toEqual(['Amsterdam','Ottawa','Berlin']);
    expect(service.searchProperties({ flatmates:'many' }).map(property => property.title)).toEqual(['Torre del Oro']);
  });

  it('returns a listing by id', () => {
    expect(service.getProperty('paris')?.monthlyRent).toBe(300);
    expect(service.getProperty('missing')).toBeUndefined();
  });
});
