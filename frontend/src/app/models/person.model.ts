export class Person {
  constructor(
    private name: string,
    private paternalLastName: string,
    private maternalLastName: string,
    private email: string,
    private password: string
  ) {}

  isValid(): boolean {
    return (
      this.name != null &&
      this.name.trim().length > 0 &&
      this.paternalLastName != null &&
      this.paternalLastName.trim().length > 0 &&
      this.maternalLastName != null &&
      this.maternalLastName.trim().length > 0 &&
      this.email != null &&
      this.email.trim().length > 0 &&
      this.password != null &&
      this.password.trim().length > 0 &&
      this.isValidEmail(this.email) // Add email format validation
    );
  }

  private isValidEmail(email: string): boolean {
    if (!email) {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

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
