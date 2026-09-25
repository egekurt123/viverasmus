import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true, imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  name = '';
  email = '';
  subject = '';
  message = 'Hi Viverasmus team';
  submitted = false;
  sent = false;

  submit(): void {
    this.submitted = true;
    this.sent = Boolean(this.name.trim() && this.email.includes('@') && this.subject.trim() && this.message.trim());
  }
}