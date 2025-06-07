import {Person} from './person.model';
import {Gender} from './gender.enum'

export class Patient extends Person {
  private rut: string;
  private birthDate: Date;
  private phone: string;
  private address: string;
  public gender: Gender | null;
  
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
    gender: Gender | null) { // 🎯 Cambiar aquí para aceptar null
    super(name, paternalLastName, maternalLastName, email, password);
    this.rut = rut;
    this.birthDate = birthDate;
    this.phone = phone;
    this.address = address;
    this.gender = gender;
  }
}