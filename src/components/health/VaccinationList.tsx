import { AlertTriangle, Check, Clock, Pencil, Syringe, Trash2 } from 'lucide-react';
import { formatDay } from '@/lib/dates';
import { vaccinationStatus } from '@/lib/health';
import type { Vaccination, VaccinationStatus } from '@/types/health';

type VaccinationListProps = {
  vaccinations: Vaccination[];
  today: string;
  onEdit: (vaccination: Vaccination) => void;
  onDelete: (vaccination: Vaccination) => void;
};

const STATUS_STYLES: Record<VaccinationStatus, { label: string; className: string; Icon: typeof Check }> = {
  overdue: { label: 'Overdue', className: 'bg-rose-100 text-rose-700', Icon: AlertTriangle },
  'due-soon': { label: 'Due within 30 days', className: 'bg-amber-100 text-amber-800', Icon: Clock },
  'up-to-date': { label: 'Up to date', className: 'bg-brand-100 text-brand-800', Icon: Check },
  'no-due-date': { label: 'No due date', className: 'bg-cream-200 text-ink-muted', Icon: Clock },
};

const ICON_BUTTON_CLASS =
  'tap-target flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition hover:bg-cream-100 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500';

export default function VaccinationList({ vaccinations, today, onEdit, onDelete }: VaccinationListProps) {
  return (
    <ul className="flex flex-col gap-3">
      {vaccinations.map((vaccination) => {
        const status = STATUS_STYLES[vaccinationStatus(vaccination.due_date, today)];
        const StatusIcon = status.Icon;
        return (
          <li
            key={vaccination.id}
            className="flex flex-col gap-3 rounded-2xl border border-cream-300 bg-white p-4 shadow-soft sm:flex-row sm:items-center"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <Syringe className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="flex-1">
              <p className="font-semibold text-ink">{vaccination.name}</p>
              <p className="text-sm text-ink-muted">
                Given {formatDay(vaccination.date_given)}
                {vaccination.due_date ? ` · Due ${formatDay(vaccination.due_date)}` : ''}
              </p>
              {vaccination.clinic && <p className="text-sm text-ink-muted">{vaccination.clinic}</p>}
            </div>
            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
              >
                <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {status.label}
              </span>
              <button type="button" onClick={() => onEdit(vaccination)} aria-label={`Edit ${vaccination.name}`} className={ICON_BUTTON_CLASS}>
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => onDelete(vaccination)} aria-label={`Delete ${vaccination.name}`} className={ICON_BUTTON_CLASS}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
