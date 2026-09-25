import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { routes } from '../../app.routes';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter(routes)]
    }).compileComponents();
  });

  it('creates the shared app shell', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    const logo = (fixture.nativeElement as HTMLElement).querySelector('.brand img');
    expect(logo).toBeTruthy();
    expect(logo?.getAttribute('src')).toContain('viverasmus%20logo.png');
  });
});
