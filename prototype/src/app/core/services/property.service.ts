import { Injectable } from '@angular/core';
import { PLACEHOLDER_IMAGES, PROPERTIES } from '../../data/mock/mock-properties';
import { Household, Property, PropertyFilters, Room, RoomStatus, Tenant } from '../models/property.model';
import { deleteImages, resolveImage } from '../storage/image-store';
import { FLATMATE_OPTIONS, flatmateCount } from '../config/flatmates';
import { SEMESTER_MIN_MONTHS } from '../config/move-in';

const ROOM_STORAGE_KEY = 'viverasmus.rooms';
const HOUSEHOLD_STORAGE_KEY = 'viverasmus.households';
const FLAT_STORAGE_KEY = 'viverasmus.flats';
const COVER_STORAGE_KEY = 'viverasmus.covers';
const POPULAR_PROPERTY_IDS_KEY = 'viverasmus.popularProperties';
const DEFAULT_POPULAR_PROPERTY_IDS = ['paris', 'tores-studio', 'amsterdam', 'torre-del-oro'];

/** Approximate centre of each neighborhood, used to pin flats the office adds. */
const NEIGHBORHOOD_CENTERS: Record<string, [number, number]> = {
  Alameda:[37.3998, -5.9925], Centro:[37.3886, -5.9953], 'Los Remedios':[37.3765, -6.0040], Macarena:[37.4040, -5.9890],
  'Nervión':[37.3815, -5.9700], 'San Bernardo':[37.3800, -5.9790], Triana:[37.3845, -6.0045]
};

export interface NewRoom { monthlyRent: number; area: number; availableFrom: string; features: string[]; images: string[]; }
/** What the office fills in to add a flat. Images are references from saveImage(). */
export interface NewFlat {
  title: string; neighborhood: string; address: string; description: string; area: number; bathrooms: number;
  furnished: boolean; utilitiesIncluded: boolean; household: Household; amenities: string[]; images: string[]; rooms: NewRoom[];
}
type RoomOverride = Pick<Room, 'status' | 'tenant'>;

@Injectable({ providedIn: 'root' })
export class PropertyService {
  /** Bumped whenever room data changes, so views can refresh cached searches. */
  version = 0;
  /** Object URL → stored reference, so uploaded photos can be saved again. */
  private imageRefs = new Map<string, string>();
  private popularPropertyIds = [...DEFAULT_POPULAR_PROPERTY_IDS];
  constructor() {
    this.restoreRoomChanges();
    this.restoreHouseholds();
    this.restoreCovers();
    this.popularPropertyIds = this.readJson(POPULAR_PROPERTY_IDS_KEY, DEFAULT_POPULAR_PROPERTY_IDS);
    void this.restoreCustomFlats();
  }

  getProperties(): Property[] { return PROPERTIES; }
  getProperty(id: string): Property | undefined { return PROPERTIES.find(property => property.id === id); }
  getPopularProperties(): Property[] { return PROPERTIES.filter(property => this.popularPropertyIds.includes(property.id)); }
  isPopular(propertyId: string): boolean { return this.popularPropertyIds.includes(propertyId); }
  togglePopular(propertyId: string): void {
    if (!this.getProperty(propertyId)) return;
    this.popularPropertyIds = this.isPopular(propertyId)
      ? this.popularPropertyIds.filter(id => id !== propertyId)
      : [...this.popularPropertyIds, propertyId];
    this.writeJson(POPULAR_PROPERTY_IDS_KEY, this.popularPropertyIds);
  }

  findRoom(roomId: string): { property: Property; room: Room } | undefined {
    for (const property of PROPERTIES) {
      const room = property.rooms?.find(item => item.id === roomId);
      if (room) return { property, room };
    }
    return undefined;
  }

  /** Available rooms of a flat share that fit the rent and move-in filters. */
  matchingRooms(property: Property, filters: PropertyFilters = {}): Room[] {
    return (property.rooms ?? []).filter(room => {
      if (room.status !== 'available') return false;
      if (filters.maxRent && room.monthlyRent > filters.maxRent) return false;
      if (filters.availableFrom && room.availableFrom > filters.availableFrom) return false;
      return true;
    });
  }

  /** Lowest rent the listing can be had for under the given filters. */
  fromRent(property: Property, filters: PropertyFilters = {}): number {
    const rooms = this.matchingRooms(property, filters);
    return rooms.length ? Math.min(...rooms.map(room => room.monthlyRent)) : property.monthlyRent;
  }

