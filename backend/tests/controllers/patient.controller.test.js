const patientController = require("../../src/controllers/patient.controller");
const Patient = require("../../src/models/patient.model");
const db = require("../../src/config/db.config");

// Mock del modelo Patient
jest.mock("../../src/models/patient.model");
jest.mock("../../src/config/db.config");

describe("Patient Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      body: {},
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe("getAllPatients", () => {
    it("debería devolver todos los pacientes activos por defecto", async () => {
      const mockPatients = [
        { id: 1, name: "Juan Pérez", active: true },
        { id: 2, name: "María García", active: true },
      ];
      Patient.getAll.mockResolvedValue(mockPatients);

      await patientController.getAllPatients(req, res);

      expect(Patient.getAll).toHaveBeenCalledWith(false);
      expect(res.json).toHaveBeenCalledWith(mockPatients);
    });

    it("debería incluir pacientes inactivos cuando se especifica", async () => {
      req.query.includeInactive = "true";
      const mockPatients = [
        { id: 1, name: "Juan Pérez", active: true },
        { id: 2, name: "María García", active: false },
      ];
      Patient.getAll.mockResolvedValue(mockPatients);

      await patientController.getAllPatients(req, res);

      expect(Patient.getAll).toHaveBeenCalledWith(true);
      expect(res.json).toHaveBeenCalledWith(mockPatients);
    });

    it("debería manejar errores correctamente", async () => {
      const errorMessage = "Error de base de datos";
      Patient.getAll.mockRejectedValue(new Error(errorMessage));

      await patientController.getAllPatients(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe("createPatient", () => {
    it("debería crear un nuevo paciente exitosamente", async () => {
      const newPatientData = {
        rut: "12345678-9",
        name: "Juan Pérez",
        email: "juan@email.com",
      };
      const newPatientId = 1;

      req.body = newPatientData;
      Patient.create.mockResolvedValue(newPatientId);

      await patientController.createPatient(req, res);

      expect(Patient.create).toHaveBeenCalledWith(newPatientData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: newPatientId,
        ...newPatientData,
      });
    });

    it("debería manejar errores de creación", async () => {
      const patientData = { name: "Juan Pérez" };
      const errorMessage = "RUT duplicado";

      req.body = patientData;
      Patient.create.mockRejectedValue(new Error(errorMessage));

      await patientController.createPatient(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: errorMessage,
        stack: expect.any(String),
      });
    });
  });

  describe("checkRutExists", () => {
    it("debería devolver true cuando el RUT existe", async () => {
      const mockPatient = { id: 1, rut: "12345678-9", name: "Juan Pérez" };
      req.query.rut = "12345678-9";

      Patient.getByRut.mockResolvedValue([mockPatient]);

      await patientController.checkRutExists(req, res);

      expect(Patient.getByRut).toHaveBeenCalledWith("12345678-9");
      expect(res.json).toHaveBeenCalledWith({
        exists: true,
        patient: mockPatient,
      });
    });

    it("debería devolver false cuando el RUT no existe", async () => {
      req.query.rut = "99999999-9";

      Patient.getByRut.mockResolvedValue([]);

      await patientController.checkRutExists(req, res);

      expect(res.json).toHaveBeenCalledWith({ exists: false });
    });

    it("debería buscar en inactivos cuando se especifica includeInactive", async () => {
      req.query.rut = "12345678-9";
      req.query.includeInactive = "true";

      Patient.getByRutIncludeInactive.mockResolvedValue([]);

      await patientController.checkRutExists(req, res);

      expect(Patient.getByRutIncludeInactive).toHaveBeenCalledWith(
        "12345678-9"
      );
    });
  });

  describe("updatePatient", () => {
    it("debería actualizar un paciente existente", async () => {
      const updateData = { name: "Juan Pérez Actualizado" };
      req.params.id = "1";
      req.body = updateData;

      Patient.update.mockResolvedValue(1); // 1 fila afectada

      await patientController.updatePatient(req, res);

      expect(Patient.update).toHaveBeenCalledWith("1", updateData);
      expect(res.json).toHaveBeenCalledWith({
        message: "Paciente actualizado exitosamente",
        ...updateData,
      });
    });

    it("debería devolver 404 cuando el paciente no existe", async () => {
      req.params.id = "999";
      req.body = { name: "Test" };

      Patient.update.mockResolvedValue(0); // 0 filas afectadas

      await patientController.updatePatient(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Paciente no encontrado",
      });
    });
  });

  describe("deactivatePatient", () => {
    it("debería desactivar un paciente activo", async () => {
      const mockPatient = { id: 1, active: 1 };
      req.params.id = "1";

      Patient.getById.mockResolvedValue([mockPatient]);
      Patient.deactivate.mockResolvedValue(1);

      await patientController.deactivatePatient(req, res);

      expect(Patient.getById).toHaveBeenCalledWith("1", true);
      expect(Patient.deactivate).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith({
        message: "Paciente desactivado exitosamente",
        patientId: "1",
        deactivated: true,
      });
    });

    it("debería devolver error si el paciente ya está desactivado", async () => {
      const mockPatient = { id: 1, active: 0 };
      req.params.id = "1";

      Patient.getById.mockResolvedValue([mockPatient]);

      await patientController.deactivatePatient(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "El paciente ya está desactivado",
      });
    });

    it("debería devolver 404 si el paciente no existe", async () => {
      req.params.id = "999";

      Patient.getById.mockResolvedValue([]);

      await patientController.deactivatePatient(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Paciente no encontrado",
      });
    });
  });

  describe("deletePatient", () => {
    beforeEach(() => {
      db.query = jest.fn();
    });

    it("debería eliminar permanentemente un paciente desactivado sin citas", async () => {
      const mockPatient = { id: 1, active: 0 };
      req.params.id = "1";

      Patient.getById.mockResolvedValue([mockPatient]);
      db.query.mockResolvedValue([[{ count: 0 }]]); // Sin citas
      Patient.delete.mockResolvedValue(1);

      await patientController.deletePatient(req, res);

      expect(Patient.delete).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith({
        message: "Paciente eliminado permanentemente",
        deletedId: "1",
      });
    });

    it("debería rechazar eliminar un paciente activo", async () => {
      const mockPatient = { id: 1, active: 1 };
      req.params.id = "1";

      Patient.getById.mockResolvedValue([mockPatient]);

      await patientController.deletePatient(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message:
          "Debe desactivar el paciente antes de eliminarlo permanentemente",
        suggestion: "Use la función de desactivar en su lugar",
      });
    });

    it("debería rechazar eliminar un paciente con citas", async () => {
      const mockPatient = { id: 1, active: 0 };
      req.params.id = "1";

      Patient.getById.mockResolvedValue([mockPatient]);
      db.query.mockResolvedValue([[{ count: 3 }]]); // Tiene 3 citas

      await patientController.deletePatient(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message:
          "No se puede eliminar permanentemente el paciente porque tiene citas médicas asociadas",
        appointmentCount: 3,
        suggestion:
          "Mantenga el paciente desactivado para preservar el historial médico",
      });
    });
  });

  describe("searchPatientByEmail", () => {
    it("debería buscar paciente por email exitosamente", async () => {
      const mockPatients = [{ id: 1, email: "test@email.com" }];
      req.query.email = "test@email.com";

      Patient.getByEmail.mockResolvedValue(mockPatients);

      await patientController.searchPatientByEmail(req, res);

      expect(Patient.getByEmail).toHaveBeenCalledWith("test@email.com");
      expect(res.json).toHaveBeenCalledWith(mockPatients);
    });

    it("debería devolver error 400 si no se proporciona email", async () => {
      req.query.email = "";

      await patientController.searchPatientByEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Parámetro "email" es requerido',
      });
    });

    it("debería devolver array vacío si no encuentra el email", async () => {
      req.query.email = "noexiste@email.com";

      Patient.getByEmail.mockResolvedValue([]);

      await patientController.searchPatientByEmail(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });
  });

  describe("getPatientById", () => {
    it("debería devolver un paciente por ID", async () => {
      const mockPatient = { id: 1, name: "Juan Pérez" };
      req.params.id = "1";

      Patient.getById.mockResolvedValue([mockPatient]);

      await patientController.getPatientById(req, res);

      expect(Patient.getById).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith(mockPatient);
    });

    it("debería devolver 404 si el paciente no existe", async () => {
      req.params.id = "999";

      Patient.getById.mockResolvedValue([]);

      await patientController.getPatientById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Paciente no encontrado",
      });
    });
  });
});
