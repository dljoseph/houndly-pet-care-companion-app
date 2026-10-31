import { AlertTriangle, CalendarClock, Syringe } from 'lucide-react';
import { useHealthRecords } from '@/hooks/useHealthRecords';
import { buildComingUp, type ComingUpItem } from '@/lib/health';

type ComingUpCardProps = {
  dogId: string;
  dogName: string;
  today: string;
};

export default function ComingUpCard({ dogId, dogName, today }: ComingUpCardProps) {
  const { state, reload } = useHealthRecords(dogId);

  return (
    <section aria-labelledby="coming-up-heading" className="flex flex-col gap-4">
      <div>
        <h2 id="coming-up-heading" className="text-lg font-bold text-brand-800">
          Coming up
        </h2>
        <p className="text-sm text-ink-muted">Vaccinations due and appointments in the next 30 days.</p>
      </div>

      {state.status === 'loading' && <p className="text-base text-ink-muted">Loading upcoming care...</p>}

      {state.status === 'error' && (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">
          <p>We couldn't load what's coming up for {dogName}. Check your connection and try again.</p>
          <button
            type="button"
            onClick={() => void reload()}
            className="tap-target rounded-full bg-rose-700 px-4 py-2 font-semibold text-cream-50 transition hover:bg-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            Try again
          </button>
        </div>
      )}

      {state.status === 'ready' && (
        <ComingUpList items={buildComingUp(state.vaccinations, state.appointments, today)} dogName={dogName} />
      )}
    </section>
  );
}

function ComingUpList({ items, dogName }: { items: ComingUpItem[]; dogName: string }) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-cream-300 bg-cream-50 p-6 text-center text-sm text-ink-muted">
        Nothing is due or booked for {dogName} in the next 30 days.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => {
        const Icon = item.kind === 'vaccination' ? Syringe : CalendarClock;
        return (
          <li
            key={item.key}
            className="flex items-center gap-4 rounded-2xl border border-cream-300 bg-white p-4 shadow-soft"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="flex flex-1 flex-col gap-1">
              <p className="font-semibold text-ink">{item.title}</p>
              <p className="text-sm text-ink-muted">{item.when}</p>
            </div>
            {item.overdue && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                Overdue
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
