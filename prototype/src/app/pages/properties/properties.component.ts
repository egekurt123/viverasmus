import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../core/services/property.service';
import { Property, PropertyFilters, Room } from '../../core/models/property.model';
import { PropertyCardComponent } from '../../shared/property-card/property-card.component';
import { MOVE_IN_OPTIONS } from '../../core/config/move-in';
import { SevillaMapComponent } from '../../shared/sevilla-map/sevilla-map.component';
import { FLATMATE_OPTIONS } from '../../core/config/flatmates';

@Component({
  standalone: true, imports: [FormsModule, RouterLink, DatePipe, PropertyCardComponent, SevillaMapComponent],
  templateUrl: './properties.component.html',
  styleUrl: './properties.component.scss'
})
export class PropertiesComponent {
  private service = inject(PropertyService); private route = inject(ActivatedRoute); private router = inject(Router);
  areas = ['Alameda','Centro','Los Remedios','Macarena','Nervión','San Bernardo','Triana'];
  moveInOptions = MOVE_IN_OPTIONS;
  types = [{ value:'Private room', label:'Room in a flat share' }, { value:'Studio', label:'Studio' }];
  flatmateOptions = FLATMATE_OPTIONS;
  query = ''; household: '' | 'women' | 'men' = ''; neighborhood = ''; maxRent: number | null = null; propertyType = ''; flatmates = ''; availableFrom = ''; sortBy = 'recommended'; mobileFilters = false;
  constructor() {
    this.route.queryParamMap.subscribe(params => {
      this.query = params.get('q') ?? '';
      const household = params.get('household');
      this.household = household === 'women' || household === 'men' ? household : '';
      this.neighborhood = params.get('neighborhood') ?? '';
      this.maxRent = params.get('maxRent') ? Number(params.get('maxRent')) : null;
      this.propertyType = params.get('propertyType') ?? '';
      this.flatmates = params.get('flatmates') ?? '';
      this.availableFrom = params.get('availableFrom') ?? '';
    });
  }
  get activeFilterCount(): number { return [this.household, this.neighborhood, this.maxRent, this.propertyType, this.flatmates, this.availableFrom].filter(Boolean).length; }
  get flatmateLabel(): string { return this.flatmateOptions.find(option => option.value === this.flatmates)?.label ?? ''; }
  get filters(): PropertyFilters { return { query:this.query.trim(), household:this.household, neighborhood:this.neighborhood, maxRent:this.maxRent, propertyType:this.propertyType, flatmates:this.flatmates, availableFrom:this.availableFrom }; }
  private cache?: { key: string; results: Property[]; rents: Record<string, number>; rooms: Record<string, Room[]> };
  /** Memoised so the map and cards only re-render when the search actually changes. */
  private get search(): { results: Property[]; rents: Record<string, number>; rooms: Record<string, Room[]> } {
    const filters = this.filters;
    const key = JSON.stringify([filters, this.sortBy, this.service.version]);
    if (this.cache?.key !== key) {
      const rent = (property: Property) => this.service.fromRent(property, filters);
      const results = [...this.service.searchProperties(filters)].sort((a,b) => this.sortBy === 'low' ? rent(a)-rent(b) : this.sortBy === 'high' ? rent(b)-rent(a) : this.sortBy === 'newest' ? a.availableFrom.localeCompare(b.availableFrom) : 0);
      this.cache = { key, results, rents:Object.fromEntries(results.map(property => [property.id, rent(property)])), rooms:Object.fromEntries(results.map(property => [property.id, this.service.matchingRooms(property, filters)])) };
    }
    return this.cache;
  }
  get results(): Property[] { return this.search.results; }
  get rents(): Record<string, number> { return this.search.rents; }
  /** Free rooms of a flat share that fit the current rent and move-in filters. */
  roomsFor(property: Property): Room[] | undefined { return property.rooms ? this.search.rooms[property.id] : undefined; }
  applyFilters(): void {
      void this.router.navigate([], { relativeTo:this.route, queryParams:{ q:this.query.trim()||null, household:this.household||null, neighborhood:this.neighborhood||null, maxRent:this.maxRent, propertyType:this.propertyType||null, flatmates:this.flatmates||null, availableFrom:this.availableFrom||null }, replaceUrl:true });
  }
  toggleType(type: string): void { this.propertyType = this.propertyType === type ? '' : type; this.applyFilters(); }
  setHousehold(value: '' | 'women' | 'men'): void { this.household = value; this.applyFilters(); }
  clearFilters(): void { this.query=''; this.household=''; this.neighborhood=''; this.maxRent=null; this.propertyType=''; this.flatmates=''; this.availableFrom=''; this.applyFilters(); }
}
