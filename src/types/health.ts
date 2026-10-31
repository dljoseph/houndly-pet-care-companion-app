export const APPOINTMENT_TYPES = ['Vet', 'Grooming'] as const;

export type AppointmentType = (typeof APPOINTMENT_TYPES)[number];

export type Vaccination = {
  id: string;
  name: string;
  date_given: string;
  due_date: string | null;
  clinic: string | null;
  notes: string | null;
};

export type Appointment = {
  id: string;
  type: AppointmentType;
  scheduled_at: string;
  location: string | null;
  notes: string | null;
};

export type VaccinationStatus = 'overdue' | 'due-soon' | 'up-to-date' | 'no-due-date';

export type VaccinationFormValues = {
  name: string;
  dateGiven: string;
  dueDate: string;
  clinic: string;
  notes: string;
};

export type AppointmentFormValues = {
  type: AppointmentType;
  scheduledAt: string;
  location: string;
  notes: string;
};
