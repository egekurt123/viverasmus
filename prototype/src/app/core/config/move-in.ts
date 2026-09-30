/** Move-in rules: semesters start on 1 September or 1 February; July and August can be rented individually. */
export const SEMESTER_MIN_MONTHS = 5;

export interface MoveInOption { value: string; label: string; }

export const MOVE_IN_OPTIONS: MoveInOption[] = [
  { value: '2027-02-01', label: '1 February 2027 · min. 5 months' },
  { value: '2027-07-01', label: 'July 2027 only' },
  { value: '2027-08-01', label: 'August 2027 only' },
  { value: '2027-09-01', label: '1 September 2027 · min. 5 months' }
];
