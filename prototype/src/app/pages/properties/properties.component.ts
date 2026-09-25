import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../core/property.service';
import { Property, PropertyFilters } from '../../core/property.model';
import { PropertyCardComponent } from '../../shared/property-card/property-card.component';

@Component({
  standalone: true, imports: [FormsModule, RouterLink, DatePipe, PropertyCardComponent],
  templateUrl: './properties.component.html',
  styleUrl: './properties.component.scss'
})
export class PropertiesComponent {
  private service = inject(PropertyService); private route = inject(ActivatedRoute); private router = inject(Router);
  properties = this.service.getProperties(); areas = ['Alameda','Centro','Los Remedios','Macarena','Nervión','San Bernardo','Triana'];
  types = ['Private room','Shared room','Studio','Apartment','House'];
  amenityOptions = ['Wi-Fi','Air conditioning','Washing machine','Desk','Balcony','Dishwasher','Elevator'];
  neighborhood = ''; maxRent: number | null = null; propertyType = ''; bedrooms: number | null = null; furnished: boolean | null = null; selectedAmenities: string[] = []; availableFrom = ''; sortBy = 'recommended'; mobileFilters = false; selectedPin = '';
  constructor() {
    this.route.queryParamMap.subscribe(params => {
      this.neighborhood = params.get('neighborhood') ?? '';
      this.maxRent = params.get('maxRent') ? Number(params.get('maxRent')) : null;
      this.propertyType = params.get('propertyType') ?? '';
      this.bedrooms = params.get('bedrooms') ? Number(params.get('bedrooms')) : null;
      this.availableFrom = params.get('availableFrom') ?? '';
      this.furnished = params.get('furnished') === 'true' ? true : params.get('furnished') === 'false' ? false : null;
      this.selectedAmenities = params.get('amenities')?.split(',').filter(Boolean) ?? [];
    });
  }
  get activeFilterCount(): number { return [this.neighborhood, this.maxRent, this.propertyType, this.bedrooms, this.furnished !== null, this.availableFrom, ...this.selectedAmenities].filter(Boolean).length; }
  get results(): Property[] {
    const filtered = this.service.searchProperties({ neighborhood:this.neighborhood, maxRent:this.maxRent, propertyType:this.propertyType, bedrooms:this.bedrooms, furnished:this.furnished, amenities:this.selectedAmenities, availableFrom:this.availableFrom } satisfies PropertyFilters);
    return [...filtered].sort((a,b) => this.sortBy === 'low' ? a.monthlyRent-b.monthlyRent : this.sortBy === 'high' ? b.monthlyRent-a.monthlyRent : this.sortBy === 'newest' ? a.availableFrom.localeCompare(b.availableFrom) : 0);
  }
  pin(index: number): {x:number;y:number} { const points = [{x:25,y:40},{x:55,y:27},{x:71,y:49},{x:38,y:63},{x:63,y:70},{x:46,y:34},{x:21,y:61},{x:79,y:36}]; return points[index % points.length]; }
  applyFilters(): void {
      void this.router.navigate([], { relativeTo:this.route, queryParams:{ neighborhood:this.neighborhood||null, maxRent:this.maxRent, propertyType:this.propertyType||null, bedrooms:this.bedrooms, furnished:this.furnished, availableFrom:this.availableFrom||null, amenities:this.selectedAmenities.length ? this.selectedAmenities.join(',') : null }, queryParamsHandling:'merge', replaceUrl:true });
  }
  toggleType(type: string): void { this.propertyType = this.propertyType === type ? '' : type; this.applyFilters(); }
  setFurnished(value: boolean | null): void { this.furnished = value; this.applyFilters(); }
  toggleAmenity(amenity: string): void { this.selectedAmenities = this.selectedAmenities.includes(amenity) ? this.selectedAmenities.filter(item => item !== amenity) : [...this.selectedAmenities, amenity]; this.applyFilters(); }
  clearFilters(): void { this.neighborhood=''; this.maxRent=null; this.propertyType=''; this.bedrooms=null; this.furnished=null; this.availableFrom=''; this.selectedAmenities=[]; this.applyFilters(); }
}
