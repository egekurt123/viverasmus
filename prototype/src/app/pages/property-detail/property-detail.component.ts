import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../core/services/property.service';
import { Property, Room } from '../../core/models/property.model';
import { AuthService } from '../../core/services/auth.service';
import { flagFor } from '../../core/config/countries';
import { RoomAdminComponent } from '../../shared/room-admin/room-admin.component';
import { CoverPickerComponent } from '../../shared/cover-picker/cover-picker.component';
import { PhotoViewerComponent } from '../../shared/photo-viewer/photo-viewer.component';
import { RoomTileComponent } from '../../shared/room-tile/room-tile.component';
import { PropertyCardComponent } from '../../shared/property-card/property-card.component';
import { SevillaMapComponent } from '../../shared/sevilla-map/sevilla-map.component';

@Component({
  standalone: true, imports:[DatePipe, RouterLink, FormsModule, PropertyCardComponent, SevillaMapComponent, RoomAdminComponent, CoverPickerComponent, PhotoViewerComponent, RoomTileComponent],
  templateUrl: './property-detail.component.html',
  styleUrl:'./property-detail.component.scss'
})
export class PropertyDetailComponent {
  private route = inject(ActivatedRoute); private service = inject(PropertyService); private destroyRef = inject(DestroyRef);
  auth = inject(AuthService); flagFor = flagFor;
  private propertyId = ''; private roomId = '';
  /** Looked up live, so flats the office added appear once their photos have loaded. */
  get property(): Property | undefined { return this.service.getProperty(this.propertyId); }
  /** Set on a room page (/properties/:id/rooms/:roomId); undefined on the flat overview. */
  get room(): Room | undefined { return this.property?.rooms?.find(room => room.id === this.roomId); }
  /** Index of the photo open in the full-screen viewer, or null when it is closed. */
  viewerIndex: number | null = null;
  contactOpen=false; sent=false; guestName=''; guestEmail=''; message='Hello, I’m planning a stay in Sevilla and would love to know more about this place.';
  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.propertyId = params.get('id') ?? '';
      this.roomId = params.get('roomId') ?? '';
      this.viewerIndex = null; this.contactOpen = false; this.sent = false;
      window.scrollTo?.({ top:0 });
    });
  }
  private galleryCache?: { key: string; photos: string[] };
  /**
   * Room page: that room's photos, then the flat's own photos.
   * Flat page: only the flat's own photos (cover first) — room photos live on the room pages.
   */
  get gallery(): string[] {
    const property = this.property;
    if (!property) return [];
    const flatPhotos = this.service.flatPhotos(property);
    const photos = [...new Set([...(this.room?.images ?? []), ...(flatPhotos.length ? flatPhotos : property.images)])];
    const key = photos.join('|');
    if (this.galleryCache?.key !== key) this.galleryCache = { key, photos };
    return this.galleryCache.photos;
  }
  openViewer(index: number): void { this.viewerIndex = index; }
  /** Photos the office can pick a cover from on this page. */
  get coverChoices(): string[] { return this.room ? this.room.images ?? [] : this.property ? this.service.flatPhotos(this.property) : []; }
  setCover(url: string): void {
    if (this.room) this.service.setRoomCover(this.room.id, url); else if (this.property) this.service.setCover(this.property.id, url);
  }
  get rent(): number { return this.room?.monthlyRent ?? this.property?.monthlyRent ?? 0; }
  get priceUnit(): string { return this.property?.rooms ? '/ room / month' : '/ month'; }
  get freeRooms(): number { return this.property?.rooms?.filter(room => room.status === 'available').length ?? 0; }
  get flatmates(): { women: number; men: number; countries: string[] } {
    const tenants = (this.property?.rooms ?? []).flatMap(room => room.tenant && room.id !== this.room?.id ? [room.tenant] : []);
    return { women:tenants.filter(t => t.gender === 'female').length, men:tenants.filter(t => t.gender === 'male').length, countries:[...new Set(tenants.map(t => t.country))] };
  }
  get similar(): Property[] { return this.service.getProperties().filter(item => item.id !== this.property?.id).sort((a,b) => Number(b.neighborhood === this.property?.neighborhood)-Number(a.neighborhood === this.property?.neighborhood)).slice(0,3); }
  sendMessage(): void { this.sent = true; }
}