  searchProperties(filters: PropertyFilters): Property[] {
    return PROPERTIES.filter(property => {
      if (filters.query && !this.matchesQuery(property, filters.query)) return false;
      if (filters.household && property.household !== filters.household) return false;
      if (filters.neighborhood && property.neighborhood !== filters.neighborhood) return false;
      if (filters.propertyType && property.propertyType !== filters.propertyType) return false;
      const flatmates = FLATMATE_OPTIONS.find(option => option.value === filters.flatmates);
      if (flatmates && (flatmateCount(property) < flatmates.min || flatmateCount(property) > flatmates.max)) return false;
      if (property.rooms) return this.matchingRooms(property, filters).length > 0;
      if (filters.maxRent && property.monthlyRent > filters.maxRent) return false;
      if (filters.availableFrom && property.availableFrom > filters.availableFrom) return false;
      return true;
    });
  }

  private matchesQuery(property: Property, query: string): boolean {
    const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const haystack = normalize(`${property.title} ${property.neighborhood} ${property.address}`);
    return normalize(query).split(/\s+/).filter(Boolean).every(word => haystack.includes(word));
  }

  /** Admin: mark a room as booked (with who booked it) or free it up again. */
  updateRoom(roomId: string, status: RoomStatus, tenant?: Tenant): void {
    const found = this.findRoom(roomId);
    if (!found) return;
    found.room.status = status;
    found.room.tenant = status === 'booked' ? tenant ?? found.room.tenant ?? { gender:'female', country:'Germany' } : undefined;
    this.version++;
    this.saveRoomChanges();
    if (found.property.custom) this.saveCustomFlats();
  }

  /** The flat's own photos (not its rooms'), in display order — the first one is the cover. */
  flatPhotos(property: Property): string[] {
    const roomPhotos = new Set((property.rooms ?? []).flatMap(room => room.images ?? []));
    return property.images.filter(url => !roomPhotos.has(url) && !(property.custom && PLACEHOLDER_IMAGES.includes(url)));
  }

  /** Admin: choose which flat photo is shown first on the card and the flat page. */
  setCover(propertyId: string, url: string): void {
    const property = this.getProperty(propertyId);
    if (!property?.images.includes(url)) return;
    property.images = [url, ...property.images.filter(item => item !== url)];
    this.version++;
    if (property.custom) { this.saveCustomFlats(); return; }
    this.writeJson(COVER_STORAGE_KEY, { ...this.readJson<Record<string, string>>(COVER_STORAGE_KEY, {}), [propertyId]: url });
  }

  /** Admin: choose which room photo is shown first on the room page. */
  setRoomCover(roomId: string, url: string): void {
    const found = this.findRoom(roomId);
    if (!found?.room.images?.includes(url)) return;
    found.room.images = [url, ...found.room.images.filter(item => item !== url)];
    this.version++;
    if (found.property.custom) this.saveCustomFlats();
  }

  setHousehold(propertyId: string, household: Household): void {
    const property = this.getProperty(propertyId);
    if (!property) return;
    property.household = household;
    this.version++;
    if (property.custom) { this.saveCustomFlats(); return; }
    const stored = this.readJson<Record<string, Household>>(HOUSEHOLD_STORAGE_KEY, {});
    this.writeJson(HOUSEHOLD_STORAGE_KEY, { ...stored, [propertyId]: household });
  }

  /** Admin: add a flat share with its rooms. Returns the new listing's id. */
  async addFlat(flat: NewFlat): Promise<string> {
    const slug = flat.title.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'flat';
    const id = `${slug}-${Date.now().toString(36)}`;
    const [latitude, longitude] = NEIGHBORHOOD_CENTERS[flat.neighborhood] ?? NEIGHBORHOOD_CENTERS['Centro'];
    const rooms: Room[] = flat.rooms.map((room, index) => ({ id:`${id}-room-${index + 1}`, name:`Room ${index + 1}`, status:'available', ...room }));
    const cheapest = Math.min(...rooms.map(room => room.monthlyRent));
    const stored: Property = {
      id, title:flat.title, description:flat.description, propertyType:'Private room', monthlyRent:cheapest, neighborhood:flat.neighborhood,
      address:flat.address, bedrooms:rooms.length, bathrooms:flat.bathrooms, area:flat.area, furnished:flat.furnished,
      availableFrom:rooms.map(room => room.availableFrom).sort()[0], minimumStayMonths:SEMESTER_MIN_MONTHS, deposit:cheapest, utilitiesIncluded:flat.utilitiesIncluded,
      occupants:rooms.length, amenities:flat.amenities, images:flat.images, latitude, longitude, rooms, household:flat.household, custom:true
    };
    PROPERTIES.push(await this.resolveFlat(stored));
    this.version++;
    this.saveCustomFlats();
    return id;
  }

