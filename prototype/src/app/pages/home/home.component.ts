import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import { PropertyCardComponent } from '../../shared/property-card/property-card.component';
import { MOVE_IN_OPTIONS } from '../../core/config/move-in';

@Component({
  standalone: true, imports: [FormsModule, RouterLink, PropertyCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private service = inject(PropertyService);
  private router = inject(Router);
  areas = ['Alameda', 'Centro', 'Los Remedios', 'Macarena', 'Nervión', 'San Bernardo', 'Triana'];
  total = this.service.getProperties().length;
  featured = this.service.getProperties().filter(property => ['paris','tores-studio','amsterdam','torre-del-oro'].includes(property.id));
  moveInOptions = MOVE_IN_OPTIONS;
  neighborhood = ''; moveIn = ''; budget = '';
  search() { void this.router.navigateByUrl(this.searchUrl()); }
  private searchUrl(): string {
    const params = new URLSearchParams();
    if (this.neighborhood) params.set('neighborhood', this.neighborhood);
    if (this.budget) params.set('maxRent', this.budget);
    if (this.moveIn) params.set('availableFrom', this.moveIn);
    return `/properties${params.size ? '?' + params.toString() : ''}`;
  }
}
