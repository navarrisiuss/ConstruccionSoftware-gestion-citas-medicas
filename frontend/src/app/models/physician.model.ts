import { Person } from './person.model';

export class Physician extends Person {
  private specialty: string;

  constructor(
    name: string,
    paternalLastName: string,
    maternalLastName: string,
    email: string,
    password: string,
    specialty: string
  ) {
    super(name, paternalLastName, maternalLastName, email, password);
    this.specialty = specialty;
  }

  setSpecialty(specialty: string): void {
    this.specialty = specialty;
  }

  getSpecialty(): string {
    return this.specialty;
  }
}
