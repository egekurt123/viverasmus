import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Property, Room } from '../../core/models/property.model';

@Component({
  selector: 'app-property-card', standalone: true, imports: [RouterLink, DatePipe],
  templateUrl: './property-card.component.html',
  styleUrl: './property-card.component.scss'
})
export class PropertyCardComponent {
  @Input({ required: true }) property!: Property;
  /** Rooms to list on a flat-share card, e.g. the ones matching the search. Defaults to all free rooms. */
  @Input() rooms?: Room[];
  saved = false;
  get shownRooms(): Room[] { return this.rooms ?? this.property.rooms?.filter(room => room.status === 'available') ?? []; }
  get fromRent(): number { return this.shownRooms.length ? Math.min(...this.shownRooms.map(room => room.monthlyRent)) : this.property.monthlyRent; }
  get freeRoomCount(): number { return this.property.rooms?.filter(room => room.status === 'available').length ?? 0; }
}
