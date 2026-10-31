import { AlertTriangle, Trash2 } from 'lucide-react';
import { TIME_SLOTS, type DraftItem, type TimeSlot } from '@/types/checklist';

type DraftItemCardProps = {
  index: number;
  item: DraftItem;
  onChange: (patch: Partial<DraftItem>) => void;
  onRemove: () => void;
};

const FIELD_CLASS =
  'tap-target w-full rounded-xl border border-cream-300 bg-cream-50 px-3 py-2.5 text-base text-ink placeholder:text-ink-muted focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200';

const LABEL_CLASS = 'text-sm font-semibold text-ink';

export default function DraftItemCard({ index, item, onChange, onRemove }: DraftItemCardProps) {
  const toggleSlot = (slot: TimeSlot) => {
    const slots = item.slots.includes(slot)
      ? item.slots.filter((current) => current !== slot)
      : TIME_SLOTS.filter((current) => current === slot || item.slots.includes(current));
    onChange({ slots });
  };

  const fieldId = (name: string) => `draft-${item.id}-${name}`;

  return (
    <article
      aria-label={`Task ${index + 1}`}
      className="flex flex-col gap-5 rounded-3xl border border-cream-300 bg-white p-5 shadow-soft sm:p-6"
    >
      {item.needsConfirmation && (
        <div role="note" className="flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <p className="font-semibold">Needs your check</p>
            {item.ambiguityQuestion && <p>{item.ambiguityQuestion}</p>}
            <button
              type="button"
              onClick={() => onChange({ needsConfirmation: false, ambiguityQuestion: null })}
              className="tap-target mt-2 self-start rounded-full bg-amber-700 px-4 py-2 text-sm font-semibold text-cream-50 transition hover:bg-amber-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
            >
              I've checked this
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor={fieldId('title')} className={LABEL_CLASS}>
            Task
          </label>
          <input
            id={fieldId('title')}
            type="text"
            maxLength={120}
            value={item.title}
            onChange={(event) => onChange({ title: event.target.value })}
            placeholder="e.g. Give tablet with breakfast"
            className={FIELD_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={fieldId('category')} className={LABEL_CLASS}>
            Category
          </label>
          <input
            id={fieldId('category')}
            type="text"
            maxLength={60}
            value={item.category}
            onChange={(event) => onChange({ category: event.target.value })}
            placeholder="e.g. Medicine"
            className={FIELD_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={fieldId('amount')} className={LABEL_CLASS}>
            Amount
          </label>
          <input
            id={fieldId('amount')}
            type="text"
            maxLength={60}
            value={item.amount}
            onChange={(event) => onChange({ amount: event.target.value })}
            placeholder="e.g. 1 tablet"
            className={FIELD_CLASS}
          />
        </div>

        <fieldset className="flex flex-col gap-1.5 sm:col-span-2">
          <legend className={LABEL_CLASS}>Time of day</legend>
          <div className="flex flex-wrap gap-2">
            {TIME_SLOTS.map((slot) => {
              const selected = item.slots.includes(slot);
              return (
                <button
                  key={slot}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleSlot(slot)}
                  className={`tap-target rounded-full border px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                    selected
                      ? 'border-brand-700 bg-brand-700 text-cream-50'
                      : 'border-cream-300 bg-cream-50 text-ink hover:border-brand-500'
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={fieldId('frequency')} className={LABEL_CLASS}>
            How often
          </label>
          <select
            id={fieldId('frequency')}
            value={item.frequency}
            onChange={(event) => onChange({ frequency: event.target.value === 'once' ? 'once' : 'daily' })}
            className={FIELD_CLASS}
          >
            <option value="daily">Every day</option>
            <option value="once">Once</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={fieldId('start')} className={LABEL_CLASS}>
            Start date
          </label>
          <input
            id={fieldId('start')}
            type="date"
            value={item.startDate}
            onChange={(event) => onChange({ startDate: event.target.value })}
            className={FIELD_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={fieldId('end')} className={LABEL_CLASS}>
            End date <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <input
            id={fieldId('end')}
            type="date"
            value={item.endDate}
            onChange={(event) => onChange({ endDate: event.target.value })}
            className={FIELD_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor={fieldId('notes')} className={LABEL_CLASS}>
            Notes <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <textarea
            id={fieldId('notes')}
            rows={2}
            maxLength={500}
            value={item.notes}
            onChange={(event) => onChange({ notes: event.target.value })}
            className={FIELD_CLASS}
          />
        </div>
      </div>

      {item.sourceQuote && (
        <p className="rounded-xl bg-cream-100 px-4 py-3 text-sm text-ink-muted">
          From your text: <q className="text-ink">{item.sourceQuote}</q>
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onRemove}
          className="tap-target flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Remove task
        </button>
      </div>
    </article>
  );
}
