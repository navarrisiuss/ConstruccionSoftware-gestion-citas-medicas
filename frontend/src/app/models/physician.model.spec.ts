import { Physician } from './physician.model';

describe('Physician Model', () => {
  let physician: Physician;

  beforeEach(() => {
    physician = new Physician(
      'Dr. Juan',
      'Pérez',
      'González',
      'juan@hospital.com',
      'password123',
      'Cardiología'
    );
  });

  describe('Constructor and Basic Properties', () => {
    it('should create a physician with all properties', () => {
      expect(physician.getName()).toBe('Dr. Juan');
      expect(physician.getPaternalLastName()).toBe('Pérez');
      expect(physician.getMaternalLastName()).toBe('González');
      expect(physician.getEmail()).toBe('juan@hospital.com');
      expect(physician.getPassword()).toBe('password123');
      expect(physician.getSpecialty()).toBe('Cardiología');
    });

    it('should inherit from Person and format full name correctly', () => {
      expect(physician.getFullName()).toBe('Dr. Juan Pérez González');
    });

    it('should be valid when all required fields are provided', () => {
      expect(physician.isValid()).toBe(true);
    });

    it('should be invalid when required fields are empty', () => {
      const invalidPhysician = new Physician(
        '',
        'Pérez',
        'González',
        'juan@hospital.com',
        'password123',
        'Cardiología'
      );
      expect(invalidPhysician.isValid()).toBe(false);
    });

    it('should be invalid when email is empty', () => {
      const invalidPhysician = new Physician(
        'Dr. Juan',
        'Pérez',
        'González',
        '',
        'password123',
        'Cardiología'
      );
      expect(invalidPhysician.isValid()).toBe(false);
    });

    it('should be invalid when password is empty', () => {
      const invalidPhysician = new Physician(
        'Dr. Juan',
        'Pérez',
        'González',
        'juan@hospital.com',
        '',
        'Cardiología'
      );
      expect(invalidPhysician.isValid()).toBe(false);
    });
  });

  describe('Specialty Management', () => {
    it('should set and get specialty correctly', () => {
      physician.setSpecialty('Neurología');
      expect(physician.getSpecialty()).toBe('Neurología');
    });

    it('should handle different medical specialties', () => {
      const specialties = [
        'Pediatría',
        'Ginecología',
        'Traumatología',
        'Dermatología',
        'Psiquiatría',
        'Oftalmología',
      ];

      specialties.forEach((specialty) => {
        physician.setSpecialty(specialty);
        expect(physician.getSpecialty()).toBe(specialty);
      });
    });

    it('should accept empty specialty', () => {
      physician.setSpecialty('');
      expect(physician.getSpecialty()).toBe('');
    });

    it('should accept specialty with special characters', () => {
      physician.setSpecialty('Cirugía - Cardiovascular');
      expect(physician.getSpecialty()).toBe('Cirugía - Cardiovascular');
    });
  });

  describe('Different Physician Instances', () => {
    it('should create physician with different specialties', () => {
      const cardiologist = new Physician(
        'Dr. María',
        'Silva',
        'Castro',
        'maria@hospital.com',
        'password456',
        'Cardiología'
      );

      const pediatrician = new Physician(
        'Dr. Carlos',
        'Rodríguez',
        'Martín',
        'carlos@hospital.com',
        'password789',
        'Pediatría'
      );

      expect(cardiologist.getSpecialty()).toBe('Cardiología');
      expect(pediatrician.getSpecialty()).toBe('Pediatría');
      expect(cardiologist.getFullName()).toBe('Dr. María Silva Castro');
      expect(pediatrician.getFullName()).toBe('Dr. Carlos Rodríguez Martín');
    });

    it('should create female physicians', () => {
      const femalePhysician = new Physician(
        'Dra. Ana',
        'López',
        'Fernández',
        'ana@hospital.com',
        'password000',
        'Ginecología'
      );

      expect(femalePhysician.getName()).toBe('Dra. Ana');
      expect(femalePhysician.getSpecialty()).toBe('Ginecología');
    });
  });

  describe('Setters and Getters', () => {
    it('should update name correctly', () => {
      physician.setName('Dr. Luis');
      expect(physician.getName()).toBe('Dr. Luis');
      expect(physician.getFullName()).toBe('Dr. Luis Pérez González');
    });

    it('should update email correctly', () => {
      physician.setEmail('luis@hospital.com');
      expect(physician.getEmail()).toBe('luis@hospital.com');
    });

    it('should update paternal last name correctly', () => {
      physician.setPaternalLastName('Silva');
      expect(physician.getPaternalLastName()).toBe('Silva');
      expect(physician.getFullName()).toBe('Dr. Juan Silva González');
    });

    it('should update maternal last name correctly', () => {
      physician.setMaternalLastName('Castro');
      expect(physician.getMaternalLastName()).toBe('Castro');
      expect(physician.getFullName()).toBe('Dr. Juan Pérez Castro');
    });

    it('should update password correctly', () => {
      physician.setPassword('newPhysicianPassword123');
      expect(physician.getPassword()).toBe('newPhysicianPassword123');
    });

    it('should update specialty and maintain other properties', () => {
      const originalName = physician.getName();
      const originalEmail = physician.getEmail();

      physician.setSpecialty('Traumatología');

      expect(physician.getSpecialty()).toBe('Traumatología');
      expect(physician.getName()).toBe(originalName);
      expect(physician.getEmail()).toBe(originalEmail);
    });
  });

  describe('Validation Edge Cases', () => {
    it('should handle physician with very long specialty name', () => {
      const longSpecialty =
        'Cirugía Cardiovascular y Torácica Especializada en Procedimientos Mínimamente Invasivos';
      physician.setSpecialty(longSpecialty);
      expect(physician.getSpecialty()).toBe(longSpecialty);
    });

    it('should validate with specialty containing numbers', () => {
      physician.setSpecialty('COVID-19 Specialist');
      expect(physician.getSpecialty()).toBe('COVID-19 Specialist');
    });
  });
});
