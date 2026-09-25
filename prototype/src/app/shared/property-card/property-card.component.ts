import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Property } from '../../core/property.model';

@Component({
  selector: 'app-property-card', standalone: true, imports: [RouterLink, DatePipe],
  templateUrl: './property-card.component.html',
  styleUrl: './property-card.component.scss'
})
export class PropertyCardComponent { @Input({ required: true }) property!: Property; saved = false; }
