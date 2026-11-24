export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  position: number;
  published: boolean;
}

export interface FaqDraft {
  question: string;
  answer: string;
  published: boolean;
}
