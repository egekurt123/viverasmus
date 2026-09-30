import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  email = '';
  password = '';
  submitted = false;
  errorMessage = '';
  private auth = inject(AuthService); private router = inject(Router);

  validEmail(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
  }

  submit(): void {
    this.submitted = true;
    this.errorMessage = '';
    if (!this.validEmail() || this.password.length < 8) return;
    const account = this.auth.login(this.email, this.password);
    if (!account) { this.errorMessage = 'These details don’t match an account. Contact the viverasmus team for access help.'; return; }
    void this.router.navigateByUrl(account.role === 'admin' ? '/admin' : '/');
  }
}
