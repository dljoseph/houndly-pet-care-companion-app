import { formatDateTime, formatDay } from '@/lib/dates';
import { supabase } from '@/lib/supabase';
import type {
  Appointment,
  AppointmentFormValues,
  AppointmentType,
  Vaccination,
  VaccinationFormValues,
  VaccinationStatus,
} from '@/types/health';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DUE_SOON_DAYS = 30;

const VACCINATION_COLUMNS = 'id, name, date_given, due_date, clinic, notes';
const APPOINTMENT_COLUMNS = 'id, type, scheduled_at, location, notes';

function blankToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function vaccinationStatus(dueDate: string | null, today: string): VaccinationStatus {
  if (!dueDate) return 'no-due-date';
  if (dueDate < today) return 'overdue';
  if (dueDate <= addDays(today, DUE_SOON_DAYS)) return 'due-soon';
  return 'up-to-date';
}

export type ComingUpItem = {
  key: string;
  kind: 'vaccination' | 'appointment';
  title: string;
  when: string;
  overdue: boolean;
  sortTime: number;
};

const APPOINTMENT_TITLES: Record<AppointmentType, string> = {
  Vet: 'Vet check-up',
  Grooming: 'Grooming',
};

export function buildComingUp(vaccinations: Vaccination[], appointments: Appointment[], today: string): ComingUpItem[] {
  const now = Date.now();
  const horizon = now + DUE_SOON_DAYS * 24 * 60 * 60 * 1000;

  const vaccinationItems = vaccinations.flatMap((vaccination): ComingUpItem[] => {
    if (!vaccination.due_date) return [];
    const status = vaccinationStatus(vaccination.due_date, today);
    if (status !== 'overdue' && status !== 'due-soon') return [];
    return [
      {
        key: `vaccination:${vaccination.id}`,
        kind: 'vaccination',
        title: vaccination.name,
        when: `Due ${formatDay(vaccination.due_date)}`,
        overdue: status === 'overdue',
        sortTime: new Date(`${vaccination.due_date}T00:00:00`).getTime(),
      },
    ];
  });

  const appointmentItems = appointments.flatMap((appointment): ComingUpItem[] => {
    const scheduled = new Date(appointment.scheduled_at).getTime();
    if (Number.isNaN(scheduled) || scheduled < now || scheduled > horizon) return [];
    return [
      {
        key: `appointment:${appointment.id}`,
        kind: 'appointment',
        title: APPOINTMENT_TITLES[appointment.type],
        when: formatDateTime(appointment.scheduled_at),
        overdue: false,
        sortTime: scheduled,
      },
    ];
  });

  return [...vaccinationItems, ...appointmentItems].sort((a, b) => {
    if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
    return a.sortTime - b.sortTime;
  });
}

export function toDateTimeLocal(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export async function listVaccinations(dogId: string): Promise<Vaccination[]> {
  const { data, error } = await supabase
    .from('vaccinations')
    .select(VACCINATION_COLUMNS)
    .eq('dog_id', dogId)
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('date_given', { ascending: false });
  if (error) throw error;
  return data as Vaccination[];
}

export async function listAppointments(dogId: string): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select(APPOINTMENT_COLUMNS)
    .eq('dog_id', dogId)
    .order('scheduled_at', { ascending: true });
  if (error) throw error;
  return data as Appointment[];
}

export function validateVaccinationForm(values: VaccinationFormValues): string | null {
  if (!values.name.trim()) return 'Please name the vaccination.';
  if (values.name.trim().length > 120) return 'Vaccination names can be up to 120 characters.';
  if (!DATE_PATTERN.test(values.dateGiven)) return 'Please choose the date it was given.';
  if (values.dueDate && (!DATE_PATTERN.test(values.dueDate) || values.dueDate < values.dateGiven)) {
    return 'The due date must be on or after the date it was given.';
  }
  if (values.clinic.trim().length > 120) return 'Clinic names can be up to 120 characters.';
  if (values.notes.trim().length > 1000) return 'Notes can be up to 1,000 characters.';
  return null;
}

export async function saveVaccination(dogId: string, id: string | null, values: VaccinationFormValues): Promise<void> {
  const row = {
    name: values.name.trim(),
    date_given: values.dateGiven,
    due_date: values.dueDate || null,
    clinic: blankToNull(values.clinic),
    notes: blankToNull(values.notes),
  };
  const { error } = id
    ? await supabase.from('vaccinations').update(row).eq('id', id)
    : await supabase.from('vaccinations').insert({ ...row, dog_id: dogId });
  if (error) throw error;
}

export function validateAppointmentForm(values: AppointmentFormValues): string | null {
  if (!values.scheduledAt || Number.isNaN(new Date(values.scheduledAt).getTime())) {
    return 'Please choose when the appointment is.';
  }
  if (values.location.trim().length > 160) return 'Locations can be up to 160 characters.';
  if (values.notes.trim().length > 1000) return 'Notes can be up to 1,000 characters.';
  return null;
}

export async function saveAppointment(dogId: string, id: string | null, values: AppointmentFormValues): Promise<void> {
  const row = {
    type: values.type,
    scheduled_at: new Date(values.scheduledAt).toISOString(),
    location: blankToNull(values.location),
    notes: blankToNull(values.notes),
  };
  const { error } = id
    ? await supabase.from('appointments').update(row).eq('id', id)
    : await supabase.from('appointments').insert({ ...row, dog_id: dogId });
  if (error) throw error;
}

export async function deleteVaccination(id: string): Promise<void> {
  const { error } = await supabase.from('vaccinations').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteAppointment(id: string): Promise<void> {
  const { error } = await supabase.from('appointments').delete().eq('id', id);
  if (error) throw error;
}
