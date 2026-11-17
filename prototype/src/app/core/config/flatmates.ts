import { Property } from '../models/property.model';

/** Search option: how many people you would share the flat with. */
export interface FlatmateOption { value: string; label: string; min: number; max: number; }

export const FLATMATE_OPTIONS: FlatmateOption[] = [
  { value:'3-5', label:'3–5', min:3, max:5 },
  { value:'6-10', label:'6–10', min:6, max:10 },
  { value:'11-15', label:'11–15', min:11, max:15 },
  { value:'16-20', label:'16–20', min:16, max:20 }
];

/** Everyone else living in the flat: rooms minus your own, or 0 for a studio. */
export const flatmateCount = (property: Property): number => property.rooms ? property.rooms.length - 1 : 0;
