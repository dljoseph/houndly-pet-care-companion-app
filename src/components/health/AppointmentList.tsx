import { MapPin, Pencil, Scissors, Stethoscope, Trash2 } from 'lucide-react';
import { formatDateTime } from '@/lib/dates';
import type { Appointment } from '@/types/health';

type AppointmentListProps = {
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointment: Appointment) => void;
};

const ICON_BUTTON_CLASS =
  'tap-target flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition hover:bg-cream-100 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500';

export default function AppointmentList({ appointments, onEdit, onDelete }: AppointmentListProps) {
  return (
    <ul className="flex flex-col gap-3">
      {appointments.map((appointment) => {
        const isVet = appointment.type === 'Vet';
        const Icon = isVet ? Stethoscope : Scissors;
        const label = isVet ? 'Vet check-up' : 'Grooming';
        return (
          <li
            key={appointment.id}
            className="flex items-center gap-4 rounded-2xl border border-cream-300 bg-white p-4 shadow-soft"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="flex-1">
              <p className="font-semibold text-ink">{label}</p>
              <p className="text-sm text-ink-muted">{formatDateTime(appointment.scheduled_at)}</p>
              {appointment.location && (
                <p className="flex items-center gap-1 text-sm text-ink-muted">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {appointment.location}
                </p>
              )}
            </div>
            <button type="button" onClick={() => onEdit(appointment)} aria-label={`Edit ${label} appointment`} className={ICON_BUTTON_CLASS}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => onDelete(appointment)} aria-label={`Delete ${label} appointment`} className={ICON_BUTTON_CLASS}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
