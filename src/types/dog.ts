export type Dog = {
  id: string;
  owner_id: string;
  name: string;
  breed: string | null;
  date_of_birth: string | null;
  weight_kg: number | null;
  photo_path: string | null;
  vet_practice_name: string | null;
  vet_phone: string | null;
  notes: string | null;
  created_at: string;
};

export type DogFormValues = {
  name: string;
  breed: string;
  dateOfBirth: string;
  weightKg: string;
  vetPracticeName: string;
  vetPhone: string;
  notes: string;
};
