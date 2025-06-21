import {Person} from './person.model';

export class Physician extends Person {
  private id?: number;  // id opcional
  private specialty: string;

  constructor(
    name: string,
    paternalLastName: string,
    maternalLastName: string,
    email: string,
    password: string,
    specialty: string,
    id?: number  // ponerlo al final como opcional
  ) {
    super(name, paternalLastName, maternalLastName, email, password);
    this.specialty = specialty;
    this.id = id;
  }

  getId(): number | undefined {
    return this.id;
  }

  setSpecialty(specialty: string): void {
    this.specialty = specialty;
  }

  getSpecialty(): string {
    return this.specialty;
  }
}
