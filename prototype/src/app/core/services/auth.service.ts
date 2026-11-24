import { Injectable, computed, signal } from '@angular/core';

interface Account {
  email: string;
  role: 'admin' | 'tenant';
}

const SESSION_KEY = 'viverasmus.session';
const TENANT_TOKEN_KEY = 'viverasmus.tenant-token';
const ADMIN_TOKEN_KEY = 'viverasmus.admin-token';

/** Admin sessions are issued by the API; tenant sessions use the tenant login API. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly current = signal<Account | null>(this.restore());
  readonly account = this.current.asReadonly();
  readonly isAdmin = computed(() => this.current()?.role === 'admin');
  readonly isTenant = computed(() => this.current()?.role === 'tenant');
  private token = this.readToken();
  readonly restored = this.restoreTenant();

  async login(email: string, password: string): Promise<Account | null> {
    await this.restored;
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (response.ok) {
        const result = await response.json() as { token: string };
        this.token = '';
        const account: Account = { email: email.trim().toLowerCase(), role: 'admin' };
        this.current.set(account);
        try {
          sessionStorage.setItem(SESSION_KEY, account.email);
          sessionStorage.setItem(ADMIN_TOKEN_KEY, result.token);
          sessionStorage.removeItem(TENANT_TOKEN_KEY);
        } catch { /* session only in memory */ }
        return account;
      }
    } catch { /* tenant login may still be available if this is a tenant account */ }
    try {
      const response = await fetch('/api/tenant/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) { this.current.set(null); return null; }
      const result = await response.json() as { token: string };
      this.token = result.token;
      const account = { email: email.trim().toLowerCase(), role: 'tenant' as const };
      this.current.set(account);
      try { sessionStorage.setItem(TENANT_TOKEN_KEY, result.token); sessionStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(ADMIN_TOKEN_KEY); } catch { /* session only in memory */ }
      return account;
    } catch { this.current.set(null); return null; }
  }

  logout(): void {
    if (this.token) void fetch('/api/tenant/logout', { method: 'POST', headers: { Authorization: `Bearer ${this.token}` } });
    const adminToken = this.readAdminToken();
    if (adminToken) void fetch('/api/admin/logout', { method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } });
    this.token = '';
    this.current.set(null);
    try { sessionStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(TENANT_TOKEN_KEY); sessionStorage.removeItem(ADMIN_TOKEN_KEY); } catch { /* nothing stored */ }
  }

  adminAuthorization(): string { return `Bearer ${this.readAdminToken()}`; }

  async tenantRequest<T>(url: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(url, { ...init, headers: { ...init.headers, Authorization: `Bearer ${this.token}` } });
    if (!response.ok) throw new Error(response.status === 401 ? 'Your session expired. Please log in again.' : 'Could not load your apartment information.');
    return await response.json() as T;
  }

  private readToken(): string { try { return sessionStorage.getItem(TENANT_TOKEN_KEY) ?? ''; } catch { return ''; } }
  private async restoreTenant(): Promise<void> {
    if (this.current() || !this.token) return;
    try {
      const response = await fetch('/api/tenant/me', { headers: { Authorization: `Bearer ${this.token}` } });
      if (response.ok) {
        const home = await response.json() as { email: string };
        this.current.set({ email: home.email, role: 'tenant' });
      } else this.clearTenantSession();
    } catch { /* keep the token so a temporary API outage does not sign the tenant out */ }
  }

  private clearTenantSession(): void {
    this.token = '';
    try { sessionStorage.removeItem(TENANT_TOKEN_KEY); } catch { /* nothing stored */ }
  }

  private readAdminToken(): string { try { return sessionStorage.getItem(ADMIN_TOKEN_KEY) ?? ''; } catch { return ''; } }

  private restore(): Account | null {
    try {
      if (!sessionStorage.getItem(ADMIN_TOKEN_KEY)) return null;
      const email = sessionStorage.getItem(SESSION_KEY);
      return email ? { email, role: 'admin' } : null;
    } catch { return null; }
  }
}
