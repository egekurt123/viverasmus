import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SevillaMapComponent, UNIVERSITY_CAMPUSES } from './sevilla-map.component';

describe('SevillaMapComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SevillaMapComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('renders markers for all configured Sevilla university campuses', () => {
    const fixture = TestBed.createComponent(SevillaMapComponent);
    fixture.detectChanges();

    const campusPins = Array.from(
      fixture.nativeElement.querySelectorAll('.campus-pin') as NodeListOf<HTMLElement>
    );

    expect(campusPins.length).toBe(UNIVERSITY_CAMPUSES.length);
    const titles = campusPins.map(pin => pin.getAttribute('title'));
    for (const campus of UNIVERSITY_CAMPUSES) {
      expect(titles).toContain(campus.name);
    }

    fixture.destroy();
  });
});
