import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../core/services/property.service';
import { Room, TenantGender } from '../../core/models/property.model';
import { COUNTRIES } from '../../core/config/countries';

/** Admin-only controls to mark a room as booked and record who booked it. */
@Component({
  selector: 'app-room-admin', standalone: true, imports: [FormsModule],
  templateUrl: './room-admin.component.html',
  styleUrl: './room-admin.component.scss'
})
export class RoomAdminComponent {
  @Input({ required: true }) room!: Room;
  private service = inject(PropertyService);
  countries = COUNTRIES;
  availableFrom = '';
  occupiedFrom = '';
  occupiedUntil = '';
  availabilityError = '';
  occupancyError = '';

  ngOnInit(): void {
    this.availableFrom = this.room.availableFrom;
    this.occupiedFrom = this.room.occupiedFrom ?? '';
    this.occupiedUntil = this.room.occupiedUntil ?? '';
  }

  setStatus(status: Room['status']): void { this.service.updateRoom(this.room.id, status); }
  setGender(gender: TenantGender): void { this.service.updateRoom(this.room.id, 'booked', { ...this.room.tenant!, gender }); }
  setCountry(country: string): void { this.service.updateRoom(this.room.id, 'booked', { ...this.room.tenant!, country }); }
  saveAvailability(): void {
    if (!this.service.updateRoomAvailability(this.room.id, this.availableFrom)) {
      this.availabilityError = 'Enter an availability date.';
      return;
    }
    this.availabilityError = '';
  }

  saveOccupancy(): void {
    if (!this.service.updateRoomOccupancy(this.room.id, this.occupiedFrom, this.occupiedUntil)) {
      this.occupancyError = 'Enter a valid start and end date.';
      return;
    }
    this.occupancyError = '';
  }
}
