import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js';
import { todayIsoDate } from '@/lib/dates';
import { supabase } from '@/lib/supabase';
import { TIME_SLOTS, type ChecklistDraft, type DraftItem, type TimeSlot } from '@/types/checklist';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const GENERIC_ERROR = 'Something went wrong. Please try again.';
const NETWORK_ERROR = "We couldn't reach Houndly. Check your connection and try again.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function nullableText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function parseDraftResponse(data: unknown): ChecklistDraft {
  if (!isRecord(data) || !Array.isArray(data.items) || !Array.isArray(data.not_converted)) {
    throw new Error(GENERIC_ERROR);
  }

  const items: DraftItem[] = data.items.filter(isRecord).map((item) => ({
    id: crypto.randomUUID(),
    title: text(item.title),
    category: text(item.category),
    amount: text(item.amount),
    slots: Array.isArray(item.slots)
      ? item.slots.filter((slot): slot is TimeSlot => TIME_SLOTS.includes(slot as TimeSlot))
      : [],
    frequency: item.frequency === 'once' ? 'once' : 'daily',
    startDate: text(item.start_date),
    endDate: text(item.end_date),
    notes: text(item.notes),
    sourceQuote: text(item.source_quote),
    needsConfirmation: item.needs_confirmation === true,
    ambiguityQuestion: nullableText(item.ambiguity_question),
  }));

  const notConverted = data.not_converted
    .filter(isRecord)
    .map((line) => ({ text: text(line.text), reason: text(line.reason) }))
    .filter((line) => line.text && line.reason);

  return { items, notConverted: notConverted.length ? notConverted : [] };
}

async function describeFunctionError(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body: unknown = await error.context.json();
      if (isRecord(body) && typeof body.error === 'string') return body.error;
    } catch {
      return GENERIC_ERROR;
    }
    return GENERIC_ERROR;
  }
  if (error instanceof FunctionsFetchError || error instanceof FunctionsRelayError) return NETWORK_ERROR;
  return GENERIC_ERROR;
}

export async function generateChecklistDraft(instructions: string, timeZone: string): Promise<ChecklistDraft> {
  const { data, error } = await supabase.functions.invoke('generate-checklist', {
    body: {
      text: instructions,
      today_date: todayIsoDate(timeZone),
      time_zone: timeZone,
    },
  });
  if (error) throw new Error(await describeFunctionError(error));
  return parseDraftResponse(data);
}

export function validateDraftItems(items: DraftItem[]): string | null {
  for (const item of items) {
    if (!item.title.trim()) return 'Every task needs a title.';
    if (item.needsConfirmation) return `Please check "${item.title}" and mark it as checked before saving.`;
    if (item.slots.length === 0) return `Choose a time of day for "${item.title}".`;
    if (!DATE_PATTERN.test(item.startDate)) return `Choose a start date for "${item.title}".`;
    if (item.endDate && (!DATE_PATTERN.test(item.endDate) || item.endDate < item.startDate)) {
      return `The end date for "${item.title}" must be on or after its start date.`;
    }
  }
  return null;
}

function blankToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function saveChecklist(dogId: string, sourceText: string, items: DraftItem[]): Promise<void> {
  const { data: instruction, error: instructionError } = await supabase
    .from('care_instructions')
    .insert({ dog_id: dogId, source_text: sourceText })
    .select('id')
    .single();
  if (instructionError) throw instructionError;

  const rows = items.map((item) => ({
    dog_id: dogId,
    care_instruction_id: instruction.id,
    title: item.title.trim(),
    category: blankToNull(item.category),
    amount: blankToNull(item.amount),
    slots: item.slots,
    frequency: item.frequency,
    start_date: item.startDate,
    end_date: item.endDate || null,
    notes: blankToNull(item.notes),
    source_quote: blankToNull(item.sourceQuote),
    needs_confirmation: item.needsConfirmation,
    ambiguity_question: item.needsConfirmation ? item.ambiguityQuestion : null,
  }));

  const { error: itemsError } = await supabase.from('checklist_items').insert(rows);
  if (itemsError) throw itemsError;
}
