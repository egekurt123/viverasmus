import { Injectable } from '@angular/core';
import { FaqDraft, FaqItem } from '../models/faq.model';
import { AuthService } from './auth.service';

const API = '/api';

@Injectable({ providedIn: 'root' })
export class FaqService {
  constructor(private readonly auth: AuthService) {}

  getPublished(): Promise<FaqItem[]> { return this.request<FaqItem[]>(`${API}/faqs`); }
  getAll(): Promise<FaqItem[]> { return this.request<FaqItem[]>(`${API}/admin/faqs`, { headers: this.adminHeaders() }); }
  create(draft: FaqDraft): Promise<FaqItem> {
    return this.request<FaqItem>(`${API}/admin/faqs`, { method: 'POST', body: JSON.stringify(draft), headers: this.adminHeaders() });
  }
  update(id: string, draft: FaqDraft): Promise<void> {
    return this.request<void>(`${API}/admin/faqs/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(draft), headers: this.adminHeaders() });
  }
  delete(id: string): Promise<void> {
    return this.request<void>(`${API}/admin/faqs/${encodeURIComponent(id)}`, { method: 'DELETE', headers: this.adminHeaders() });
  }
  reorder(ids: string[]): Promise<void> {
    return this.request<void>(`${API}/admin/faqs/order`, { method: 'PUT', body: JSON.stringify({ ids }), headers: this.adminHeaders() });
  }

  private adminHeaders(): HeadersInit { return { Authorization: this.auth.adminAuthorization() }; }

  private async request<T>(url: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
      ...init,
      headers: { ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...init.headers }
    });
    if (!response.ok) {
      let detail = '';
      try {
        const body = await response.json() as { detail?: string; message?: string };
        detail = body.detail ?? body.message ?? '';
      } catch { /* status is enough when the API has no JSON error body */ }
      throw new Error(detail || 'Could not save the FAQ changes. Please try again.');
    }
    if (response.status === 204) return undefined as T;
    return await response.json() as T;
  }
}
