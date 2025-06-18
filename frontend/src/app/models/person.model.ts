export class Person {
  constructor(
    private name: string,
    private paternalLastName: string,
    private maternalLastName: string,
    private email: string,
    private password: string
  ) {}

  isValid(): boolean {
    return this.name.length > 0 && this.paternalLastName.length > 0 && this.maternalLastName.length > 0 && this.email.length > 0 && this.password.length > 0;
  }

  // Getters
  getName(): string {
    return this.name;
  }

  getPaternalLastName(): string {
    return this.paternalLastName;
  }

  getFullName(): string {
    return `${this.name} ${this.paternalLastName} ${this.maternalLastName}`;
  }

  getMaternalLastName(): string {
    return this.maternalLastName;
  }

  getEmail(): string {
    return this.email;
  }

  getPassword(): string {
    return this.password;
  }

  // Setters

  setName(name: string) {
    this.name = name;
  }

  setPaternalLastName(paternalLastName: string) {
    this.paternalLastName = paternalLastName;
  }

  setMaternalLastName(maternalLastName: string) {
    this.maternalLastName = maternalLastName;
  }

  setEmail(email: string) {
    this.email = email;
  }

  setPassword(password: string) {
    this.password = password;
  }
}
