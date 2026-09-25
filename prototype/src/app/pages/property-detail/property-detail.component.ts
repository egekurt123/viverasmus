import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../core/property.service';
import { Property } from '../../core/property.model';
import { PropertyCardComponent } from '../../shared/property-card/property-card.component';

@Component({
  standalone: true, imports:[DatePipe, RouterLink, FormsModule, PropertyCardComponent],
  templateUrl: './property-detail.component.html',
  styleUrl:'./property-detail.component.scss'
})
export class PropertyDetailComponent {
  private route = inject(ActivatedRoute); private service = inject(PropertyService); private destroyRef = inject(DestroyRef);
  property?: Property;
  activeImage=0; contactOpen=false; sent=false; guestName=''; guestEmail=''; message='Hello, I’m planning a stay in Sevilla and would love to know more about this place.';
  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.property = this.service.getProperty(params.get('id') ?? '');
      this.activeImage = 0; this.contactOpen = false; this.sent = false;
    });
  }
  get similar(): Property[] { return this.service.getProperties().filter(item => item.id !== this.property?.id).sort((a,b) => Number(b.neighborhood === this.property?.neighborhood)-Number(a.neighborhood === this.property?.neighborhood)).slice(0,3); }
  sendMessage(): void { this.sent = true; }
}
