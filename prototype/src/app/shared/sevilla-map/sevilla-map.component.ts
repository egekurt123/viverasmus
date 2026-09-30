import { AfterViewInit, Component, ElementRef, Input, NgZone, OnChanges, OnDestroy, ViewChild, ViewEncapsulation, inject } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { Property } from '../../core/models/property.model';

const SEVILLA_CENTER: L.LatLngExpression = [37.3891, -5.9845];

/** OpenStreetMap of Sevilla with a price pin per property. */
@Component({
  selector: 'app-sevilla-map', standalone: true,
  templateUrl: './sevilla-map.component.html',
  styleUrl: './sevilla-map.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class SevillaMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() properties: Property[] = [];
  @Input() zoom = 15;
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

  ngOnChanges(): void { if (this.map) this.zone.runOutsideAngular(() => this.renderMarkers()); }

  ngOnDestroy(): void { this.map?.remove(); }

  private renderMarkers(): void {
    if (!this.map) return;
    this.markers.clearLayers();
    for (const property of this.properties) {
      const icon = L.divIcon({ className: 'sevilla-pin', html: `<span>${property.rooms ? 'from ' : ''}€${this.rents[property.id] ?? property.monthlyRent}</span>`, iconSize: undefined });
      L.marker([property.latitude, property.longitude], { icon, title: property.title })
        .bindPopup(this.popup(property), { closeButton: false })
        .addTo(this.markers);
    }
    if (this.properties.length === 1) {
      const [only] = this.properties;
      this.map.setView([only.latitude, only.longitude], this.zoom);
    } else if (this.properties.length) {
      this.map.fitBounds(L.latLngBounds(this.properties.map(p => [p.latitude, p.longitude] as L.LatLngTuple)), { padding: [40, 40], maxZoom: 15 });
    } else {
      this.map.setView(SEVILLA_CENTER, 13);
    }
  }

  private popup(property: Property): HTMLElement {
    const el = document.createElement('div');
    el.className = 'sevilla-popup';
    el.innerHTML = `<strong></strong><small></small><button type="button">View place →</button>`;
    el.querySelector('strong')!.textContent = property.title;
    el.querySelector('small')!.textContent = `${property.rooms ? `Whole flat · ${property.rooms.length} rooms` : property.propertyType} · ${property.neighborhood}`;
    el.querySelector('button')!.addEventListener('click', () => this.zone.run(() => void this.router.navigate(['/properties', property.id])));
    return el;
  }
}