  /** Admin: remove a flat the office added, including its photos. */
  async removeFlat(propertyId: string): Promise<void> {
    const index = PROPERTIES.findIndex(property => property.id === propertyId && property.custom);
    if (index < 0) return;
    const [removed] = PROPERTIES.splice(index, 1);
    this.popularPropertyIds = this.popularPropertyIds.filter(id => id !== propertyId);
    this.writeJson(POPULAR_PROPERTY_IDS_KEY, this.popularPropertyIds);
    this.version++;
    this.saveCustomFlats();
    await deleteImages([...removed.images, ...(removed.rooms ?? []).flatMap(room => room.images ?? [])].map(url => this.imageRefs.get(url) ?? url));
  }

  private saveCustomFlats(): void {
    const toRef = (urls: string[] = []) => urls.map(url => this.imageRefs.get(url) ?? url).filter(url => !PLACEHOLDER_IMAGES.includes(url));
    const flats = PROPERTIES.filter(property => property.custom).map(property => ({
      // Room photos are added to the flat gallery on load, so only the flat's own photos are stored here.
      ...property, images:toRef(property.images.filter(url => !property.rooms?.some(room => room.images?.includes(url)))), rooms:property.rooms?.map(room => ({ ...room, images:toRef(room.images) }))
    }));
    this.writeJson(FLAT_STORAGE_KEY, flats);
  }

  private async restoreCustomFlats(): Promise<void> {
    const flats = this.readJson<Property[]>(FLAT_STORAGE_KEY, []);
    if (!flats.length) return;
    for (const flat of flats) {
      try { PROPERTIES.push(await this.resolveFlat(flat)); } catch { /* photos unavailable: skip this flat */ }
    }
    this.version++;
  }

  /** Swap stored photo references for displayable URLs and make sure the gallery has three pictures. */
  private async resolveFlat(flat: Property): Promise<Property> {
    const resolveAll = async (refs: string[] = []) => {
      const urls: string[] = [];
      for (const ref of refs) {
        const url = await resolveImage(ref);
        if (url) { this.imageRefs.set(url, ref); urls.push(url); }
      }
      return urls;
    };
    const rooms = [];
    for (const room of flat.rooms ?? []) rooms.push({ ...room, images:await resolveAll(room.images) });
    const images = [...await resolveAll(flat.images), ...rooms.flatMap(room => room.images)];
    return { ...flat, rooms, images:[...images, ...PLACEHOLDER_IMAGES].slice(0, Math.max(images.length, 3)) };
  }

  private restoreCovers(): void {
    for (const [propertyId, url] of Object.entries(this.readJson<Record<string, string>>(COVER_STORAGE_KEY, {}))) {
      const property = this.getProperty(propertyId);
      if (property?.images.includes(url)) property.images = [url, ...property.images.filter(item => item !== url)];
    }
  }

  private restoreHouseholds(): void {
    for (const [propertyId, household] of Object.entries(this.readJson<Record<string, Household>>(HOUSEHOLD_STORAGE_KEY, {}))) {
      const property = this.getProperty(propertyId);
      if (property) property.household = household;
    }
  }

  private readJson<T>(key: string, fallback: T): T {
    try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback; } catch { return fallback; }
  }
  private writeJson(key: string, value: unknown): void {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable: changes last for this visit only */ }
  }

  private saveRoomChanges(): void {
    const overrides: Record<string, RoomOverride> = {};
    for (const room of PROPERTIES.flatMap(property => property.rooms ?? [])) overrides[room.id] = { status:room.status, tenant:room.tenant };
    this.writeJson(ROOM_STORAGE_KEY, overrides);
  }

  private restoreRoomChanges(): void {
    for (const [roomId, override] of Object.entries(this.readJson<Record<string, RoomOverride>>(ROOM_STORAGE_KEY, {}))) {
      const room = this.findRoom(roomId)?.room;
      if (room) Object.assign(room, override);
    }
  }
}
