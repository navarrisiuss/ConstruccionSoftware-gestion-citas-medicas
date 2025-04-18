import { Person } from './person.model';

export class Patient extends Person {
  constructor(
    name: string,
    paternalLastName: string,
    maternalLastName: string,
    email: string,
    password: string) {
    super(name, paternalLastName, maternalLastName, email, password);
  }
}
