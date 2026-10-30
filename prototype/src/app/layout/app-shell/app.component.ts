import { Component, inject } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faWhatsapp as faWhatsappIcon } from '@fortawesome/free-brands-svg-icons';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-root', standalone: true, imports: [RouterOutlet, RouterLink, RouterLinkActive, FontAwesomeModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  faWhatsapp = faWhatsappIcon;
  auth = inject(AuthService); private router = inject(Router);
  logout(): void { this.auth.logout(); void this.router.navigateByUrl('/'); }
}
