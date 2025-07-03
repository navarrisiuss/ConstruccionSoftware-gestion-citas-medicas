import { Person } from './person.model';
import { Gender } from './gender.enum';

export class Patient extends Person {
  private rut: string;
  private birthDate: Date;
  private phone: string;
  private address: string;
  private gender: Gender;

  constructor(
    name: string,
    paternalLastName: string,
    maternalLastName: string,
    email: string,
    password: string,
    rut: string,
    birthDate: Date,
    phone: string,
    address: string,
    gender: Gender
  ) {
    super(name, paternalLastName, maternalLastName, email, password);
    this.rut = rut;
    this.birthDate = birthDate;
    this.phone = phone;
    this.address = address;
    this.gender = gender;
  }

  // Override isValid to include Patient-specific validations
  override isValid(): boolean {
    // First check Person validation (name, email, password)
    if (!super.isValid()) {
      return false;
    }

    // Patient-specific validations
    if (!this.rut || this.rut.trim() === '') {
      return false;
    }

    if (!this.phone || this.phone.trim() === '') {
      return false;
    }

    if (!this.address || this.address.trim() === '') {
      return false;
    }

    if (!this.birthDate) {
      return false;
    }

    // Gender can be 0 (Male) or 1 (Female); null or undefined should be invalid
    if (this.gender == null) {
      return false;
    }

    return true;
  }

  // Getters
  getRut(): string {
    return this.rut;
  }

  getBirthDate(): Date {
    return this.birthDate;
  }

  getPhone(): string {
    return this.phone;
  }

  getAddress(): string {
    return this.address;
  }

  getGender(): Gender {
    return this.gender;
  }

  // Setters
  setRut(rut: string): void {
    this.rut = rut;
  }

  setBirthDate(birthDate: Date): void {
    this.birthDate = birthDate;
  }

  setPhone(phone: string): void {
    this.phone = phone;
  }

  setAddress(address: string): void {
    this.address = address;
  }

  setGender(gender: Gender): void {
    this.gender = gender;
  }
}
