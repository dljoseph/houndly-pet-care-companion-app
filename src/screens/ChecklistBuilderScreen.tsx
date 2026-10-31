import { useState } from 'react';
import { Info, ListChecks, Plus } from 'lucide-react';
import DraftItemCard from '@/components/checklist/DraftItemCard';
import InstructionsCard from '@/components/checklist/InstructionsCard';
import { generateChecklistDraft, saveChecklist, validateDraftItems } from '@/lib/checklist';
import { DEVICE_TIME_ZONE, todayIsoDate } from '@/lib/dates';
import type { Dog } from '@/types/dog';
import type { ChecklistDraft, DraftItem } from '@/types/checklist';

type ChecklistBuilderScreenProps = {
  dog: Dog;
};

function blankItem(startDate: string): DraftItem {
  return {
    id: crypto.randomUUID(),
    title: '',
    category: '',
    amount: '',
    slots: [],
    frequency: 'daily',
    startDate,
    endDate: '',
    notes: '',
    sourceQuote: '',
    needsConfirmation: false,
    ambiguityQuestion: null,
  };
}

export default function ChecklistBuilderScreen({ dog }: ChecklistBuilderScreenProps) {
  const [instructions, setInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [draft, setDraft] = useState<ChecklistDraft | null>(null);
  const [draftSourceText, setDraftSourceText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  const handleGenerate = async () => {
    const sourceText = instructions;
    setIsGenerating(true);
    setGenerateError(null);
    setSavedCount(null);
    try {
      const result = await generateChecklistDraft(sourceText, DEVICE_TIME_ZONE);
      setDraft(result);
      setDraftSourceText(sourceText);
      setSaveError(null);
    } catch (error) {
      setGenerateError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const updateItem = (id: string, patch: Partial<DraftItem>) => {
    setDraft((current) =>
      current && {
        ...current,
        items: current.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      },
    );
  };

  const removeItem = (id: string) => {
    setDraft((current) => current && { ...current, items: current.items.filter((item) => item.id !== id) });
  };

  const addItem = () => {
    setDraft((current) => current && { ...current, items: [...current.items, blankItem(todayIsoDate())] });
  };

  const handleSave = async () => {
    if (!draft) return;
    if (draft.items.length === 0) {
      setSaveError('Add at least one task before saving.');
      return;
    }
    const validationError = validateDraftItems(draft.items);
    if (validationError) {
      setSaveError(validationError);
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      await saveChecklist(dog.id, draftSourceText, draft.items);
      setSavedCount(draft.items.length);
      setDraft(null);
      setDraftSourceText('');
      setInstructions('');
    } catch {
      setSaveError("We couldn't save the checklist. Check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-3xl font-bold text-brand-800">Checklist builder</h1>
        <p className="mt-1 text-base text-ink-muted">
          Paste {dog.name}'s care instructions and Houndly will turn them into a daily checklist.
        </p>
      </section>

      <div
        role="note"
        className="flex gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900"
      >
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" aria-hidden="true" />
        <p>
          Houndly is not a vet. It only organises the instructions you paste in. If you're unsure, check with your
          vet.
        </p>
      </div>

      {savedCount !== null && (
        <p role="status" className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-900">
          Saved {savedCount} {savedCount === 1 ? 'task' : 'tasks'} for {dog.name}.
        </p>
      )}

      <InstructionsCard
        value={instructions}
        isGenerating={isGenerating}
        errorMessage={generateError}
        onChange={setInstructions}
        onGenerate={handleGenerate}
      />

      {draft ? (
        <section aria-labelledby="draft-heading" className="flex flex-col gap-5">
          <div>
            <h2 id="draft-heading" className="text-lg font-bold text-brand-800">
              Review your tasks
            </h2>
            <p className="text-sm text-ink-muted">
              {draft.items.length} {draft.items.length === 1 ? 'task' : 'tasks'} ready. Edit anything before saving.
            </p>
          </div>

          {draft.items.map((item, index) => (
            <DraftItemCard
              key={item.id}
              index={index}
              item={item}
              onChange={(patch) => updateItem(item.id, patch)}
              onRemove={() => removeItem(item.id)}
            />
          ))}

          <button
            type="button"
            onClick={addItem}
            className="tap-target flex items-center justify-center gap-2 rounded-2xl border border-dashed border-brand-500 bg-cream-50 px-4 py-3 text-sm font-semibold text-brand-800 transition hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add a task
          </button>

          {saveError && (
            <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {saveError}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="tap-target rounded-full bg-brand-700 px-6 py-3 text-base font-semibold text-cream-50 shadow-soft transition hover:bg-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-cream-300 disabled:text-ink-muted disabled:shadow-none"
            >
              {isSaving ? 'Saving...' : 'Save checklist'}
            </button>
          </div>
        </section>
      ) : (
        <section aria-labelledby="draft-heading" className="flex flex-col gap-3">
          <h2 id="draft-heading" className="text-lg font-bold text-brand-800">
            Draft tasks
          </h2>
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-cream-300 bg-cream-50 px-6 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <ListChecks className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="text-base text-ink-muted">Your draft tasks will appear here so you can review them before saving.</p>
          </div>
        </section>
      )}

      {draft && (
        <section aria-labelledby="not-converted-heading" className="flex flex-col gap-3">
          <h2 id="not-converted-heading" className="text-lg font-bold text-brand-800">
            Not turned into tasks
          </h2>
          {draft.notConverted.length === 0 ? (
            <p className="text-sm text-ink-muted">Every line you pasted became a task.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {draft.notConverted.map((line, index) => (
                <li key={index} className="rounded-2xl border border-cream-300 bg-white px-4 py-3 text-sm">
                  <p className="text-ink">{line.text}</p>
                  <p className="mt-1 text-ink-muted">{line.reason}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
