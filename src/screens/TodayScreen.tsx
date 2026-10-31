import { Check } from 'lucide-react';
import ComingUpCard from '@/components/today/ComingUpCard';
import { useTodayTicks } from '@/hooks/useTodayTicks';
import { DEVICE_TIME_ZONE, todayIsoDate } from '@/lib/dates';
import { TIME_SLOTS } from '@/types/checklist';
import type { Dog } from '@/types/dog';
import type { ScreenId } from '@/types/navigation';

type TodayScreenProps = {
  dog: Dog;
  onNavigate: (screen: ScreenId) => void;
};

export default function TodayScreen({ dog, onNavigate }: TodayScreenProps) {
  const today = todayIsoDate();
  const todayLabel = new Intl.DateTimeFormat('en-GB', {
    timeZone: DEVICE_TIME_ZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());
  const { state, actionError, reload, toggleTick } = useTodayTicks(dog.id, today);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <p className="text-sm font-semibold text-ink-muted">{todayLabel}</p>
        <h1 className="mt-1 text-3xl font-bold text-brand-800">Today for {dog.name}</h1>
      </section>

      {state.status === 'loading' && <p className="text-base text-ink-muted">Loading today's checklist...</p>}

      {state.status === 'error' && (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">
          <p>We couldn't load today's checklist. Check your connection and try again.</p>
          <button
            type="button"
            onClick={() => void reload()}
            className="tap-target rounded-full bg-rose-700 px-4 py-2 font-semibold text-cream-50 transition hover:bg-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            Try again
          </button>
        </div>
      )}

      {state.status === 'ready' && state.ticks.length === 0 && (
        <section className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-cream-300 bg-cream-50 px-6 py-10 text-center">
          <p className="text-base text-ink-muted">
            There's nothing on {dog.name}'s checklist for today yet.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('builder')}
            className="tap-target rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-cream-50 shadow-soft transition hover:bg-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Build a checklist
          </button>
        </section>
      )}

      {state.status === 'ready' && state.ticks.length > 0 && (
        <>
          <TodayProgress doneCount={state.ticks.filter((tick) => tick.done).length} totalCount={state.ticks.length} />

          {actionError && (
            <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {actionError}
            </p>
          )}

          {TIME_SLOTS.map((slot) => {
            const ticks = state.ticks.filter((tick) => tick.slot === slot);
            if (ticks.length === 0) return null;
            return (
              <section key={slot} aria-labelledby={`slot-${slot}`} className="flex flex-col gap-3">
                <h2 id={`slot-${slot}`} className="text-lg font-bold text-brand-800">
                  {slot}
                </h2>
                <ul className="flex flex-col gap-3">
                  {ticks.map((tick) => (
                    <li key={tick.key}>
                      <button
                        type="button"
                        onClick={() => void toggleTick(tick)}
                        aria-pressed={tick.done}
                        className={`tap-target flex w-full items-center gap-4 rounded-2xl border p-4 text-left shadow-soft transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                          tick.done ? 'border-brand-200 bg-brand-50' : 'border-cream-300 bg-white hover:border-brand-300'
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${
                            tick.done ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-muted bg-white'
                          }`}
                          aria-hidden="true"
                        >
                          {tick.done && <Check className="h-4 w-4" />}
                        </span>
                        <span className="flex-1">
                          <span
                            className={`block text-base font-semibold ${tick.done ? 'text-ink-muted line-through' : 'text-ink'}`}
                          >
                            {tick.title}
                          </span>
                          {tick.detail && <span className="block text-sm text-ink-muted">{tick.detail}</span>}
                          {tick.needsConfirmation && (
                            <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                              Needs checking
                            </span>
                          )}
                        </span>
                        <span className="sr-only">{tick.done ? 'Done' : 'Not done yet'}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </>
      )}

      <ComingUpCard dogId={dog.id} dogName={dog.name} today={today} />
    </div>
  );
}

function TodayProgress({ doneCount, totalCount }: { doneCount: number; totalCount: number }) {
  const progress = Math.round((doneCount / totalCount) * 100);
  return (
    <section aria-labelledby="progress-heading" className="rounded-3xl border border-cream-300 bg-white p-6 shadow-soft">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="progress-heading" className="text-sm font-semibold text-ink-muted">
            Daily progress
          </h2>
          <p className="mt-1 text-2xl font-bold text-ink">
            {doneCount} of {totalCount} done
          </p>
        </div>
        <span className="text-lg font-bold text-brand-700">{progress}%</span>
      </div>
      <div
        role="progressbar"
        aria-label="Daily progress"
        aria-valuemin={0}
        aria-valuemax={totalCount}
        aria-valuenow={doneCount}
        className="mt-4 h-3 overflow-hidden rounded-full bg-cream-200"
      >
        <div className="h-full rounded-full bg-brand-500 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
    </section>
  );
}
