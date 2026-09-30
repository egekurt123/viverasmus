import { Component, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import { Household } from '../../core/models/property.model';
import { MOVE_IN_OPTIONS } from '../../core/config/move-in';
import { deleteImages, resolveImage, saveImage } from '../../core/storage/image-store';

interface Photo { ref: string; url: string; }
interface RoomDraft { monthlyRent: number | null; area: number | null; availableFrom: string; bed: 'Single bed' | 'Double bed'; extras: string[]; photos: Photo[]; }

const MAX_ROOMS = 10;

/** Admin: add a flat share and decide how many rooms it has, each with its own price and photos. */
@Component({
  standalone: true, imports: [FormsModule, RouterLink],
  templateUrl: './new-flat.component.html',
  styleUrl: './new-flat.component.scss'
})
export class NewFlatComponent implements OnDestroy {
  private service = inject(PropertyService); private router = inject(Router);
  areas = ['Alameda','Centro','Los Remedios','Macarena','Nervión','San Bernardo','Triana'];
  amenityOptions = ['Wi-Fi','Air conditioning','Heating','Washing machine','Dishwasher','Balcony','Elevator'];
  roomExtras = ['Desk','Wardrobe','Balcony access','Private bathroom'];
  moveInOptions = MOVE_IN_OPTIONS;
  maxRooms = MAX_ROOMS;

  title = ''; neighborhood = 'Triana'; address = ''; description = ''; area: number | null = null; bathrooms = 1;
  household: Household = 'mixed'; furnished = true; utilitiesIncluded = false; amenities: string[] = ['Wi-Fi','Washing machine'];
  photos: Photo[] = [];
  rooms: RoomDraft[] = [this.newRoom(), this.newRoom(), this.newRoom()];
  submitted = false; saving = false; uploading = 0; error = '';
  private saved = false;

  get roomCount(): number { return this.rooms.length; }
  set roomCount(count: number) {
    const target = Math.min(MAX_ROOMS, Math.max(1, Math.round(count) || 1));
    while (this.rooms.length < target) this.rooms.push(this.newRoom());
    if (this.rooms.length > target) void this.discard(this.rooms.splice(target).flatMap(room => room.photos));
  }

  toggle(list: string[], value: string): void { const index = list.indexOf(value); index >= 0 ? list.splice(index, 1) : list.push(value); }

  async addPhotos(event: Event, target: Photo[]): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []).filter(file => file.type.startsWith('image/'));
    input.value = '';
    this.error = '';
    this.uploading += files.length;
    for (const file of files) {
      try {
        const ref = await saveImage(file);
        const url = await resolveImage(ref);
        if (url) target.push({ ref, url });
      } catch { this.error = `“${file.name}” could not be read. Try a JPG or PNG.`; }
      this.uploading--;
    }
  }

  /** The first photo is the cover: shown first on the card and the page. */
  makeCover(target: Photo[], photo: Photo): void { target.splice(target.indexOf(photo), 1); target.unshift(photo); }

  removePhoto(target: Photo[], photo: Photo): void { target.splice(target.indexOf(photo), 1); void this.discard([photo]); }

  roomValid(room: RoomDraft): boolean { return !!room.monthlyRent && room.monthlyRent > 0 && !!room.area && room.area > 0; }
  get valid(): boolean { return !!this.title.trim() && !!this.address.trim() && this.rooms.every(room => this.roomValid(room)); }

  async save(): Promise<void> {
    this.submitted = true;
    if (!this.valid || this.saving || this.uploading) return;
    this.saving = true;
    const roomsArea = this.rooms.reduce((sum, room) => sum + (room.area ?? 0), 0);
    const id = await this.service.addFlat({
      title:this.title.trim(), neighborhood:this.neighborhood, address:this.address.trim(),
      description:this.description.trim() || `A furnished flat share in ${this.neighborhood} with ${this.rooms.length} rooms.`,
      area:this.area ?? roomsArea, bathrooms:this.bathrooms, furnished:this.furnished, utilitiesIncluded:this.utilitiesIncluded,
      household:this.household, amenities:[...this.amenities], images:this.photos.map(photo => photo.ref),
      rooms:this.rooms.map(room => ({ monthlyRent:room.monthlyRent!, area:room.area!, availableFrom:room.availableFrom, features:[room.bed, ...room.extras], images:room.photos.map(photo => photo.ref) }))
    });
    this.saved = true;
    void this.router.navigate(['/properties', id]);
  }

  /** Photos uploaded for a flat that was never saved are removed again. */
  ngOnDestroy(): void { if (!this.saved) void this.discard([...this.photos, ...this.rooms.flatMap(room => room.photos)]); }

  private newRoom(): RoomDraft { return { monthlyRent:null, area:null, availableFrom:MOVE_IN_OPTIONS[0].value, bed:'Double bed', extras:['Desk','Wardrobe'], photos:[] }; }
  private async discard(photos: Photo[]): Promise<void> { photos.forEach(photo => URL.revokeObjectURL(photo.url)); await deleteImages(photos.map(photo => photo.ref)); }
}
