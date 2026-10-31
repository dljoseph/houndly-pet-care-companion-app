export type PlaceholderTask = {
  id: string;
  title: string;
  detail: string;
  slot: 'Morning' | 'Afternoon' | 'Evening';
  done: boolean;
};

export const PLACEHOLDER_TASKS: PlaceholderTask[] = [
  { id: 't1', title: 'Breakfast', detail: '1 cup dry food', slot: 'Morning', done: true },
  { id: 't2', title: 'Morning walk', detail: '20 minutes', slot: 'Morning', done: true },
  { id: 't3', title: 'Lunchtime toilet break', detail: 'Garden', slot: 'Afternoon', done: true },
  { id: 't4', title: 'Afternoon walk', detail: '30 minutes', slot: 'Afternoon', done: false },
  { id: 't5', title: 'Supper', detail: '1 cup dry food', slot: 'Evening', done: false },
  { id: 't6', title: 'Evening brush', detail: 'Coat check', slot: 'Evening', done: false },
];
