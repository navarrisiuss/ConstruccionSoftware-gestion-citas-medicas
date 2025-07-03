import { Admin } from './admin.model';
import { Physician } from './physician.model';
import { Assistant } from './assistant.model';

describe('Admin Model', () => {
  let admin: Admin;

  beforeEach(() => {
    admin = new Admin(
      'Carlos',
      'Rodríguez',
      'López',
      'admin@hospital.com',
      'admin123'
    );
  });

  describe('Constructor and Basic Properties', () => {
    it('should create an admin with all properties', () => {
      expect(admin.getName()).toBe('Carlos');
      expect(admin.getPaternalLastName()).toBe('Rodríguez');
      expect(admin.getMaternalLastName()).toBe('López');
      expect(admin.getEmail()).toBe('admin@hospital.com');
      expect(admin.getPassword()).toBe('admin123');
    });

    it('should inherit from Person and format full name correctly', () => {
      expect(admin.getFullName()).toBe('Carlos Rodríguez López');
    });

    it('should be valid when all required fields are provided', () => {
      expect(admin.isValid()).toBe(true);
    });

    it('should be invalid when required fields are empty', () => {
      const invalidAdmin = new Admin(
        '',
        'Rodríguez',
        'López',
        'admin@hospital.com',
        'admin123'
      );
      expect(invalidAdmin.isValid()).toBe(false);
    });
  });

  describe('Physician Management', () => {
    it('should register physician with valid data', () => {
      const physician = new Physician(
        'Dr. Juan',
        'Pérez',
        'González',
        'juan@hospital.com',
        'password123',
        'Cardiología'
      );

      const result = admin.registerPhysician(physician);
      expect(result).toBe(true);
    });

    it('should not register physician with invalid email', () => {
      const physician = new Physician(
        'Dr. Juan',
        'Pérez',
        'González',
        'invalid-email', // Invalid email
        'password123',
        'Cardiología'
      );

      const result = admin.registerPhysician(physician);
      expect(result).toBe(false); // Should be false because email is invalid
    });

    it('should not register physician with empty specialty', () => {
      const physician = new Physician(
        'Dr. Juan',
        'Pérez',
        'González',
        'juan@hospital.com',
        'password123',
        '' // Empty specialty
      );

      const result = admin.registerPhysician(physician);
      expect(result).toBe(false);
    });
  });

  describe('Assistant Management', () => {
    it('should register assistant with valid data', () => {
      const assistant = new Assistant(
        'Ana',
        'García',
        'López',
        'ana@hospital.com',
        'password123'
      );

      const result = admin.registerAssistant(assistant);
      expect(result).toBe(true);
    });

    it('should not register assistant with invalid email', () => {
      const assistant = new Assistant(
        'Ana',
        'García',
        'López',
        'invalid-email', // Invalid email
        'password123'
      );

      const result = admin.registerAssistant(assistant);
      expect(result).toBe(false); // Should be false because email is invalid
    });
  });

  describe('Administrative Functions', () => {
    it('should generate reports', () => {
      const report = admin.generateReport('monthly');

      expect(report).toBeDefined();
      expect(typeof report).toBe('object');
    });

    it('should be able to manage appointments', () => {
      const canManage = admin.manageAppointments();

      expect(canManage).toBe(true);
    });

    it('should be able to view medical history', () => {
      const canView = admin.viewMedicalHistory();

      expect(canView).toBe(true);
    });

    it('should generate different types of reports', () => {
      const monthlyReport = admin.generateReport('monthly');
      const weeklyReport = admin.generateReport('weekly');
      const customReport = admin.generateReport('custom');

      expect(monthlyReport).toBeDefined();
      expect(weeklyReport).toBeDefined();
      expect(customReport).toBeDefined();
    });
  });

  describe('Setters and Getters', () => {
    it('should update name correctly', () => {
      admin.setName('Luis');
      expect(admin.getName()).toBe('Luis');
      expect(admin.getFullName()).toBe('Luis Rodríguez López');
    });

    it('should update email correctly', () => {
      admin.setEmail('luis@hospital.com');
      expect(admin.getEmail()).toBe('luis@hospital.com');
    });

    it('should update paternal last name correctly', () => {
      admin.setPaternalLastName('Silva');
      expect(admin.getPaternalLastName()).toBe('Silva');
      expect(admin.getFullName()).toBe('Carlos Silva López');
    });

    it('should update maternal last name correctly', () => {
      admin.setMaternalLastName('Castro');
      expect(admin.getMaternalLastName()).toBe('Castro');
      expect(admin.getFullName()).toBe('Carlos Rodríguez Castro');
    });

    it('should update password correctly', () => {
      admin.setPassword('newAdminPassword123');
      expect(admin.getPassword()).toBe('newAdminPassword123');
    });
  });
});
