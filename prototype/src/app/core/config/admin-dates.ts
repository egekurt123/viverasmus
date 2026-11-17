export interface AdminDateOption {
  value: string;
  label: string;
}

export const AVAILABLE_DATE_OPTIONS: AdminDateOption[] = [
  { value:'09-01', label:'1 September' },
  { value:'02-01', label:'1 February' },
  { value:'02-14', label:'14 February' },
  { value:'03-01', label:'1 March' },
  { value:'07-01', label:'1 July' },
  { value:'08-01', label:'1 August' }
];

export const OCCUPIED_UNTIL_OPTIONS: AdminDateOption[] = [
  { value:'01-31', label:'31 January' },
  { value:'02-14', label:'14 February' },
  { value:'02-28', label:'28 February' },
  { value:'06-30', label:'30 June' },
  { value:'07-15', label:'15 July' },
  { value:'07-31', label:'31 July' },
  { value:'08-31', label:'31 August' }
];

export const ADMIN_DATE_YEARS = Array.from(
  { length:11 },
  (_, index) => new Date().getFullYear() + index
);

export const adminDateValue = (monthDay: string, year: number): string =>
  `${year}-${monthDay}`;
