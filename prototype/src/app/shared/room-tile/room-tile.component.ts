import { Component, Input, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Room } from '../../core/models/property.model';
import { AuthService } from '../../core/services/auth.service';
import { flagFor } from '../../core/config/countries';
import { RoomAdminComponent } from '../room-admin/room-admin.component';

/** One room on a flat page, linking to its own room page. */
@Component({
  selector: 'app-room-tile', standalone: true, imports: [DatePipe, RouterLink, RoomAdminComponent],
  templateUrl: './room-tile.component.html',
  styleUrl: './room-tile.component.scss'
})
export class RoomTileComponent {
  @Input({ required: true }) propertyId!: string;
  @Input({ required: true }) room!: Room;
  auth = inject(AuthService); flagFor = flagFor;
}
