const Patient = require("../../src/models/patient.model");
const db = require("../../src/config/db.config");

// Mock de la base de datos
jest.mock("../../src/config/db.config");

describe("Patient Model", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("debería obtener solo pacientes activos por defecto", async () => {
      const mockPatients = [
        { id: 1, name: "Juan Pérez", active: 1 },
        { id: 2, name: "Ana García", active: 1 },
      ];
      db.query.mockResolvedValue([mockPatients]);

      const result = await Patient.getAll();

      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM patients WHERE active = 1 ORDER BY name ASC"
      );
      expect(result).toEqual(mockPatients);
    });

    it("debería incluir pacientes inactivos cuando se especifica", async () => {
      const mockPatients = [
        { id: 1, name: "Juan Pérez", active: 1 },
        { id: 2, name: "Ana García", active: 0 },
      ];
      db.query.mockResolvedValue([mockPatients]);

      const result = await Patient.getAll(true);

      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM patients ORDER BY active DESC, name ASC"
      );
      expect(result).toEqual(mockPatients);
    });
  });

  describe("getByEmail", () => {
    it("debería buscar paciente por email", async () => {
      const mockPatient = [{ id: 1, email: "juan@email.com", active: 1 }];
      db.query.mockResolvedValue([mockPatient]);

      const result = await Patient.getByEmail("juan@email.com");

      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM patients WHERE email = ? AND active = 1",
        ["juan@email.com"]
      );
      expect(result).toEqual(mockPatient);
    });
  });

  describe("getByRut", () => {
    it("debería buscar paciente activo por RUT", async () => {
      const mockPatient = [{ id: 1, rut: "12345678-9", active: 1 }];
      db.query.mockResolvedValue([mockPatient]);

      const result = await Patient.getByRut("12345678-9");

      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM patients WHERE rut = ? AND active = 1",
        ["12345678-9"]
      );
      expect(result).toEqual(mockPatient);
    });
  });

  describe("getByRutIncludeInactive", () => {
    it("debería buscar paciente por RUT incluyendo inactivos", async () => {
      const mockPatient = [{ id: 1, rut: "12345678-9", active: 0 }];
      db.query.mockResolvedValue([mockPatient]);

      const result = await Patient.getByRutIncludeInactive("12345678-9");

      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM patients WHERE rut = ?",
        ["12345678-9"]
      );
      expect(result).toEqual(mockPatient);
    });
  });

  describe("getById", () => {
    it("debería obtener paciente activo por ID por defecto", async () => {
      const mockPatient = [{ id: 1, name: "Juan Pérez", active: 1 }];
      db.query.mockResolvedValue([mockPatient]);

      const result = await Patient.getById(1);

      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM patients WHERE id = ? AND active = 1",
        [1]
      );
      expect(result).toEqual(mockPatient);
    });

    it("debería incluir pacientes inactivos cuando se especifica", async () => {
      const mockPatient = [{ id: 1, name: "Juan Pérez", active: 0 }];
      db.query.mockResolvedValue([mockPatient]);

      const result = await Patient.getById(1, true);

      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM patients WHERE id = ?",
        [1]
      );
      expect(result).toEqual(mockPatient);
    });
  });

  describe("create", () => {
    it("debería crear un nuevo paciente exitosamente", async () => {
      const patientData = {
        name: "Juan",
        paternalLastName: "Pérez",
        maternalLastName: "González",
        email: "juan@email.com",
        password: "password123",
        rut: "12345678-9",
        birthDate: "1990-01-01",
        phone: "123456789",
        address: "Calle 123",
        gender: "M",
      };
      const mockResult = { insertId: 1 };
      db.query.mockResolvedValue([mockResult]);

      const result = await Patient.create(patientData);

      expect(db.query).toHaveBeenCalledWith(
        "INSERT INTO patients (name, paternalLastName, maternalLastName, email, password, rut, birthDate, phone, address, gender, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)",
        [
          "Juan",
          "Pérez",
          "González",
          "juan@email.com",
          "password123",
          "12345678-9",
          "1990-01-01",
          "123456789",
          "Calle 123",
          "M",
        ]
      );
      expect(result).toBe(1);
    });

    it("debería manejar fechas con formato ISO", async () => {
      const patientData = {
        name: "Juan",
        paternalLastName: "Pérez",
        maternalLastName: "González",
        email: "juan@email.com",
        password: "password123",
        rut: "12345678-9",
        birthDate: "1990-01-01T00:00:00.000Z",
        phone: "123456789",
        address: "Calle 123",
        gender: "M",
      };
      const mockResult = { insertId: 1 };
      db.query.mockResolvedValue([mockResult]);

      await Patient.create(patientData);

      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(["1990-01-01"]) // Fecha formateada sin la hora
      );
    });

    it("debería propagar errores de base de datos", async () => {
      const patientData = { name: "Test" };
      const dbError = new Error("RUT duplicado");
      db.query.mockRejectedValue(dbError);

      await expect(Patient.create(patientData)).rejects.toThrow(
        "RUT duplicado"
      );
    });
  });

  describe("update", () => {
    it("debería actualizar un paciente sin cambiar el estado active", async () => {
      const updateData = {
        name: "Juan Carlos",
        paternalLastName: "Pérez",
        maternalLastName: "González",
        email: "juan@email.com",
        password: "newpassword",
        birthDate: "1990-01-01",
        phone: "987654321",
        address: "Nueva Calle 456",
        gender: "M",
      };
      const mockResult = { affectedRows: 1 };
      db.query.mockResolvedValue([mockResult]);

      const result = await Patient.update(1, updateData);

      expect(db.query).toHaveBeenCalledWith(
        "UPDATE patients SET name = ?, paternalLastName = ?, maternalLastName = ?, email = ?, password = ?, birthDate = ?, phone = ?, address = ?, gender = ? WHERE id = ?",
        [
          "Juan Carlos",
          "Pérez",
          "González",
          "juan@email.com",
          "newpassword",
          "1990-01-01",
          "987654321",
          "Nueva Calle 456",
          "M",
          1,
        ]
      );
      expect(result).toBe(1);
    });

    it("debería actualizar incluyendo el estado active cuando se especifica", async () => {
      const updateData = {
        name: "Juan Carlos",
        paternalLastName: "Pérez",
        maternalLastName: "González",
        email: "juan@email.com",
        password: "newpassword",
        birthDate: "1990-01-01",
        phone: "987654321",
        address: "Nueva Calle 456",
        gender: "M",
        active: 0,
      };
      const mockResult = { affectedRows: 1 };
      db.query.mockResolvedValue([mockResult]);

      const result = await Patient.update(1, updateData);

      expect(db.query).toHaveBeenCalledWith(
        "UPDATE patients SET name = ?, paternalLastName = ?, maternalLastName = ?, email = ?, password = ?, birthDate = ?, phone = ?, address = ?, gender = ?, active = ? WHERE id = ?",
        [
          "Juan Carlos",
          "Pérez",
          "González",
          "juan@email.com",
          "newpassword",
          "1990-01-01",
          "987654321",
          "Nueva Calle 456",
          "M",
          0,
          1,
        ]
      );
      expect(result).toBe(1);
    });

    it("debería manejar fechas con formato ISO en actualización", async () => {
      const updateData = {
        name: "Juan",
        paternalLastName: "Pérez",
        maternalLastName: "González",
        email: "juan@email.com",
        password: "password",
        birthDate: "1990-01-01T10:30:00.000Z",
        phone: "123456789",
        address: "Calle 123",
        gender: "M",
      };
      const mockResult = { affectedRows: 1 };
      db.query.mockResolvedValue([mockResult]);

      await Patient.update(1, updateData);

      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(["1990-01-01"]) // Fecha formateada sin la hora
      );
    });
  });

  describe("deactivate", () => {
    it("debería desactivar un paciente", async () => {
      const mockResult = { affectedRows: 1 };
      db.query.mockResolvedValue([mockResult]);

      const result = await Patient.deactivate(1);

      expect(db.query).toHaveBeenCalledWith(
        "UPDATE patients SET active = 0 WHERE id = ?",
        [1]
      );
      expect(result).toBe(1);
    });

    it("debería propagar errores de base de datos", async () => {
      const dbError = new Error("Error de conexión");
      db.query.mockRejectedValue(dbError);

      await expect(Patient.deactivate(1)).rejects.toThrow("Error de conexión");
    });
  });

  describe("reactivate", () => {
    it("debería reactivar un paciente", async () => {
      const mockResult = { affectedRows: 1 };
      db.query.mockResolvedValue([mockResult]);

      const result = await Patient.reactivate(1);

      expect(db.query).toHaveBeenCalledWith(
        "UPDATE patients SET active = 1 WHERE id = ?",
        [1]
      );
      expect(result).toBe(1);
    });

    it("debería propagar errores de base de datos", async () => {
      const dbError = new Error("Error de conexión");
      db.query.mockRejectedValue(dbError);

      await expect(Patient.reactivate(1)).rejects.toThrow("Error de conexión");
    });
  });

  describe("delete", () => {
    it("debería eliminar permanentemente un paciente", async () => {
      const mockResult = { affectedRows: 1 };
      db.query.mockResolvedValue([mockResult]);

      const result = await Patient.delete(1);

      expect(db.query).toHaveBeenCalledWith(
        "DELETE FROM patients WHERE id = ?",
        [1]
      );
      expect(result).toBe(1);
    });

    it("debería propagar errores de base de datos", async () => {
      const dbError = new Error("Error al eliminar");
      db.query.mockRejectedValue(dbError);

      await expect(Patient.delete(1)).rejects.toThrow("Error al eliminar");
    });
  });
});
