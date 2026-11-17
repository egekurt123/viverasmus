import { AfterViewInit, Component, ElementRef, Input, NgZone, OnChanges, OnDestroy, SimpleChanges, ViewChild, ViewEncapsulation, inject } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { Property } from '../../core/models/property.model';

export interface UniversityCampus {
  eyebrow: string;
  name: string;
  latitude: number;
  longitude: number;
}

export const UNIVERSITY_CAMPUSES: UniversityCampus[] = [
  { eyebrow: 'Universidad de Sevilla', name: 'Campus Reina Mercedes', latitude: 37.36042, longitude: -5.98766 },
  { eyebrow: 'Universidad de Sevilla', name: 'Campus Ramón y Cajal', latitude: 37.37749, longitude: -5.97823 },
  { eyebrow: 'Universidad de Sevilla', name: 'Campus Macarena', latitude: 37.40682, longitude: -5.98846 },
  { eyebrow: 'Universidad de Sevilla', name: 'Campus Cartuja', latitude: 37.4100, longitude: -6.0050 },
  { eyebrow: 'Universidad de Sevilla', name: 'Campus Central (Rectorado)', latitude: 37.3820, longitude: -5.9910 },
  { eyebrow: 'Universidad de Sevilla', name: 'Campus Politécnica', latitude: 37.3580, longitude: -6.0050 },
  { eyebrow: 'Universidad Pablo de Olavide', name: 'Main Campus', latitude: 37.3560, longitude: -5.9400 },
  { eyebrow: 'Universidad Internacional de Andalucía (La Cartuja)', name: 'Main Campus', latitude: 37.4110, longitude: -6.0040 }
];

const SEVILLA_CENTER: L.LatLngExpression = [37.3891, -5.9845];
const DETAIL_ZOOM = 15;
const CAMPUS_ICON_SVG = '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="currentColor"><path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3zm0 13.72L5 12.9v3.6c0 1.93 3.13 3.5 7 3.5s7-1.57 7-3.5v-3.6l-7 3.82z"/></svg>';
const CAMPUS_ICON = L.divIcon({
  className: 'campus-pin',
  html: `<span>${CAMPUS_ICON_SVG}</span>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -16]
});
const CAMPUS_POINTS: L.LatLngTuple[] = UNIVERSITY_CAMPUSES.map(c => [c.latitude, c.longitude]);

/** OpenStreetMap of Sevilla with a price pin per property and university campus pins. */
@Component({
  selector: 'app-sevilla-map', standalone: true,
  templateUrl: './sevilla-map.component.html',
  styleUrl: './sevilla-map.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class SevillaMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() properties: Property[] = [];
  /** Optional rent per property id, e.g. the cheapest room matching the search. */
  @Input() rents: Record<string, number> = {};
  @ViewChild('map') private mapElement!: ElementRef<HTMLDivElement>;
  private router = inject(Router);
  private zone = inject(NgZone);
  private map?: L.Map;
  private markers = L.layerGroup();

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.map = L.map(this.mapElement.nativeElement, { scrollWheelZoom: false }).setView(SEVILLA_CENTER, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(this.map);
      this.markers.addTo(this.map);
      this.renderMarkers();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.map) return;
    if (changes['properties'] || changes['rents']) {
      this.zone.runOutsideAngular(() => this.renderMarkers());
    }
  }

  ngOnDestroy(): void { this.map?.remove(); }

  private renderMarkers(): void {
    if (!this.map) return;
    this.markers.clearLayers();

    for (const campus of UNIVERSITY_CAMPUSES) {
      L.marker([campus.latitude, campus.longitude], { icon: CAMPUS_ICON, title: campus.name })
        .bindTooltip(campus.name, { direction: 'top', offset: [0, -16], className: 'campus-tooltip' })
        .bindPopup(this.campusPopup(campus), { closeButton: false })
        .addTo(this.markers);
    }

    for (const property of this.properties) {
      const rent = this.rents[property.id] ?? property.monthlyRent;
      const label = property.rooms ? `from €${rent}` : `€${rent}`;
      const icon = L.divIcon({ className: 'sevilla-pin', html: `<span>${label}</span>`, iconSize: undefined });
      L.marker([property.latitude, property.longitude], { icon, title: property.title, zIndexOffset: 100 })
        .bindPopup(this.propertyPopup(property), { closeButton: false })
        .addTo(this.markers);
    }

    if (this.properties.length === 1) {
      const [only] = this.properties;
      this.map.setView([only.latitude, only.longitude], DETAIL_ZOOM);
    } else {
      const points: L.LatLngTuple[] = [
        ...this.properties.map(p => [p.latitude, p.longitude] as L.LatLngTuple),
        ...CAMPUS_POINTS
      ];
      this.map.fitBounds(L.latLngBounds(points), { padding: [36, 36], maxZoom: 15 });
    }
  }

  private createPopup(html: string): HTMLElement {
    const el = document.createElement('div');
    el.className = 'sevilla-popup';
    el.innerHTML = html;
    return el;
  }

  private propertyPopup(property: Property): HTMLElement {
    const subtitle = property.rooms
      ? `Whole flat · ${property.rooms.length} rooms`
      : property.propertyType;
    const el = this.createPopup('<strong></strong><small></small><button type="button">View place →</button>');
    el.querySelector('strong')!.textContent = property.title;
    el.querySelector('small')!.textContent = `${subtitle} · ${property.neighborhood}`;
    el.querySelector('button')!.addEventListener('click', () =>
      this.zone.run(() => void this.router.navigate(['/properties', property.id]))
    );
    return el;
  }

  private campusPopup(campus: UniversityCampus): HTMLElement {
    const el = this.createPopup('<span class="campus-eyebrow"></span><strong></strong>');
    el.querySelector('.campus-eyebrow')!.textContent = campus.eyebrow;
    el.querySelector('strong')!.textContent = campus.name;
    return el;
  }
}
