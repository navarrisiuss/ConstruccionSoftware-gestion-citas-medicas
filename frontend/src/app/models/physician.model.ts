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

  // Override isValid to include specialty validation
  override isValid(): boolean {
    // First check Person validation (name, email, password)
    if (!super.isValid()) {
      return false;
    }

    // Physician-specific validation
    if (!this.specialty || this.specialty.trim() === '') {
      return false;
    }

    return true;
  }

  setSpecialty(specialty: string): void {
    this.specialty = specialty;
  }

  getSpecialty(): string {
    return this.specialty;
  }
}
