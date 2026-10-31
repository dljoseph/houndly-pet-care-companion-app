import { supabase } from '@/lib/supabase';
import { TIME_SLOTS, type TimeSlot } from '@/types/checklist';

export type TodayTick = {
  key: string;
  itemId: string;
  title: string;
  detail: string;
  slot: TimeSlot;
  done: boolean;
  needsConfirmation: boolean;
  ambiguityQuestion: string | null;
};

type ChecklistItemRow = {
  id: string;
  title: string;
  category: string | null;
  amount: string | null;
  slots: string[];
  frequency: 'daily' | 'once';
  start_date: string;
  end_date: string | null;
  notes: string | null;
  needs_confirmation: boolean;
  ambiguity_question: string | null;
};

const ITEM_COLUMNS =
  'id, title, category, amount, slots, frequency, start_date, end_date, notes, needs_confirmation, ambiguity_question';

const UNIQUE_VIOLATION = '23505';

function isActiveOn(item: ChecklistItemRow, today: string): boolean {
  if (item.frequency === 'once') return item.start_date === today;
  return item.end_date === null || item.end_date >= today;
}

function detailFor(item: ChecklistItemRow): string {
  return [item.amount, item.category].filter((part): part is string => Boolean(part)).join(' · ');
}

export async function loadTodayTicks(dogId: string, today: string): Promise<TodayTick[]> {
  const { data: itemData, error: itemError } = await supabase
    .from('checklist_items')
    .select(ITEM_COLUMNS)
    .eq('dog_id', dogId)
    .lte('start_date', today)
    .order('created_at', { ascending: true });
  if (itemError) throw itemError;

  const items = (itemData as ChecklistItemRow[]).filter((item) => isActiveOn(item, today));
  if (items.length === 0) return [];

  const { data: completionData, error: completionError } = await supabase
    .from('checklist_completions')
    .select('item_id, slot')
    .eq('due_date', today)
    .in(
      'item_id',
      items.map((item) => item.id),
    );
  if (completionError) throw completionError;

  const doneKeys = new Set(
    (completionData as { item_id: string; slot: string }[]).map((row) => `${row.item_id}:${row.slot}`),
  );

  return items.flatMap((item) =>
    item.slots
      .filter((slot): slot is TimeSlot => TIME_SLOTS.includes(slot as TimeSlot))
      .map((slot) => ({
        key: `${item.id}:${slot}`,
        itemId: item.id,
        title: item.title,
        detail: detailFor(item),
        slot,
        done: doneKeys.has(`${item.id}:${slot}`),
        needsConfirmation: item.needs_confirmation,
        ambiguityQuestion: item.ambiguity_question,
      })),
  );
}

export async function setTickDone(tick: TodayTick, today: string, done: boolean): Promise<void> {
  if (done) {
    const { error } = await supabase
      .from('checklist_completions')
      .insert({ item_id: tick.itemId, due_date: today, slot: tick.slot });
    if (error && error.code !== UNIQUE_VIOLATION) throw error;
    return;
  }

  const { error } = await supabase
    .from('checklist_completions')
    .delete()
    .eq('item_id', tick.itemId)
    .eq('due_date', today)
    .eq('slot', tick.slot);
  if (error) throw error;
}
