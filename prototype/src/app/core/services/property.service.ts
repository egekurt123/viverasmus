import { Injectable, signal } from '@angular/core';
import { Household, Property, PropertyFilters, Room, RoomStatus, Tenant } from '../models/property.model';
import { deleteImages } from '../storage/image-store';
import { FLATMATE_OPTIONS, flatmateCount } from '../config/flatmates';

const API = '/api';

export interface NewRoom { monthlyRent: number; area: number; availableFrom: string; features: string[]; images: string[]; }
export interface NewFlat {
  title: string; neighborhood: string; address: string; description: string; area: number; bathrooms: number;
  furnished: boolean; utilitiesIncluded: boolean; household: Household; amenities: string[]; images: string[]; rooms: NewRoom[];
}

interface ApiError { message?: string; detail?: string; }
export interface TenantAccountSettings {
  roomId: string; email: string; reservationPaid: boolean; depositPaid: boolean; paidMonths: string[];
}
export type TenantAccountUpdate = Omit<TenantAccountSettings, 'roomId'> & { password: string };

/** Listing and room data are loaded from and saved to the Spring Boot API. */
@Injectable({ providedIn: 'root' })
export class PropertyService {
  private readonly listingState = signal<Property[]>([]);
  private readonly tenantAccountState = signal<Record<string, TenantAccountSettings>>({});
  readonly loading = signal(true);
  readonly loadError = signal('');
  /** Bumped after API refreshes or optimistic edits so cached searches are recalculated. */
  version = 0;

  constructor() { void this.reload(); }

  async reload(): Promise<void> {
    this.loading.set(true);
    try {
      const properties = await this.request<Property[]>(`${API}/properties`);
      this.listingState.set(properties);
      await this.reloadTenantAccounts();
      this.loadError.set('');
      this.version++;
    } catch (error) {
      this.loadError.set(this.errorText(error));
    } finally {
      this.loading.set(false);
    }
  }

  getProperties(): Property[] { return this.listingState(); }
  getProperty(id: string): Property | undefined { return this.listingState().find(property => property.id === id); }
  getTenantAccount(roomId: string): TenantAccountSettings | undefined { return this.tenantAccountState()[roomId]; }

  async saveTenantAccount(roomId: string, update: TenantAccountUpdate): Promise<void> {
    await this.request<void>(`${API}/rooms/${encodeURIComponent(roomId)}/tenant-account`, {
      method: 'PUT', body: JSON.stringify(update)
    });
    await this.reloadTenantAccounts();
  }

  async reloadTenantAccounts(): Promise<void> {
    try {
      const accounts = await this.request<TenantAccountSettings[]>(`${API}/admin/tenant-accounts`);
      this.tenantAccountState.set(Object.fromEntries(accounts.map(account => [account.roomId, account])));
    } catch { /* tenant account settings are available after backend migration V3 */ }
  }
  getFeaturedProperties(): Property[] { return this.listingState().filter(property => property.featured); }
  isFeatured(propertyId: string): boolean { return this.getProperty(propertyId)?.featured ?? false; }

  toggleFeatured(propertyId: string): void {
    const property = this.getProperty(propertyId);
    if (!property) return;
    const featured = !property.featured;
    this.replaceProperty(propertyId, current => ({ ...current, featured }));
    void this.mutate(`${API}/properties/${encodeURIComponent(propertyId)}/featured`, 'PATCH', { featured });
  }

  findRoom(roomId: string): { property: Property; room: Room } | undefined {
    for (const property of this.listingState()) {
      const room = property.rooms?.find(item => item.id === roomId);
      if (room) return { property, room };
    }
    return undefined;
  }

  matchingRooms(property: Property, filters: PropertyFilters = {}): Room[] {
    return (property.rooms ?? []).filter(room => {
      if (room.status !== 'available') return false;
      if (filters.maxRent && room.monthlyRent > filters.maxRent) return false;
      if (filters.availableFrom && room.availableFrom > filters.availableFrom) return false;
      if (filters.privateBathroom && !room.features.includes('Private bathroom')) return false;
      return true;
    });
  }

  fromRent(property: Property, filters: PropertyFilters = {}): number {
    const rooms = this.matchingRooms(property, filters);
    return rooms.length ? Math.min(...rooms.map(room => room.monthlyRent)) : property.monthlyRent;
  }

