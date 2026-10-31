import { useCallback, useEffect, useState } from 'react';
import { loadTodayTicks, setTickDone, type TodayTick } from '@/lib/todayChecklist';

type TodayTicksState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; ticks: TodayTick[] };

export function useTodayTicks(dogId: string, today: string) {
  const [state, setState] = useState<TodayTicksState>({ status: 'loading' });
  const [actionError, setActionError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const ticks = await loadTodayTicks(dogId, today);
      setState({ status: 'ready', ticks });
    } catch {
      setState({ status: 'error' });
    }
  }, [dogId, today]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const toggleTick = async (tick: TodayTick) => {
    const nextDone = !tick.done;
    setActionError(null);
    const applyDone = (done: boolean) =>
      setState((current) =>
        current.status === 'ready'
          ? {
              status: 'ready',
              ticks: current.ticks.map((item) => (item.key === tick.key ? { ...item, done } : item)),
            }
          : current,
      );

    applyDone(nextDone);
    try {
      await setTickDone(tick, today, nextDone);
    } catch {
      applyDone(tick.done);
      setActionError("We couldn't save that tick. Check your connection and try again.");
    }
  };

  return { state, actionError, reload, toggleTick };
}
