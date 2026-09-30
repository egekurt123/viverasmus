import { Property } from '../models/property.model';

/** Search option: how many people you would share the flat with. */
export interface FlatmateOption { value: string; label: string; min: number; max: number; }

export const FLATMATE_OPTIONS: FlatmateOption[] = [
  { value:'none', label:'Live alone (studio)', min:0, max:0 },
  { value:'few', label:'3–4 flatmates', min:3, max:4 },
  { value:'some', label:'5–10 flatmates', min:5, max:10 },
  { value:'many', label:'More than 10 flatmates', min:11, max:Infinity }
];

/** Everyone else living in the flat: rooms minus your own, or 0 for a studio. */
export const flatmateCount = (property: Property): number => property.rooms ? property.rooms.length - 1 : 0;
