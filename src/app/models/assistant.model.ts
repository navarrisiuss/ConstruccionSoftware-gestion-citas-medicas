import { Person } from './person.model';
import { Patient } from './patient.model';

export class Assistant extends Person {
  constructor(
    name: string,
    paternalLastName: string,
    maternalLastName: string,
    email: string,
    password: string) {
    super(name, paternalLastName, maternalLastName, email, password);
  }

  registerPatient(patient: Patient): boolean {
    let valid: boolean = false;

    if (patient.isValid()) {
      valid = true;
    }

    return valid;
  }
}
