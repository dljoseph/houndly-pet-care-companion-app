export const TIME_SLOTS = ['Morning', 'Afternoon', 'Evening'] as const;

export type TimeSlot = (typeof TIME_SLOTS)[number];

export type DraftItem = {
  id: string;
  title: string;
  category: string;
  amount: string;
  slots: TimeSlot[];
  frequency: 'daily' | 'once';
  startDate: string;
  endDate: string;
  notes: string;
  sourceQuote: string;
  needsConfirmation: boolean;
  ambiguityQuestion: string | null;
};

export type NotConvertedLine = {
  text: string;
  reason: string;
};

export type ChecklistDraft = {
  items: DraftItem[];
  notConverted: NotConvertedLine[];
};