  searchProperties(filters: PropertyFilters): Property[] {
    return this.listingState().filter(property => {
      if (filters.query && !this.matchesQuery(property, filters.query)) return false;
      if (filters.household && property.household !== filters.household) return false;
      if (filters.neighborhood && property.neighborhood !== filters.neighborhood) return false;
      if (filters.propertyType && property.propertyType !== filters.propertyType) return false;
      const flatmates = FLATMATE_OPTIONS.find(option => option.value === filters.flatmates);
      if (flatmates && (flatmateCount(property) < flatmates.min || flatmateCount(property) > flatmates.max)) return false;
      if (property.rooms?.length) return this.matchingRooms(property, filters).length > 0;
      if (filters.privateBathroom && property.propertyType !== 'Studio') return false;
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

  updateRoom(roomId: string, status: RoomStatus, tenant?: Tenant): void {
    const found = this.findRoom(roomId);
    if (!found) return;
    const bookedBy = status === 'booked' ? tenant ?? found.room.tenant ?? { gender: 'female', country: 'Germany' } : undefined;
    this.replaceRoom(roomId, room => ({
      ...room,
      status,
      tenant: bookedBy,
      ...(status === 'available' ? { occupiedFrom: undefined, occupiedUntil: undefined } : {})
    }));
    void this.mutate(`${API}/rooms/${encodeURIComponent(roomId)}/status`, 'PUT', { status, tenant: bookedBy });
  }

  updateRoomAvailability(roomId: string, availableFrom: string): boolean {
    if (!this.findRoom(roomId) || !availableFrom) return false;
    this.replaceRoom(roomId, room => ({ ...room, availableFrom }));
    void this.mutate(`${API}/rooms/${encodeURIComponent(roomId)}/availability`, 'PATCH', { availableFrom });
    return true;
  }

  updateRoomOccupancy(roomId: string, occupiedFrom: string, occupiedUntil: string): boolean {
    const found = this.findRoom(roomId);
    if (!found || found.room.status !== 'booked' || !occupiedFrom || !occupiedUntil || occupiedFrom > occupiedUntil) return false;
    this.replaceRoom(roomId, room => ({ ...room, occupiedFrom, occupiedUntil }));
    void this.mutate(`${API}/rooms/${encodeURIComponent(roomId)}/occupancy`, 'PATCH', { occupiedFrom, occupiedUntil });
    return true;
  }

  flatPhotos(property: Property): string[] {
    const roomPhotos = new Set((property.rooms ?? []).flatMap(room => room.images ?? []));
    return property.images.filter(url => !roomPhotos.has(url));
  }

  setCover(propertyId: string, url: string): void {
    const property = this.getProperty(propertyId);
    if (!property?.images.includes(url)) return;
    const images = [url, ...property.images.filter(item => item !== url)];
    this.replaceProperty(propertyId, current => ({ ...current, images }));
    void this.mutate(`${API}/properties/${encodeURIComponent(propertyId)}/cover`, 'PATCH', { url });
  }

  setRoomCover(roomId: string, url: string): void {
    const found = this.findRoom(roomId);
    if (!found?.room.images?.includes(url)) return;
    const images = [url, ...found.room.images.filter(item => item !== url)];
    this.replaceRoom(roomId, room => ({ ...room, images }));
    void this.mutate(`${API}/rooms/${encodeURIComponent(roomId)}/cover`, 'PATCH', { url });
  }

  setHousehold(propertyId: string, household: Household): void {
    if (!this.getProperty(propertyId)) return;
    this.replaceProperty(propertyId, property => ({ ...property, household }));
    void this.mutate(`${API}/properties/${encodeURIComponent(propertyId)}/household`, 'PATCH', { household });
  }

  async addFlat(flat: NewFlat): Promise<string> {
    const created = await this.request<{ id: string }>(`${API}/properties`, {
      method: 'POST', body: JSON.stringify(flat)
    });
    await this.reload();
    return created.id;
  }

  async removeFlat(propertyId: string): Promise<void> {
    const property = this.getProperty(propertyId);
    if (!property?.custom || property.deletable === false) return;
    await this.request<void>(`${API}/properties/${encodeURIComponent(propertyId)}`, { method: 'DELETE' });
    this.listingState.update(properties => properties.filter(item => item.id !== propertyId));
    this.version++;
    await deleteImages([...property.images, ...(property.rooms ?? []).flatMap(room => room.images ?? [])]);
  }

  private replaceProperty(id: string, update: (property: Property) => Property): void {
    this.listingState.update(properties => properties.map(property => property.id === id ? update(property) : property));
    this.version++;
  }

  private replaceRoom(id: string, update: (room: Room) => Room): void {
    this.listingState.update(properties => properties.map(property => property.rooms?.some(room => room.id === id)
      ? { ...property, rooms: property.rooms.map(room => room.id === id ? update(room) : room) }
      : property));
    this.version++;
  }

  private async mutate(url: string, method: string, body: unknown): Promise<void> {
    try {
      await this.request<void>(url, { method, body: JSON.stringify(body) });
      this.loadError.set('');
    } catch (error) {
      this.loadError.set(this.errorText(error));
      await this.reload();
    }
  }

  private async request<T>(url: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
      ...init,
      headers: { ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...init.headers }
    });
    if (!response.ok) {
      let detail = '';
      try {
        const body = await response.json() as ApiError;
        detail = body.detail ?? body.message ?? '';
      } catch { /* status is enough when the API has no JSON error body */ }
      throw new Error(detail || 'Our service is temporarily unavailable. Please try again later.');
    }
    if (response.status === 204) return undefined as T;
    return await response.json() as T;
  }

  private errorText(error: unknown): string {
    return error instanceof Error ? error.message : 'Could not load listings from the server.';
  }
}
