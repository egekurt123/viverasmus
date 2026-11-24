import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaqItem } from '../../core/models/faq.model';
import { FaqService } from '../../core/services/faq.service';

@Component({
  standalone: true,
  imports: [RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  private readonly faqsService = inject(FaqService);
  faqs: FaqItem[] = [];
  faqsLoading = true;
  faqsError = false;

  constructor() {
    void this.faqsService.getPublished().then(items => this.faqs = items).catch(() => {
      this.faqs = [];
      this.faqsError = true;
    }).finally(() => this.faqsLoading = false);
  }
}
