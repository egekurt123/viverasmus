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
  search = '';
  /** Read live so flats added or removed by the office show up straight away. */
  get flats(): Property[] { return this.service.getProperties().filter(property => property.rooms); }
  get rooms(): Room[] { return this.flats.flatMap(flat => flat.rooms!); }
  get bookedCount(): number { return this.rooms.filter(room => room.status === 'booked').length; }
  get visibleFlats(): Property[] { const term = this.search.trim().toLowerCase(); return this.flats.filter(flat => !term || `${flat.title} ${flat.neighborhood}`.toLowerCase().includes(term)); }
  visibleRooms(flat: Property): Room[] { return flat.rooms!.filter(room => !this.statusFilter || room.status === this.statusFilter); }
  isPopular(flat: Property): boolean { return this.service.isPopular(flat.id); }
  togglePopular(flat: Property): void { this.service.togglePopular(flat.id); }
  setHousehold(flat: Property, household: Household): void { this.service.setHousehold(flat.id, household); }
  remove(flat: Property): void { if (confirm(`Remove “${flat.title}” and its photos? This can’t be undone.`)) void this.service.removeFlat(flat.id); }
  bookedIn(flat: Property): number { return flat.rooms!.filter(room => room.status === 'booked').length; }
}
