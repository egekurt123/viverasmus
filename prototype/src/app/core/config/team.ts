/** The viverasmus office — the only admin and everyone's contact. */
export interface TeamMember {
  name: string;
  country: string;
  /** Optional portrait. Initials are shown until one is added. */
  photo?: string;
}

export const TEAM: TeamMember[] = [
  { name:'viverasmus office', country:'Spain' }
];

/** Placeholder office contact details — replace with the real ones. */
export const OFFICE = { name:'viverasmus office', email:'hola@viverasmus.com', phone:'+34 600 123 456', response:'Usually replies within a day' };
