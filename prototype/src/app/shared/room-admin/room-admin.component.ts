import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../core/services/property.service';
import { Room, TenantGender } from '../../core/models/property.model';
import { COUNTRIES } from '../../core/config/countries';
import { ADMIN_DATE_YEARS, AVAILABLE_DATE_OPTIONS, OCCUPIED_UNTIL_OPTIONS, adminDateValue } from '../../core/config/admin-dates';

/** Admin-only controls to mark a room as booked and record who booked it. */
@Component({
  selector: 'app-room-admin', standalone: true, imports: [FormsModule],
  templateUrl: './room-admin.component.html',
  styleUrl: './room-admin.component.scss'
})
export class RoomAdminComponent {
  @Input({ required: true }) room!: Room;
  private service = inject(PropertyService);
  countries = COUNTRIES;
  availableDateOptions = AVAILABLE_DATE_OPTIONS;
  occupiedUntilOptions = OCCUPIED_UNTIL_OPTIONS;
  dateYears = ADMIN_DATE_YEARS;
  availableFrom = '';
  occupiedFrom = '';
  occupiedUntil = '';
  availableMonthDay = '';
  availableYear = this.dateYears[0];
  occupiedFromMonthDay = '';
  occupiedFromYear = this.dateYears[0];
  occupiedUntilMonthDay = '';
  occupiedUntilYear = this.dateYears[0];
  availabilityError = '';
  occupancyError = '';
  tenantEmail = '';
  tenantPassword = '';
  tenantSaveError = '';
  tenantSaved = false;
  tenantSaving = false;
  reservationPaid = false;
  depositPaid = false;
  paidMonths: string[] = [];

  async ngOnInit(): Promise<void> {
    this.availableFrom = this.room.availableFrom;
    [this.availableYear, this.availableMonthDay] = this.splitDate(this.availableFrom, AVAILABLE_DATE_OPTIONS[0].value);
    this.occupiedFrom = this.room.occupiedFrom ?? '';
    this.occupiedUntil = this.room.occupiedUntil ?? '';
    [this.occupiedFromYear, this.occupiedFromMonthDay] = this.splitDate(this.occupiedFrom, AVAILABLE_DATE_OPTIONS[0].value);
    [this.occupiedUntilYear, this.occupiedUntilMonthDay] = this.splitDate(this.occupiedUntil, OCCUPIED_UNTIL_OPTIONS[0].value);
    await this.service.reloadTenantAccounts();
    const account = this.service.getTenantAccount(this.room.id);
    if (account) {
      this.tenantEmail = account.email;
      this.reservationPaid = account.reservationPaid;
      this.depositPaid = account.depositPaid;
      this.paidMonths = account.paidMonths ?? [];
    }
  }

  setStatus(status: Room['status']): void { this.service.updateRoom(this.room.id, status); }
  setGender(gender: TenantGender): void { this.service.updateRoom(this.room.id, 'booked', { ...this.room.tenant!, gender }); }
  setCountry(country: string): void { this.service.updateRoom(this.room.id, 'booked', { ...this.room.tenant!, country }); }
  hasTenantAccount(): boolean { return Boolean(this.service.getTenantAccount(this.room.id)); }

  async saveTenant(): Promise<void> {
    this.tenantSaving = true;
    this.tenantSaveError = '';
    this.tenantSaved = false;
    try {
      await this.service.saveTenantAccount(this.room.id, {
        email: this.tenantEmail, password: this.tenantPassword,
        reservationPaid: this.reservationPaid, depositPaid: this.depositPaid, paidMonths: this.paidMonths
      });
      this.tenantPassword = '';
      this.tenantSaved = true;
    } catch (error) {
      this.tenantSaveError = error instanceof Error ? error.message : 'Could not save tenant details.';
    } finally { this.tenantSaving = false; }
  }
  saveAvailability(): void {
    this.availableFrom = adminDateValue(this.availableMonthDay, this.availableYear);
    if (!this.service.updateRoomAvailability(this.room.id, this.availableFrom)) {
      this.availabilityError = 'Enter an availability date.';
      return;
    }
    this.availabilityError = '';
  }

  saveOccupancy(): void {
    this.occupiedFrom = adminDateValue(this.occupiedFromMonthDay, this.occupiedFromYear);
    this.occupiedUntil = adminDateValue(this.occupiedUntilMonthDay, this.occupiedUntilYear);
    if (!this.service.updateRoomOccupancy(this.room.id, this.occupiedFrom, this.occupiedUntil)) {
      this.occupancyError = 'Enter a valid start and end date.';
      return;
    }
    this.occupancyError = '';
  }

  get paymentMonths(): string[] {
    if (!this.occupiedFrom || !this.occupiedUntil || this.occupiedFrom > this.occupiedUntil) return [];
    const start = new Date(`${this.occupiedFrom.slice(0, 7)}-01T12:00:00`);
    const end = new Date(`${this.occupiedUntil.slice(0, 7)}-01T12:00:00`);
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

  setMonthPaid(month: string, paid: boolean): void {
    this.paidMonths = paid
      ? [...new Set([...this.paidMonths, month])]
      : this.paidMonths.filter(item => item !== month);
  }

  private splitDate(value: string, fallback: string): [number, string] {
    const [year, month, day] = value.split('-').map(Number);
    return [year || this.dateYears[0], month && day ? `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` : fallback];
  }
}
