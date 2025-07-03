import { Patient } from './patient.model';
import { Gender } from './gender.enum';

describe('Patient Model', () => {
  let patient: Patient;

  beforeEach(() => {
    patient = new Patient(
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
  });

  describe('Constructor and Basic Properties', () => {
    it('should create a patient with all properties', () => {
      expect(patient.getName()).toBe('Juan');
      expect(patient.getPaternalLastName()).toBe('Pérez');
      expect(patient.getMaternalLastName()).toBe('González');
      expect(patient.getEmail()).toBe('juan@test.com');
      expect(patient.getPassword()).toBe('password123');
    });

    it('should inherit from Person and format full name correctly', () => {
      expect(patient.getFullName()).toBe('Juan Pérez González');
    });

    it('should be valid when all required fields are provided', () => {
      expect(patient.isValid()).toBe(true);
    });

    it('should be invalid when required fields are empty', () => {
      const invalidPatient = new Patient(
        '',
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
      expect(invalidPatient.isValid()).toBe(false);
    });
  });

  describe('Setters and Getters', () => {
    it('should update name correctly', () => {
      patient.setName('Carlos');
      expect(patient.getName()).toBe('Carlos');
      expect(patient.getFullName()).toBe('Carlos Pérez González');
    });

    it('should update email correctly', () => {
      patient.setEmail('carlos@test.com');
      expect(patient.getEmail()).toBe('carlos@test.com');
    });

    it('should update paternal last name correctly', () => {
      patient.setPaternalLastName('Silva');
      expect(patient.getPaternalLastName()).toBe('Silva');
      expect(patient.getFullName()).toBe('Juan Silva González');
    });

    it('should update maternal last name correctly', () => {
      patient.setMaternalLastName('Castro');
      expect(patient.getMaternalLastName()).toBe('Castro');
      expect(patient.getFullName()).toBe('Juan Pérez Castro');
    });

    it('should update password correctly', () => {
      patient.setPassword('newPassword123');
      expect(patient.getPassword()).toBe('newPassword123');
    });
  });
});
