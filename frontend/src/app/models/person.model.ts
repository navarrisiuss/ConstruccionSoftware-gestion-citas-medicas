export class Person {
  constructor(
    public name: string,
    public paternalLastName: string,
    public maternalLastName: string,
    private email: string,
    private password: string
  ) {}

  isValid(): boolean {
    return this.name.length > 0 && this.paternalLastName.length > 0 && this.maternalLastName.length > 0 && this.email.length > 0 && this.password.length > 0;
  }

  // Getters
  public getName(): string {
    return this.name;
  }

  public getPaternalLastName(): string {
    return this.paternalLastName;
  }

  public getFullName(): string {
    return `${this.name} ${this.paternalLastName} ${this.maternalLastName}`;
  }

  public getMaternalLastName(): string {
    return this.maternalLastName;
  }

  public getEmail(): string {
    return this.email;
  }

  public getPassword(): string {
    return this.password;
  }

  // Setters
  public setName(name: string) {
    this.name = name;
  }

  public setPaternalLastName(paternalLastName: string) {
    this.paternalLastName = paternalLastName;
  }

  public setMaternalLastName(maternalLastName: string) {
    this.maternalLastName = maternalLastName;
  }

  public setEmail(email: string) {
    this.email = email;
  }

  public setPassword(password: string) {
    this.password = password;
  }
}
