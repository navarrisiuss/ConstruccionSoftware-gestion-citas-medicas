import { Person } from './person.model';
import { Physician } from './physician.model';
import { Assistant } from './assistant.model';

export class Admin extends Person {
  constructor(name: string, paternalLastName: string, maternalLastName: string, email: string, password: string) {
    super(name, paternalLastName, maternalLastName, email, password);
  }

  registerPhysician(physician: Physician): boolean {
    let valid: boolean = false;
    if (physician.isValid()) {
      valid = true;
    }
    return valid;
  }

  registerAssistant(assistant: Assistant): boolean {
    let valid: boolean = false;
    if (assistant.isValid()) {
      valid = true;
    }
    return valid;
  }

  // Métodos adicionales para control total
  generateReport(type: string): any {
    // Lógica para generar reportes
    return {};
  }

  manageAppointments(): boolean {
    return true;
  }

  viewMedicalHistory(): boolean {
    return true;
  }
}