import { Injectable, computed, signal } from '@angular/core';
import { ACCOUNTS, Account } from '../../data/mock/mock-accounts';

const SESSION_KEY = 'viverasmus.session';

/** Prototype login against team-issued demo accounts. Not a real security boundary. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly current = signal<Account | null>(this.restore());
  readonly account = this.current.asReadonly();
  readonly isAdmin = computed(() => this.current()?.role === 'admin');

  login(email: string, password: string): Account | null {
    const account = ACCOUNTS.find(item => item.email === email.trim().toLowerCase() && item.password === password) ?? null;
    this.current.set(account);
    try { account ? sessionStorage.setItem(SESSION_KEY, account.email) : sessionStorage.removeItem(SESSION_KEY); } catch { /* session only in memory */ }
    return account;
  }

  logout(): void {
    this.current.set(null);
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* nothing stored */ }
  }

  private restore(): Account | null {
    try { return ACCOUNTS.find(item => item.email === sessionStorage.getItem(SESSION_KEY)) ?? null; } catch { return null; }
  }
}
