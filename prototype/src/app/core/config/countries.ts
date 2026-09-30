/** Home countries students can be tagged with, shown next to a booked room. */
export interface Country { name: string; flag: string; }

export const COUNTRIES: Country[] = [
  { name:'Austria', flag:'🇦🇹' }, { name:'Belgium', flag:'🇧🇪' }, { name:'Czechia', flag:'🇨🇿' }, { name:'Denmark', flag:'🇩🇰' },
  { name:'Finland', flag:'🇫🇮' }, { name:'France', flag:'🇫🇷' }, { name:'Germany', flag:'🇩🇪' }, { name:'Greece', flag:'🇬🇷' },
  { name:'Hungary', flag:'🇭🇺' }, { name:'Ireland', flag:'🇮🇪' }, { name:'Italy', flag:'🇮🇹' }, { name:'Netherlands', flag:'🇳🇱' },
  { name:'Norway', flag:'🇳🇴' }, { name:'Poland', flag:'🇵🇱' }, { name:'Portugal', flag:'🇵🇹' }, { name:'Spain', flag:'🇪🇸' },
  { name:'Sweden', flag:'🇸🇪' }, { name:'Switzerland', flag:'🇨🇭' }, { name:'United Kingdom', flag:'🇬🇧' }, { name:'United States', flag:'🇺🇸' }
];

export const flagFor = (country: string): string => COUNTRIES.find(item => item.name === country)?.flag ?? '🌍';
