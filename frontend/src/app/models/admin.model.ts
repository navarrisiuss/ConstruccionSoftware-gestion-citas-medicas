import { Person } from './person.model';
import { Physician } from './physician.model';

export class Admin extends Person {
  constructor(
    name: string,
    paternalLastName: string,
    maternalLastName: string,
    email: string,
    password: string
  ) {
    super(name, paternalLastName, maternalLastName, email, password);
  }

  registerPhysician(physician: Physician): boolean {
    let valid: boolean = false;

    if (physician.isValid()) {
      valid = true;
    }
    return valid;
  }
}
