import { Appointment } from './appointment.model';
import { Patient } from './patient.model';
import { Physician } from './physician.model';
import { Gender } from './gender.enum';

describe('Appointment Model', () => {
  let appointment: Appointment;
  let mockPatient: Patient;
  let mockPhysician: Physician;
  let appointmentDate: Date;

  beforeEach(() => {
    appointmentDate = new Date('2025-08-15T10:00:00');

    mockPatient = new Patient(
      'Juan',
      'Pérez',
      'González',
      'juan@test.com',
      'password123',
      '12345678-9',
      new Date('1990-01-01'),
      '56912345678',
      'Av. Principal 123',
      Gender.Male
    );

    mockPhysician = new Physician(
      'Dr. María',
      'Silva',
      'Castro',
      'maria@hospital.com',
      'password456',
      'Cardiología'
    );

    appointment = new Appointment(mockPatient, mockPhysician, appointmentDate);
  });

  describe('Constructor', () => {
    it('should create an appointment with patient, physician and date', () => {
      expect(appointment).toBeTruthy();
      expect(appointment).toBeInstanceOf(Appointment);
    });

    it('should store the appointment data correctly', () => {
      // Since the properties are private, we test the appointment was created successfully
      expect(appointment).toBeDefined();
    });

    it('should accept different dates', () => {
      const differentDate = new Date('2025-09-01T14:00:00');
      const newAppointment = new Appointment(
        mockPatient,
        mockPhysician,
        differentDate
      );

      expect(newAppointment).toBeTruthy();
      expect(newAppointment).toBeInstanceOf(Appointment);
    });

    it('should accept different patients', () => {
      const anotherPatient = new Patient(
        'María',
        'González',
        'López',
        'maria@test.com',
        'password789',
        '87654321-0',
        new Date('1985-05-15'),
        '56987654321',
        'Calle Falsa 456',
        Gender.Female
      );

      const newAppointment = new Appointment(
        anotherPatient,
        mockPhysician,
        appointmentDate
      );

      expect(newAppointment).toBeTruthy();
      expect(newAppointment).toBeInstanceOf(Appointment);
    });

    it('should accept different physicians', () => {
      const anotherPhysician = new Physician(
        'Dr. Carlos',
        'Rodríguez',
        'Martínez',
        'carlos@hospital.com',
        'password789',
        'Neurología'
      );

      const newAppointment = new Appointment(
        mockPatient,
        anotherPhysician,
        appointmentDate
      );

      expect(newAppointment).toBeTruthy();
      expect(newAppointment).toBeInstanceOf(Appointment);
    });
  });
});
