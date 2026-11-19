import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import { Household, Property, Room } from '../../core/models/property.model';
import { flagFor } from '../../core/config/countries';
import { RoomAdminComponent } from '../../shared/room-admin/room-admin.component';

/** Team overview: every flat share and its rooms, with controls to mark rooms booked. */
@Component({
  standalone: true, imports: [DatePipe, FormsModule, RouterLink, RoomAdminComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {
  private service = inject(PropertyService);
  flagFor = flagFor;
  statusFilter: '' | Room['status'] = '';
  dateFilter = '';
  search = '';
  /** Read live so flats added or removed by the office show up straight away. */
  get flats(): Property[] { return this.service.getProperties().filter(property => property.rooms); }
  get rooms(): Room[] { return this.flats.flatMap(flat => flat.rooms!); }
  get bookedCount(): number { return this.rooms.filter(room => room.status === 'booked').length; }
  get visibleFlats(): Property[] {
    const term = this.search.trim().toLowerCase();
    return this.flats.filter(flat =>
      (!term || `${flat.title} ${flat.neighborhood}`.toLowerCase().includes(term)) &&
      (!this.dateFilter || this.visibleRooms(flat).length > 0)
    );
  }
  visibleRooms(flat: Property): Room[] {
    return flat.rooms!.filter(room =>
      (!this.statusFilter || this.roomMatchesStatus(room, this.statusFilter)) &&
      (!this.dateFilter || this.roomMatchesDate(room, this.dateFilter))
    );
  }
  isFeatured(flat: Property): boolean { return this.service.isFeatured(flat.id); }
  toggleFeatured(flat: Property): void { this.service.toggleFeatured(flat.id); }
  setHousehold(flat: Property, household: Household): void { this.service.setHousehold(flat.id, household); }
  remove(flat: Property): void { if (confirm(`Remove “${flat.title}” and its photos? This can’t be undone.`)) void this.service.removeFlat(flat.id); }
  bookedIn(flat: Property): number { return flat.rooms!.filter(room => room.status === 'booked').length; }

  private roomMatchesStatus(room: Room, status: Room['status']): boolean {
    return this.dateFilter ? this.roomMatchesDate(room, this.dateFilter) === (status === 'booked') : room.status === status;
  }

  private roomMatchesDate(room: Room, date: string): boolean {
    const booked = room.status === 'booked' &&
      (!room.occupiedFrom || !room.occupiedUntil || (date >= room.occupiedFrom && date <= room.occupiedUntil));
    if (this.statusFilter === 'booked') return booked;
    if (this.statusFilter === 'available') return !booked && date >= room.availableFrom;
    return booked || date >= room.availableFrom;
  }
}
