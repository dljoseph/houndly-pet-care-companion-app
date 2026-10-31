import { useState } from 'react';
import { CalendarPlus, Plus } from 'lucide-react';
import AppointmentDialog from '@/components/health/AppointmentDialog';
import AppointmentList from '@/components/health/AppointmentList';
import VaccinationDialog from '@/components/health/VaccinationDialog';
import VaccinationList from '@/components/health/VaccinationList';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useHealthRecords } from '@/hooks/useHealthRecords';
import { todayIsoDate } from '@/lib/dates';
import { deleteAppointment, deleteVaccination } from '@/lib/health';
import type { Dog } from '@/types/dog';
import type { Appointment, Vaccination } from '@/types/health';

type HealthScreenProps = {
  dog: Dog;
};

type DialogState =
  | { kind: 'vaccination'; item: Vaccination | null }
  | { kind: 'appointment'; item: Appointment | null };

type PendingDelete =
  | { kind: 'vaccination'; item: Vaccination }
  | { kind: 'appointment'; item: Appointment };

const SECTION_BUTTON_PRIMARY =
  'tap-target flex items-center gap-2 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-cream-50 shadow-soft transition hover:bg-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2';
const SECTION_BUTTON_SECONDARY =
  'tap-target flex items-center gap-2 rounded-full border border-brand-300 bg-white px-4 py-2 text-sm font-semibold text-brand-800 transition hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2';

export default function HealthScreen({ dog }: HealthScreenProps) {
  const { state, reload } = useHealthRecords(dog.id);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const today = todayIsoDate();

  const closeDialog = () => setDialog(null);

  const handleSaved = () => {
    setDialog(null);
    void reload();
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    setActionError(null);
    try {
      if (pendingDelete.kind === 'vaccination') {
        await deleteVaccination(pendingDelete.item.id);
      } else {
        await deleteAppointment(pendingDelete.item.id);
      }
      setPendingDelete(null);
      void reload();
    } catch {
      setPendingDelete(null);
      setActionError("We couldn't delete that. Check your connection and try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-3xl font-bold text-brand-800">Health</h1>
        <p className="mt-1 text-base text-ink-muted">Vaccinations and appointments for {dog.name}.</p>
      </section>

      {actionError && (
        <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {actionError}
        </p>
      )}

      {state.status === 'loading' && <p className="text-base text-ink-muted">Loading health records...</p>}

      {state.status === 'error' && (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">
          <p>We couldn't load {dog.name}'s health records. Check your connection and try again.</p>
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
        <>
          <section aria-labelledby="vaccinations-heading" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="vaccinations-heading" className="text-lg font-bold text-brand-800">
                Vaccinations
              </h2>
              <button
                type="button"
                onClick={() => setDialog({ kind: 'vaccination', item: null })}
                className={SECTION_BUTTON_PRIMARY}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add vaccination
              </button>
            </div>
            {state.vaccinations.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-cream-300 bg-cream-50 p-6 text-center text-sm text-ink-muted">
                No vaccinations recorded yet.
              </p>
            ) : (
              <VaccinationList
                vaccinations={state.vaccinations}
                today={today}
                onEdit={(item) => setDialog({ kind: 'vaccination', item })}
                onDelete={(item) => setPendingDelete({ kind: 'vaccination', item })}
              />
            )}
          </section>

          <section aria-labelledby="appointments-heading" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="appointments-heading" className="text-lg font-bold text-brand-800">
                Appointments
              </h2>
              <button
                type="button"
                onClick={() => setDialog({ kind: 'appointment', item: null })}
                className={SECTION_BUTTON_SECONDARY}
              >
                <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                Add appointment
              </button>
            </div>
            {state.appointments.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-cream-300 bg-cream-50 p-6 text-center text-sm text-ink-muted">
                No appointments booked yet.
              </p>
            ) : (
              <AppointmentList
                appointments={state.appointments}
                onEdit={(item) => setDialog({ kind: 'appointment', item })}
                onDelete={(item) => setPendingDelete({ kind: 'appointment', item })}
              />
            )}
          </section>
        </>
      )}

      {dialog?.kind === 'vaccination' && (
        <VaccinationDialog dogId={dog.id} existing={dialog.item} onSaved={handleSaved} onClose={closeDialog} />
      )}

      {dialog?.kind === 'appointment' && (
        <AppointmentDialog dogId={dog.id} existing={dialog.item} onSaved={handleSaved} onClose={closeDialog} />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title={pendingDelete.kind === 'vaccination' ? 'Delete this vaccination?' : 'Delete this appointment?'}
          message={`This removes it from ${dog.name}'s health record.`}
          confirmLabel="Delete"
          isWorking={isDeleting}
          onConfirm={() => void confirmDelete()}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
