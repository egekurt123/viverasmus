import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PropertyService } from '../../core/property.service';
import { PropertyCardComponent } from '../../shared/property-card/property-card.component';

@Component({
  standalone: true, imports: [FormsModule, RouterLink, PropertyCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private service = inject(PropertyService);
  private router = inject(Router);
  areas = ['Alameda', 'Centro', 'Los Remedios', 'Macarena', 'Nervión', 'San Bernardo', 'Triana'];
  featured = this.service.getProperties().filter(property => ['triana-sunlit-room','alameda-artists-studio','nervion-shared-flat','san-bernardo-balcony-room'].includes(property.id));
  neighborhood = ''; moveIn = ''; budget = '';
  areaCards = [
    { name:'Triana', note:'Across the river', no:'01', image:'/assets/brigde%20sunset.png' },
    { name:'Alameda', note:'A lively local scene', no:'02', image:'/assets/setas.png' },
    { name:'Nervión', note:'Everyday city living', no:'03', image:'/assets/Plaza%20de%20espana.png' },
    { name:'Centro', note:'Historic streets', no:'04', image:'/assets/setas.png' }
  ];
  search() { void this.router.navigateByUrl(this.searchUrl()); }
  private searchUrl(): string {
    const params = new URLSearchParams();
    if (this.neighborhood) params.set('neighborhood', this.neighborhood);
    if (this.budget) params.set('maxRent', this.budget);
    if (this.moveIn) params.set('availableFrom', `${this.moveIn}-01`);
    return `/properties${params.size ? '?' + params.toString() : ''}`;
  }
}
