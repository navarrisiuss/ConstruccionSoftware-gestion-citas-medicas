import { Person } from './person.model';

export class Physician extends Person {
  constructor(
    name: string,
    paternalLastName: string,
    maternalLastName: string,
    email: string,
    password: string) {
    super(name, paternalLastName, maternalLastName, email, password);
  }
}
