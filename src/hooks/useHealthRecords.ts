import { useCallback, useEffect, useState } from 'react';
import { listAppointments, listVaccinations } from '@/lib/health';
import type { Appointment, Vaccination } from '@/types/health';

type HealthRecordsState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; vaccinations: Vaccination[]; appointments: Appointment[] };

export function useHealthRecords(dogId: string) {
  const [state, setState] = useState<HealthRecordsState>({ status: 'loading' });

  const reload = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const [vaccinations, appointments] = await Promise.all([listVaccinations(dogId), listAppointments(dogId)]);
      setState({ status: 'ready', vaccinations, appointments });
    } catch {
      setState({ status: 'error' });
    }
  }, [dogId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { state, reload };
}
