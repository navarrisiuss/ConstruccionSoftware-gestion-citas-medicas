import { Physician } from './physician.model';
import { Patient } from './patient.model';

export class Appointment {
  constructor(
    private patient: Patient,
    private physician: Physician,
    private date: Date
  ) {
    this.patient = patient;
    this.physician = physician;
    this.date = date;
  }
}
