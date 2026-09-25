import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

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
  successMessage = '';

  validEmail(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
  }

  submit(): void {
    this.submitted = true;
    this.successMessage = '';
    if (!this.validEmail() || this.password.length < 8) return;
    this.successMessage = 'Credential checks are not enabled in this prototype. Contact the viverasmus team for access help.';
  }
}
