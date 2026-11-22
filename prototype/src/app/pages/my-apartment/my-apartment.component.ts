import { Component, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Property, Room } from '../../core/models/property.model';

interface TenantHome {
  email: string;
  property: Property;
  room: Room;
  payments: { reservationPaid: boolean; depositPaid: boolean; depositAmount: number; paidMonths: string[] };
}

@Component({
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './my-apartment.component.html',
  styleUrl: './my-apartment.component.scss'
})
export class MyApartmentComponent {
  private auth = inject(AuthService);
  home: TenantHome | null = null;
  loading = true;
  error = '';
  name = '';
  subject = '';
  message = '';
  submitted = false;
  sent = false;

  get rentMonths(): string[] {
    if (!this.home?.room.occupiedFrom || !this.home.room.occupiedUntil || this.home.room.occupiedFrom > this.home.room.occupiedUntil) return [];
    const start = new Date(`${this.home.room.occupiedFrom.slice(0, 7)}-01T12:00:00`);
    const end = new Date(`${this.home.room.occupiedUntil.slice(0, 7)}-01T12:00:00`);
    const months: string[] = [];
    while (start <= end && months.length < 120) {
      months.push(`${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`);
      start.setMonth(start.getMonth() + 1);
    }
    return months;
  }

  monthLabel(month: string): string {
    return new Date(`${month}-01T12:00:00`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  }

  monthPaid(month: string): boolean { return this.home?.payments.paidMonths.includes(month) ?? false; }

  async ngOnInit(): Promise<void> {
    try { this.home = await this.auth.tenantRequest<TenantHome>('/api/tenant/me'); }
    catch (error) { this.error = error instanceof Error ? error.message : 'Could not load your apartment.'; }
    finally { this.loading = false; }
  }

  sendContact(): void {
    this.submitted = true;
    this.sent = Boolean(this.name.trim() && this.subject.trim() && this.message.trim());
  }
}
