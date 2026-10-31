import { useCallback, useEffect, useState } from 'react';
import { listDogs } from '@/lib/dogs';
import type { Dog } from '@/types/dog';

type DogsState =
  | { status: 'loading'; dogs: [] }
  | { status: 'ready'; dogs: Dog[] }
  | { status: 'error'; dogs: [] };

export function useDogs() {
  const [state, setState] = useState<DogsState>({ status: 'loading', dogs: [] });

  const reload = useCallback(async () => {
    try {
      const dogs = await listDogs();
      setState({ status: 'ready', dogs });
    } catch {
      setState({ status: 'error', dogs: [] });
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { state, reload };
}
