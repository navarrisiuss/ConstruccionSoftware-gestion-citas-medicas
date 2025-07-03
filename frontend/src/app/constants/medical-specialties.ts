export const MEDICAL_SPECIALTIES = [
  { value: 'cardiologia', label: 'Cardiología' },
  { value: 'dermatologia', label: 'Dermatología' },
  { value: 'endocrinologia', label: 'Endocrinología' },
  { value: 'gastroenterologia', label: 'Gastroenterología' },
  { value: 'ginecologia', label: 'Ginecología' },
  { value: 'neurologia', label: 'Neurología' },
  { value: 'oftalmologia', label: 'Oftalmología' },
  { value: 'otorrinolaringologia', label: 'Otorrinolaringología' },
  { value: 'pediatria', label: 'Pediatría' },
  { value: 'psiquiatria', label: 'Psiquiatría' },
  { value: 'traumatologia', label: 'Traumatología' },
  { value: 'urologia', label: 'Urología' },
  { value: 'medicina_general', label: 'Medicina General' },
  { value: 'medicina_interna', label: 'Medicina Interna' },
  { value: 'cirugia_general', label: 'Cirugía General' },
];

export type MedicalSpecialty = (typeof MEDICAL_SPECIALTIES)[number]['value'];
