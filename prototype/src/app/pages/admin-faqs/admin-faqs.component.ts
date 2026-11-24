import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FaqItem } from '../../core/models/faq.model';
import { FaqService } from '../../core/services/faq.service';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-faqs.component.html',
  styleUrl: './admin-faqs.component.scss'
})
export class AdminFaqsComponent {
  private readonly service = inject(FaqService);
  faqs: FaqItem[] = [];
  question = '';
  answer = '';
  published = true;
  editingId: string | null = null;
  loading = true;
  saving = false;
  error = '';
  notice = '';

  constructor() { void this.load(); }

  async load(): Promise<void> {
    this.loading = true;
    try { this.faqs = await this.service.getAll(); this.error = ''; }
    catch (error) { this.error = this.message(error); }
    finally { this.loading = false; }
  }

  edit(item: FaqItem): void {
    this.editingId = item.id;
    this.question = item.question;
    this.answer = item.answer;
    this.published = item.published;
    this.notice = '';
  }

  reset(): void {
    this.editingId = null;
    this.question = '';
    this.answer = '';
    this.published = true;
  }

  async save(): Promise<void> {
    if (this.saving || !this.question.trim() || !this.answer.trim()) return;
    this.saving = true;
    this.error = '';
    try {
      const draft = { question: this.question.trim(), answer: this.answer.trim(), published: this.published };
      if (this.editingId) await this.service.update(this.editingId, draft);
      else await this.service.create(draft);
      this.notice = this.editingId ? 'FAQ updated.' : 'FAQ added.';
      this.reset();
      await this.load();
    } catch (error) { this.error = this.message(error); }
    finally { this.saving = false; }
  }

  async togglePublished(item: FaqItem): Promise<void> {
    try {
      await this.service.update(item.id, { question: item.question, answer: item.answer, published: !item.published });
      await this.load();
      this.notice = item.published ? 'FAQ unpublished.' : 'FAQ published.';
    } catch (error) { this.error = this.message(error); }
  }

  async remove(item: FaqItem): Promise<void> {
    if (!confirm(`Delete “${item.question}”? This can’t be undone.`)) return;
    try {
      await this.service.delete(item.id);
      if (this.editingId === item.id) this.reset();
      await this.load();
      this.notice = 'FAQ deleted.';
    } catch (error) { this.error = this.message(error); }
  }

  async move(index: number, offset: -1 | 1): Promise<void> {
    const target = index + offset;
    if (target < 0 || target >= this.faqs.length) return;
    const reordered = [...this.faqs];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    this.faqs = reordered;
    try { await this.service.reorder(reordered.map(item => item.id)); }
    catch (error) { this.error = this.message(error); await this.load(); }
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'Could not load the FAQs. Please try again.';
  }
}
