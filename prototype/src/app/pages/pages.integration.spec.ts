import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
import { routes } from '../app.routes';
import { HomeComponent } from './home/home.component';
import { PropertiesComponent } from './properties/properties.component';
import { PropertyDetailComponent } from './property-detail/property-detail.component';
import { AuthComponent } from './auth/auth.component';
import { AboutComponent } from './about/about.component';

describe('rental platform routes and interactions', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers:[provideRouter(routes)] }));

  it('renders the home search and featured rental cards', async () => {
    const harness = await RouterTestingHarness.create();
    const home = await harness.navigateByUrl('/', HomeComponent);
    harness.detectChanges();
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('Make room for');
    expect(harness.routeNativeElement?.querySelectorAll('app-property-card').length).toBe(4);
    expect(harness.routeNativeElement?.querySelector('form.search-box')).toBeTruthy();
    expect(home).toBeTruthy();
  });

  it('applies location, rent and type query filters and sorts the results', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/properties?neighborhood=Nervi%C3%B3n&maxRent=600&propertyType=Private%20room', PropertiesComponent);
    expect(page.results.length).toBeGreaterThan(1);
    expect(page.results.every(property => property.neighborhood === 'Nervión' && property.propertyType === 'Private room')).toBeTrue();
    expect(page.results.every(property => page.roomsFor(property)!.every(room => room.monthlyRent <= 600))).toBeTrue();
    page.sortBy = 'low';
    expect(page.rents[page.results[0].id]).toBeLessThanOrEqual(page.rents[page.results[1].id]);
    harness.detectChanges();
    expect(harness.routeNativeElement?.querySelectorAll('app-property-card').length).toBe(page.results.length);
  });

  it('opens an individual listing detail with rental information', async () => {
    const harness = await RouterTestingHarness.create();
    const detail = await harness.navigateByUrl('/properties/paris', PropertyDetailComponent);
    harness.detectChanges();
    expect(detail.property?.monthlyRent).toBe(300);
    expect(harness.routeNativeElement?.textContent).toContain('Deposit');
    expect(harness.routeNativeElement?.textContent).toContain('Rooms in this flat');
    expect(harness.routeNativeElement?.querySelectorAll('.room-tile').length).toBe(5);
    expect(harness.routeNativeElement?.textContent).toContain('Denmark');
    const nextDetail = await harness.navigateByUrl('/properties/tores-studio', PropertyDetailComponent);
    expect(nextDetail.property?.monthlyRent).toBe(690);
  });

  it('opens a single room on its own page and returns to all rooms of the flat', async () => {
    const harness = await RouterTestingHarness.create();
    const roomPage = await harness.navigateByUrl('/properties/paris/rooms/paris-room-3', PropertyDetailComponent);
    harness.detectChanges();
    expect(roomPage.room?.name).toBe('Room 3');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('Paris · Room 3');
    expect(harness.routeNativeElement?.querySelectorAll('.room-tile').length).toBe(0);
    const flatPage = await harness.navigateByUrl('/properties/paris', PropertyDetailComponent);
    harness.detectChanges();
    expect(flatPage.room).toBeUndefined();
    expect(harness.routeNativeElement?.querySelectorAll('.room-tile').length).toBe(5);
  });

  it('serves a login page that directs students to the team for access', async () => {
    const harness = await RouterTestingHarness.create();
    const login = await harness.navigateByUrl('/login', AuthComponent);
    harness.detectChanges();
    expect(harness.routeNativeElement?.querySelector('form')).toBeTruthy();
    expect(harness.routeNativeElement?.textContent).toContain('Need login details?');
    expect(harness.routeNativeElement?.querySelector('a[routerLink="/contact"]')).toBeTruthy();
    login.email = 'alex@example.com';
    login.password = 'seville2026';
    login.submit();
    expect(login.errorMessage).toContain('Contact the viverasmus team');
  });

  it('shows the about page and the team focus areas', async () => {
    const harness = await RouterTestingHarness.create();
    const about = await harness.navigateByUrl('/about', AboutComponent);
    harness.detectChanges();
    expect(about).toBeTruthy();
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('New city.');
    expect(harness.routeNativeElement?.textContent).toContain('Student experience');
    expect(harness.routeNativeElement?.textContent).toContain('Sevilla context');
    expect(harness.routeNativeElement?.textContent).toContain('People-first support');
  });
});
