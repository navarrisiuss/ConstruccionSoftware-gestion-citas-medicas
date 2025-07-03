import { Assistant } from './assistant.model';
import { Patient } from './patient.model';
import { Gender } from './gender.enum';

describe('Assistant Model', () => {
  let assistant: Assistant;

  beforeEach(() => {
    assistant = new Assistant(
      'María',
      'González',
      'Martínez',
      'maria@hospital.com',
      'assistant123'
    );
  });

  describe('Constructor and Basic Properties', () => {
    it('should create an assistant with all properties', () => {
      expect(assistant.getName()).toBe('María');
      expect(assistant.getPaternalLastName()).toBe('González');
      expect(assistant.getMaternalLastName()).toBe('Martínez');
      expect(assistant.getEmail()).toBe('maria@hospital.com');
      expect(assistant.getPassword()).toBe('assistant123');
    });

    it('should inherit from Person and format full name correctly', () => {
      expect(assistant.getFullName()).toBe('María González Martínez');
    });

    it('should be valid when all required fields are provided', () => {
      expect(assistant.isValid()).toBe(true);
    });

    it('should be invalid when required fields are empty', () => {
      const invalidAssistant = new Assistant(
        '',
        'González',
        'Martínez',
        'maria@hospital.com',
        'assistant123'
      );
      expect(invalidAssistant.isValid()).toBe(false);
    });

    it('should be invalid when email is empty', () => {
      const invalidAssistant = new Assistant(
        'María',
        'González',
        'Martínez',
        '',
        'assistant123'
      );
      expect(invalidAssistant.isValid()).toBe(false);
    });

    it('should be invalid when password is empty', () => {
      const invalidAssistant = new Assistant(
        'María',
        'González',
        'Martínez',
        'maria@hospital.com',
        ''
      );
      expect(invalidAssistant.isValid()).toBe(false);
    });
  });

  describe('Patient Registration', () => {
    it('should register a valid patient', () => {
      const validPatient = new Patient(
        'Juan',
        'Pérez',
        'García',
        'juan@test.com',
        'password123',
        '12345678-9',
        new Date('1990-01-01'),
        '56912345678',
        'Av. Principal 123',
        Gender.Male
      );

      const result = assistant.registerPatient(validPatient);

      expect(result).toBe(true);
    });

    it('should not register an invalid patient with empty name', () => {
      const invalidPatient = new Patient(
        '',
        'Pérez',
        'García',
        'juan@test.com',
        'password123',
        '12345678-9',
        new Date('1990-01-01'),
        '56912345678',
        'Av. Principal 123',
        Gender.Male
      );

      const result = assistant.registerPatient(invalidPatient);

      expect(result).toBe(false);
    });

    it('should not register patient with invalid email', () => {
      const invalidPatient = new Patient(
        'Juan',
        'Pérez',
        'García',
        'invalid-email',
        'password123',
        '12345678-9',
        new Date('1990-01-01'),
        '56912345678',
        'Av. Principal 123',
        Gender.Male
      );

      const result = assistant.registerPatient(invalidPatient);

      expect(result).toBe(false);
    });

    it('should not register patient with empty RUT', () => {
      const invalidPatient = new Patient(
        'Juan',
        'Pérez',
        'García',
        'juan@test.com',
        'password123',
        '',
        new Date('1990-01-01'),
        '56912345678',
        'Av. Principal 123',
        Gender.Male
      );

      const result = assistant.registerPatient(invalidPatient);

      expect(result).toBe(false);
    });

    it('should register female patient successfully', () => {
      const femalePatient = new Patient(
        'Ana',
        'López',
        'Silva',
        'ana@test.com',
        'password456',
        '98765432-1',
        new Date('1985-05-15'),
        '56987654321',
        'Calle Falsa 456',
        Gender.Female
      );

      const result = assistant.registerPatient(femalePatient);

      expect(result).toBe(true);
    });

    it('should handle multiple patient registrations', () => {
      const patient1 = new Patient(
        'Carlos',
        'Rodríguez',
        'Martín',
        'carlos@test.com',
        'password789',
        '11111111-1',
        new Date('1995-03-20'),
        '56911111111',
        'Av. Los Libertadores 789',
        Gender.Male
      );

      const patient2 = new Patient(
        'Laura',
        'Fernández',
        'Castro',
        'laura@test.com',
        'password000',
        '22222222-2',
        new Date('1988-08-08'),
        '56922222222',
        'Pasaje Los Olivos 321',
        Gender.Female
      );

      const result1 = assistant.registerPatient(patient1);
      const result2 = assistant.registerPatient(patient2);

      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });
  });

  describe('Setters and Getters', () => {
    it('should update name correctly', () => {
      assistant.setName('Carmen');
      expect(assistant.getName()).toBe('Carmen');
      expect(assistant.getFullName()).toBe('Carmen González Martínez');
    });

    it('should update email correctly', () => {
      assistant.setEmail('carmen@hospital.com');
      expect(assistant.getEmail()).toBe('carmen@hospital.com');
    });

    it('should update paternal last name correctly', () => {
      assistant.setPaternalLastName('Silva');
      expect(assistant.getPaternalLastName()).toBe('Silva');
      expect(assistant.getFullName()).toBe('María Silva Martínez');
    });

    it('should update maternal last name correctly', () => {
      assistant.setMaternalLastName('Castro');
      expect(assistant.getMaternalLastName()).toBe('Castro');
      expect(assistant.getFullName()).toBe('María González Castro');
    });

    it('should update password correctly', () => {
      assistant.setPassword('newAssistantPassword123');
      expect(assistant.getPassword()).toBe('newAssistantPassword123');
    });
  });
});
