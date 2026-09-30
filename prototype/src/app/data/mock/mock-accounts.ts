export interface Account {
  email: string;
  password: string;
  role: 'admin' | 'tenant';
}

/** Demo logins for the prototype — shown on the login page. The viverasmus office is the only admin. */
export const ACCOUNTS: Account[] = [
  { email:'admin@viverasmus.com', password:'admin2027', role:'admin' },
  { email:'student@viverasmus.com', password:'erasmus2027', role:'tenant' }
];
